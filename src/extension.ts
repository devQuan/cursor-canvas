import * as vscode from 'vscode';
import { MessageBridge } from './services/messageBridge';
import { TrackDetectionService } from './services/trackDetectionService';
import type { CanvasSettings } from './types';

const PANEL_VIEW_TYPE = 'cursorCanvas.panel';

let activePanel: vscode.WebviewPanel | undefined;
let trackDetectionService: TrackDetectionService | undefined;
const messageBridge = new MessageBridge();

function getNonce(): string {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function getDefaultSettings(): CanvasSettings {
  const config = vscode.workspace.getConfiguration('cursorCanvas');
  return {
    outputFolder: config.get<string | null>('outputFolder') ?? null,
    estimatedFrameCount: config.get<number>('estimatedFrameCount') ?? 60,
    portOverride: config.get<number | null>('portOverride') ?? null,
    framePollingIntervalMs:
      config.get<number>('framePollingIntervalMs') ?? 1000,
  };
}

function getWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
): string {
  const nonce = getNonce();
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'webview.js'),
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'webview.css'),
  );

  const csp = [
    `default-src 'none'`,
    `script-src 'nonce-${nonce}' 'unsafe-eval'`,
    `style-src ${webview.cspSource} 'nonce-${nonce}' 'unsafe-inline'`,
    `img-src ${webview.cspSource} http://localhost:* data: blob:`,
    `frame-src http://localhost:* http://127.0.0.1:*`,
    `connect-src http://localhost:* ws://localhost:*`,
  ].join('; ');

  return `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="${styleUri}" nonce="${nonce}" />
    <title>Cursor Canvas</title>
  </head>
  <body class="bg-canvas-bg text-canvas-text">
    <div id="root"></div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
  </body>
</html>`;
}

function createPanel(context: vscode.ExtensionContext): vscode.WebviewPanel {
  trackDetectionService?.dispose();
  trackDetectionService = new TrackDetectionService(context);

  const panel = vscode.window.createWebviewPanel(
    PANEL_VIEW_TYPE,
    'Cursor Canvas',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.joinPath(context.extensionUri, 'dist'),
      ],
    },
  );

  panel.webview.html = getWebviewHtml(panel.webview, context.extensionUri);
  trackDetectionService.start(panel);

  const messageDisposable = messageBridge.receive(panel, (message) => {
    switch (message.type) {
      case 'PANEL_READY':
        void trackDetectionService?.sendInitialState(
          panel,
          getDefaultSettings(),
        );
        break;
      case 'REQUEST_REFRESH':
        void trackDetectionService?.runAutoDetect(panel);
        vscode.window.showInformationMessage('Cursor Canvas: refreshed');
        break;
      case 'OVERRIDE_TRACK':
        void trackDetectionService?.setManualOverride(panel, message.track);
        break;
      case 'RESET_TO_AUTO':
        void trackDetectionService?.clearManualOverride(panel);
        break;
      case 'SAVE_SETTINGS':
        void vscode.workspace
          .getConfiguration('cursorCanvas')
          .update(
            'outputFolder',
            message.settings.outputFolder,
            vscode.ConfigurationTarget.Workspace,
          );
        messageBridge.send(panel, {
          type: 'SETTINGS_UPDATED',
          settings: message.settings,
        });
        void trackDetectionService?.runAutoDetect(panel);
        break;
      default:
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Cursor Canvas] Unhandled webview message:', message);
        }
        break;
    }
  });

  panel.onDidDispose(() => {
    messageDisposable.dispose();
    trackDetectionService?.dispose();
    trackDetectionService = undefined;
    activePanel = undefined;
  });

  return panel;
}

export function activate(context: vscode.ExtensionContext): void {
  const openPanelCommand = vscode.commands.registerCommand(
    'cursorCanvas.openPanel',
    () => {
      if (activePanel) {
        activePanel.reveal(vscode.ViewColumn.Beside);
        return;
      }

      activePanel = createPanel(context);
    },
  );

  context.subscriptions.push(openPanelCommand);
}

export function deactivate(): void {
  trackDetectionService?.dispose();
  trackDetectionService = undefined;
  activePanel?.dispose();
  activePanel = undefined;
}
