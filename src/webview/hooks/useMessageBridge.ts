import { useEffect } from 'react';
import type { ExtensionToWebviewMessage } from '../../types/messages';
import { handleExtensionMessage } from '../lib/extensionMessageHandler';

declare const acquireVsCodeApi: () => {
  postMessage: (message: unknown) => void;
};

const vscodeApi =
  typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : null;

export function postToExtension(message: unknown): void {
  vscodeApi?.postMessage(message);
}

function handleMessageEvent(message: ExtensionToWebviewMessage): void {
  handleExtensionMessage(message);
}

export function useMessageBridge(): void {
  useEffect(() => {
    const listener = (event: MessageEvent<ExtensionToWebviewMessage>) => {
      handleMessageEvent(event.data);
    };

    window.addEventListener('message', listener);
    postToExtension({ type: 'PANEL_READY' });

    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);
}
