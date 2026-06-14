import * as path from 'path';
import * as vscode from 'vscode';
import {
  findLatestVideoFile,
  frameTimestamp,
  listFrameFiles,
  parseFrameIndex,
} from './frameDetector';
import { FileWatcher } from './fileWatcher';
import { MessageBridge } from './messageBridge';
import { resolveVideoOutputDir } from './outputDirResolver';
import type { Track } from '../types';

const DEFAULT_FPS = 24;

export class VideoPreviewService {
  private readonly fileWatcher = new FileWatcher();
  private readonly bridge = new MessageBridge();
  private frameWatchDisposable: vscode.Disposable | undefined;
  private videoWatchDisposable: vscode.Disposable | undefined;
  private seenFrameIndexes = new Set<number>();
  private isActive = false;
  private lastVideoPath: string | null = null;

  async onTrackChanged(
    panel: vscode.WebviewPanel,
    track: Track,
  ): Promise<void> {
    this.isActive = track === 'video';

    if (!this.isActive) {
      this.stop();
      return;
    }

    await this.start(panel);
  }

  async refresh(panel: vscode.WebviewPanel): Promise<void> {
    if (!this.isActive) {
      return;
    }

    await this.start(panel);
  }

  async openOutputFile(): Promise<void> {
    if (!this.lastVideoPath) {
      return;
    }

    await vscode.env.openExternal(vscode.Uri.file(this.lastVideoPath));
  }

  dispose(): void {
    this.stop();
    this.fileWatcher.dispose();
  }

  private async start(panel: vscode.WebviewPanel): Promise<void> {
    this.stop();
    this.seenFrameIndexes.clear();
    this.lastVideoPath = null;

    const workspaceRoots =
      vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ??
      [];

    if (workspaceRoots.length === 0) {
      this.bridge.send(panel, {
        type: 'ERROR',
        service: 'fileWatcher',
        message: 'Open a workspace folder to watch video output.',
        recoverable: true,
      });
      return;
    }

    const settings = this.getSettings();

    let resolved;
    try {
      resolved = await resolveVideoOutputDir(workspaceRoots, settings);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to resolve output folder';
      this.bridge.send(panel, {
        type: 'ERROR',
        service: 'fileWatcher',
        message,
        recoverable: true,
      });
      return;
    }

    this.bridge.send(panel, {
      type: 'VIDEO_RESET',
      estimatedFrameCount: settings.estimatedFrameCount,
      outputDir: resolved.outputDir,
    });

    const existingFrames = await listFrameFiles(resolved.outputDir);
    for (const framePath of existingFrames) {
      this.emitFrameAdded(panel, framePath);
    }

    const latestVideo = await findLatestVideoFile(resolved.outputDir);
    if (latestVideo) {
      this.emitVideoReady(panel, latestVideo, this.seenFrameIndexes.size);
    }

    this.frameWatchDisposable = this.fileWatcher.watchFrames(
      resolved.outputDir,
      (framePath) => {
        this.emitFrameAdded(panel, framePath);
      },
    );

    this.videoWatchDisposable = this.fileWatcher.watchVideo(
      resolved.outputDir,
      (videoPath) => {
        this.emitVideoReady(panel, videoPath, this.seenFrameIndexes.size);
      },
    );
  }

  private emitFrameAdded(
    panel: vscode.WebviewPanel,
    framePath: string,
  ): void {
    const fileName = path.basename(framePath);
    const frameIndex = parseFrameIndex(fileName);
    if (frameIndex === null || this.seenFrameIndexes.has(frameIndex)) {
      return;
    }

    this.seenFrameIndexes.add(frameIndex);
    const frameUri = panel.webview.asWebviewUri(vscode.Uri.file(framePath));

    this.bridge.send(panel, {
      type: 'FRAME_ADDED',
      frameIndex,
      framePath: frameUri.toString(),
      timestamp: frameTimestamp(frameIndex, DEFAULT_FPS),
    });
  }

  private emitVideoReady(
    panel: vscode.WebviewPanel,
    videoPath: string,
    frameCount: number,
  ): void {
    this.lastVideoPath = videoPath;
    const videoUri = panel.webview.asWebviewUri(vscode.Uri.file(videoPath));

    this.bridge.send(panel, {
      type: 'VIDEO_READY',
      videoPath: videoUri.toString(),
      frameCount,
    });
  }

  private getSettings() {
    const config = vscode.workspace.getConfiguration('cursorCanvas');
    return {
      outputFolder: config.get<string | null>('outputFolder') ?? null,
      estimatedFrameCount: config.get<number>('estimatedFrameCount') ?? 60,
      portOverride: config.get<number | null>('portOverride') ?? null,
      framePollingIntervalMs:
        config.get<number>('framePollingIntervalMs') ?? 1000,
      sceneGraphPath:
        config.get<string>('sceneGraphPath') ?? '.cursor-canvas/scene-graph.json',
      unityWebGlPath: config.get<string | null>('unityWebGlPath') ?? null,
    };
  }

  private stop(): void {
    this.frameWatchDisposable?.dispose();
    this.videoWatchDisposable?.dispose();
    this.frameWatchDisposable = undefined;
    this.videoWatchDisposable = undefined;
    this.seenFrameIndexes.clear();
  }
}
