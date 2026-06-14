import * as vscode from 'vscode';
import type { ExtensionToWebviewMessage } from '../types/messages';
import { isWebviewToExtensionMessage } from '../types/messages';
import type { WebviewToExtensionMessage } from '../types/messages';

const IS_DEV = process.env.NODE_ENV === 'development';

function logDev(direction: string, message: ExtensionToWebviewMessage | WebviewToExtensionMessage): void {
  if (IS_DEV) {
    console.log(`[Cursor Canvas] ${direction}`, message);
  }
}

export class MessageBridge {
  send(panel: vscode.WebviewPanel, message: ExtensionToWebviewMessage): void {
    logDev('→ webview', message);
    void panel.webview.postMessage(message);
  }

  receive(
    panel: vscode.WebviewPanel,
    handler: (message: WebviewToExtensionMessage) => void,
  ): vscode.Disposable {
    return panel.webview.onDidReceiveMessage((message: unknown) => {
      if (!isWebviewToExtensionMessage(message)) {
        if (IS_DEV) {
          console.warn('[Cursor Canvas] Unknown message from webview:', message);
        }
        return;
      }

      logDev('← webview', message);
      handler(message);
    });
  }
}
