import * as vscode from 'vscode';
import { FileWatcher } from './fileWatcher';
import { MessageBridge } from './messageBridge';
import { TrackResolver } from './trackResolver';
import type { CanvasSettings, Track } from '../types';

const MANUAL_TRACK_KEY = 'cursorCanvas.manualTrack';
const AMBIGUOUS_FALLBACK_KEY = 'cursorCanvas.ambiguousFallback';

export class TrackDetectionService {
  private readonly resolver = new TrackResolver();
  private readonly fileWatcher = new FileWatcher();
  private readonly bridge = new MessageBridge();
  private workspaceWatchDisposable: vscode.Disposable | undefined;
  private isPromptingAmbiguous = false;

  constructor(private readonly context: vscode.ExtensionContext) {}

  start(panel: vscode.WebviewPanel): void {
    this.workspaceWatchDisposable?.dispose();

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      this.bridge.send(panel, {
        type: 'ERROR',
        service: 'trackResolver',
        message: 'Open a workspace folder to enable auto-detection.',
        recoverable: true,
      });
      return;
    }

    this.workspaceWatchDisposable = this.fileWatcher.watchWorkspace(
      workspaceFolder.uri.fsPath,
      () => {
        void this.runAutoDetect(panel);
      },
    );
  }

  async sendInitialState(
    panel: vscode.WebviewPanel,
    settings: CanvasSettings,
  ): Promise<void> {
    this.bridge.send(panel, {
      type: 'SETTINGS_UPDATED',
      settings,
    });

    this.bridge.send(panel, {
      type: 'BRIDGE_READY',
      message: 'Message bridge connected',
    });

    await this.runAutoDetect(panel);
  }

  async runAutoDetect(panel: vscode.WebviewPanel): Promise<void> {
    const manualTrack = this.context.workspaceState.get<Track>(MANUAL_TRACK_KEY);
    if (manualTrack) {
      this.emitTrackChanged(panel, manualTrack, 'manual', 'high');
      return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return;
    }

    const settings = this.getSettings();

    try {
      const result = await this.resolver.resolve(
        workspaceFolder.uri.fsPath,
        settings.outputFolder,
      );

      if (result === 'ambiguous') {
        await this.handleAmbiguous(panel);
        return;
      }

      this.emitTrackChanged(panel, result, 'auto', 'high');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Auto-detection failed';
      this.bridge.send(panel, {
        type: 'ERROR',
        service: 'trackResolver',
        message,
        recoverable: true,
      });
    }
  }

  async setManualOverride(
    panel: vscode.WebviewPanel,
    track: Track,
  ): Promise<void> {
    await this.context.workspaceState.update(MANUAL_TRACK_KEY, track);
    this.emitTrackChanged(panel, track, 'manual', 'high');
  }

  async clearManualOverride(panel: vscode.WebviewPanel): Promise<void> {
    await this.context.workspaceState.update(MANUAL_TRACK_KEY, undefined);
    await this.runAutoDetect(panel);
  }

  dispose(): void {
    this.workspaceWatchDisposable?.dispose();
    this.workspaceWatchDisposable = undefined;
    this.fileWatcher.dispose();
    this.resolver.dispose();
  }

  private getSettings(): CanvasSettings {
    const config = vscode.workspace.getConfiguration('cursorCanvas');
    return {
      outputFolder: config.get<string | null>('outputFolder') ?? null,
      estimatedFrameCount: config.get<number>('estimatedFrameCount') ?? 60,
      portOverride: config.get<number | null>('portOverride') ?? null,
      framePollingIntervalMs:
        config.get<number>('framePollingIntervalMs') ?? 1000,
    };
  }

  private emitTrackChanged(
    panel: vscode.WebviewPanel,
    track: Track,
    mode: 'auto' | 'manual',
    confidence: 'high' | 'low',
  ): void {
    this.bridge.send(panel, {
      type: 'TRACK_CHANGED',
      track,
      mode,
      confidence,
    });
  }

  private async handleAmbiguous(panel: vscode.WebviewPanel): Promise<void> {
    const savedFallback = this.context.workspaceState.get<Track>(
      AMBIGUOUS_FALLBACK_KEY,
    );

    if (savedFallback) {
      this.emitTrackChanged(panel, savedFallback, 'auto', 'low');
      return;
    }

    if (this.isPromptingAmbiguous) {
      this.emitTrackChanged(panel, 'app', 'auto', 'low');
      return;
    }

    this.isPromptingAmbiguous = true;

    try {
      const selection = await vscode.window.showQuickPick(
        [
          { label: 'App', description: 'Web app / localhost preview', track: 'app' as Track },
          { label: 'Game', description: 'Three.js, Unity, or game engine', track: 'game' as Track },
          { label: 'Video', description: 'Frame strip / video generation', track: 'video' as Track },
        ],
        {
          title: 'Cursor Canvas — could not detect project type',
          placeHolder: 'Choose a preview track for this workspace',
        },
      );

      const track = selection?.track ?? 'app';
      await this.context.workspaceState.update(AMBIGUOUS_FALLBACK_KEY, track);
      this.emitTrackChanged(panel, track, 'auto', 'low');
    } finally {
      this.isPromptingAmbiguous = false;
    }
  }
}
