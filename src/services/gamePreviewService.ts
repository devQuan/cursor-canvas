import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { EngineDetector } from './engineDetector';
import { FileWatcher } from './fileWatcher';
import { MessageBridge } from './messageBridge';
import { PortDetector } from './portDetector';
import type { GameEngine, SceneObject, Track } from '../types';

const DEFAULT_SCENE_GRAPH_PATH = '.cursor-canvas/scene-graph.json';

export class GamePreviewService {
  private readonly engineDetector = new EngineDetector();
  private readonly portDetector = new PortDetector();
  private readonly fileWatcher = new FileWatcher();
  private readonly bridge = new MessageBridge();
  private sceneGraphDisposable: vscode.Disposable | undefined;
  private activeEngine: GameEngine | null = null;
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

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
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
    const sceneGraphPath =
      config.get<string>('sceneGraphPath') ?? DEFAULT_SCENE_GRAPH_PATH;
    const portOverride = config.get<number | null>('portOverride') ?? null;

    try {
      const detection = await this.engineDetector.detect(
        workspaceFolder.uri.fsPath,
        unityWebGlPath,
      );
      this.activeEngine = detection.engine;

      if (detection.engine === 'unity-webgl' && detection.unityBuildIndexPath) {
        const previewUri = panel.webview.asWebviewUri(
          vscode.Uri.file(detection.unityBuildIndexPath),
        );
        this.bridge.send(panel, {
          type: 'ENGINE_DETECTED',
          engine: detection.engine,
          previewUrl: previewUri.toString(),
        });
      } else if (detection.engine === 'generic-iframe') {
        const detectedPort = await this.portDetector.detect(
          workspaceFolder.uri.fsPath,
          portOverride,
        );
        const port = detectedPort?.port ?? portOverride ?? 5173;
        this.bridge.send(panel, {
          type: 'ENGINE_DETECTED',
          engine: detection.engine,
          port,
          previewUrl: `http://localhost:${port}`,
        });
      } else {
        this.bridge.send(panel, {
          type: 'ENGINE_DETECTED',
          engine: detection.engine,
        });
      }

      await this.loadSceneGraph(panel, workspaceFolder.uri.fsPath, sceneGraphPath);
      this.sceneGraphDisposable = this.fileWatcher.watchSceneGraph(
        path.join(workspaceFolder.uri.fsPath, sceneGraphPath),
        () => {
          void this.loadSceneGraph(
            panel,
            workspaceFolder.uri.fsPath,
            sceneGraphPath,
          );
        },
      );
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

  private async loadSceneGraph(
    panel: vscode.WebviewPanel,
    workspacePath: string,
    sceneGraphPath: string,
  ): Promise<void> {
    const absolutePath = path.join(workspacePath, sceneGraphPath);

    try {
      const raw = await fs.readFile(absolutePath, 'utf8');
      const objects = parseSceneGraph(raw);
      this.bridge.send(panel, {
        type: 'SCENE_UPDATED',
        objects,
        engine: this.activeEngine ?? 'threejs',
      });
    } catch {
      this.bridge.send(panel, {
        type: 'SCENE_UPDATED',
        objects: [],
        engine: this.activeEngine ?? 'threejs',
      });
    }
  }

  private stop(): void {
    this.sceneGraphDisposable?.dispose();
    this.sceneGraphDisposable = undefined;
    this.activeEngine = null;
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
