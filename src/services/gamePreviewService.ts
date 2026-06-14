import * as fs from 'fs/promises';
import * as vscode from 'vscode';
import { EngineDetector } from './engineDetector';
import { FileWatcher } from './fileWatcher';
import { MessageBridge } from './messageBridge';
import { PortDetector } from './portDetector';
import { resolveSceneGraphPath } from './sceneGraphResolver';
import type { GameEngine, SceneObject, Track } from '../types';

export class GamePreviewService {
  private readonly engineDetector = new EngineDetector();
  private readonly portDetector = new PortDetector();
  private readonly fileWatcher = new FileWatcher();
  private readonly bridge = new MessageBridge();
  private sceneGraphDisposable: vscode.Disposable | undefined;
  private activeEngine: GameEngine | null = null;
  private activeSceneGraphPath: string | null = null;
  private isActive = false;

  async onTrackChanged(
    panel: vscode.WebviewPanel,
    track: Track,
  ): Promise<void> {
    this.isActive = track === 'game';

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

  dispose(): void {
    this.stop();
    this.engineDetector.dispose();
    this.portDetector.dispose();
    this.fileWatcher.dispose();
  }

  private async start(panel: vscode.WebviewPanel): Promise<void> {
    this.stop();

    const workspaceRoots =
      vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ??
      [];

    if (workspaceRoots.length === 0) {
      this.bridge.send(panel, {
        type: 'ERROR',
        service: 'engineDetector',
        message: 'Open a workspace folder to preview a game project.',
        recoverable: true,
      });
      return;
    }

    const config = vscode.workspace.getConfiguration('cursorCanvas');
    const unityWebGlPath = config.get<string | null>('unityWebGlPath') ?? null;
    const sceneGraphPathSetting = config.get<string>('sceneGraphPath') ?? null;
    const portOverride = config.get<number | null>('portOverride') ?? null;
    const primaryRoot = workspaceRoots[0];

    try {
      const detection = await this.engineDetector.detect(
        primaryRoot,
        unityWebGlPath,
      );
      this.activeEngine = detection.engine;

      if (detection.engine === 'unity-webgl' && detection.unityBuildIndexPath) {
        this.sendWebBuildPreview(panel, detection.engine, detection.unityBuildIndexPath);
      } else if (
        detection.engine === 'godot-webgl' &&
        detection.godotBuildIndexPath
      ) {
        this.sendWebBuildPreview(panel, detection.engine, detection.godotBuildIndexPath);
      } else if (
        detection.engine === 'unity' ||
        detection.engine === 'godot' ||
        detection.engine === 'generic-iframe'
      ) {
        await this.sendRuntimePreview(
          panel,
          detection.engine,
          primaryRoot,
          portOverride,
        );
      } else {
        this.bridge.send(panel, {
          type: 'ENGINE_DETECTED',
          engine: detection.engine,
        });
      }

      await this.watchSceneGraph(panel, workspaceRoots, sceneGraphPathSetting);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Game preview failed to start';
      this.bridge.send(panel, {
        type: 'ERROR',
        service: 'engineDetector',
        message,
        recoverable: true,
      });
    }
  }

  private sendWebBuildPreview(
    panel: vscode.WebviewPanel,
    engine: GameEngine,
    buildIndexPath: string,
  ): void {
    const previewUri = panel.webview.asWebviewUri(
      vscode.Uri.file(buildIndexPath),
    );
    this.bridge.send(panel, {
      type: 'ENGINE_DETECTED',
      engine,
      previewUrl: previewUri.toString(),
    });
  }

  private async sendRuntimePreview(
    panel: vscode.WebviewPanel,
    engine: GameEngine,
    workspacePath: string,
    portOverride: number | null,
  ): Promise<void> {
    const detectedPort = await this.portDetector.detect(
      workspacePath,
      portOverride,
    );
    const port = detectedPort?.port ?? portOverride ?? null;

    if (port) {
      this.bridge.send(panel, {
        type: 'ENGINE_DETECTED',
        engine,
        port,
        previewUrl: `http://localhost:${port}`,
      });
      return;
    }

    this.bridge.send(panel, {
      type: 'ENGINE_DETECTED',
      engine,
    });
  }

  private async watchSceneGraph(
    panel: vscode.WebviewPanel,
    workspaceRoots: string[],
    sceneGraphPathSetting: string | null,
  ): Promise<void> {
    this.activeSceneGraphPath = await resolveSceneGraphPath(
      workspaceRoots,
      sceneGraphPathSetting,
    );

    if (!this.activeSceneGraphPath) {
      this.bridge.send(panel, {
        type: 'SCENE_UPDATED',
        objects: [],
        engine: this.activeEngine ?? 'generic-iframe',
      });
      return;
    }

    await this.loadSceneGraph(panel, this.activeSceneGraphPath);
    this.sceneGraphDisposable = this.fileWatcher.watchSceneGraph(
      this.activeSceneGraphPath,
      () => {
        if (this.activeSceneGraphPath) {
          void this.loadSceneGraph(panel, this.activeSceneGraphPath);
        }
      },
    );
  }

  private async loadSceneGraph(
    panel: vscode.WebviewPanel,
    absolutePath: string,
  ): Promise<void> {
    try {
      const raw = await fs.readFile(absolutePath, 'utf8');
      const objects = parseSceneGraph(raw);
      this.bridge.send(panel, {
        type: 'SCENE_UPDATED',
        objects,
        engine: this.activeEngine ?? 'generic-iframe',
      });
    } catch {
      this.bridge.send(panel, {
        type: 'SCENE_UPDATED',
        objects: [],
        engine: this.activeEngine ?? 'generic-iframe',
      });
    }
  }

  private stop(): void {
    this.sceneGraphDisposable?.dispose();
    this.sceneGraphDisposable = undefined;
    this.activeEngine = null;
    this.activeSceneGraphPath = null;
  }
}

function parseSceneGraph(raw: string): SceneObject[] {
  const parsed = JSON.parse(raw) as unknown;

  if (Array.isArray(parsed)) {
    return parsed as SceneObject[];
  }

  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'objects' in parsed &&
    Array.isArray((parsed as { objects: unknown }).objects)
  ) {
    return (parsed as { objects: SceneObject[] }).objects;
  }

  return [];
}
