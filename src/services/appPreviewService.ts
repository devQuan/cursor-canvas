import * as vscode from 'vscode';
import { MessageBridge } from './messageBridge';
import { PortDetector } from './portDetector';
import type { Track } from '../types';

const HEALTH_CHECK_INTERVAL_MS = 2000;

export class AppPreviewService {
  private readonly portDetector = new PortDetector();
  private readonly bridge = new MessageBridge();
  private healthCheckTimer: ReturnType<typeof setInterval> | undefined;
  private hasBeenReady = false;

  async onTrackChanged(
    panel: vscode.WebviewPanel,
    track: Track,
  ): Promise<void> {
    if (track !== 'app') {
      this.stop();
      return;
    }

    await this.startDetection(panel);
  }

  async refresh(panel: vscode.WebviewPanel): Promise<void> {
    this.hasBeenReady = false;
    await this.startDetection(panel);
  }

  async openInBrowser(port: number): Promise<void> {
    await vscode.env.openExternal(
      vscode.Uri.parse(`http://localhost:${port}`),
    );
  }

  dispose(): void {
    this.stop();
    this.portDetector.dispose();
  }

  private async startDetection(panel: vscode.WebviewPanel): Promise<void> {
    this.stopHealthCheck();

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      this.bridge.send(panel, {
        type: 'ERROR',
        service: 'portDetector',
        message: 'Open a workspace folder to detect a dev server port.',
        recoverable: true,
      });
      return;
    }

    const portOverride = vscode.workspace
      .getConfiguration('cursorCanvas')
      .get<number | null>('portOverride');

    try {
      const detected = await this.portDetector.detect(
        workspaceFolder.uri.fsPath,
        portOverride,
      );

      if (!detected) {
        this.bridge.send(panel, {
          type: 'SERVER_STATUS',
          status: 'starting',
          port: 5173,
        });
        this.startHealthCheck(panel, 5173);
        return;
      }

      this.bridge.send(panel, {
        type: 'PORT_DETECTED',
        port: detected.port,
        source: detected.source,
      });

      await this.runHealthCheck(panel, detected.port);
      this.startHealthCheck(panel, detected.port);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Port detection failed';
      this.bridge.send(panel, {
        type: 'ERROR',
        service: 'portDetector',
        message,
        recoverable: true,
      });
    }
  }

  private startHealthCheck(
    panel: vscode.WebviewPanel,
    port: number,
  ): void {
    this.stopHealthCheck();
    this.healthCheckTimer = setInterval(() => {
      void this.runHealthCheck(panel, port);
    }, HEALTH_CHECK_INTERVAL_MS);
  }

  private async runHealthCheck(
    panel: vscode.WebviewPanel,
    port: number,
  ): Promise<void> {
    const isLive = await this.portDetector.ping(port);

    if (isLive) {
      this.hasBeenReady = true;
      this.bridge.send(panel, {
        type: 'SERVER_STATUS',
        status: 'ready',
        port,
      });
      return;
    }

    this.bridge.send(panel, {
      type: 'SERVER_STATUS',
      status: this.hasBeenReady ? 'unreachable' : 'starting',
      port,
    });
  }

  private stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  private stop(): void {
    this.stopHealthCheck();
    this.hasBeenReady = false;
  }
}
