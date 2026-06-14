import { useEffect } from 'react';
import type { ExtensionToWebviewMessage } from '../../types/messages';
import { useCanvasStore } from '../store/canvasStore';

declare const acquireVsCodeApi: () => {
  postMessage: (message: unknown) => void;
};

const vscodeApi =
  typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : null;

export function postToExtension(message: unknown): void {
  vscodeApi?.postMessage(message);
}

function handleExtensionMessage(message: ExtensionToWebviewMessage): void {
  const store = useCanvasStore.getState();

  switch (message.type) {
    case 'TRACK_CHANGED':
      store.setTrack(message.track, message.mode, message.confidence ?? 'high');
      if (message.track !== 'video') {
        store.resetVideoState();
      }
      break;
    case 'PORT_DETECTED':
      store.setPort(message.port, message.source);
      break;
    case 'SERVER_STATUS':
      store.setServerStatus(message.status);
      store.setPort(message.port, store.portSource);
      break;
    case 'ENGINE_DETECTED':
      store.setEngine(message.engine);
      if (message.previewUrl) {
        store.setGamePreviewUrl(message.previewUrl);
      } else if (message.engine === 'threejs') {
        store.setGamePreviewStatus('loading');
      } else {
        store.setGamePreviewStatus('empty');
      }
      if (message.port) {
        store.setPort(message.port, 'config');
      }
      break;
    case 'SCENE_UPDATED':
      store.setSceneObjects(message.objects);
      store.setEngine(message.engine);
      break;
    case 'FRAME_ADDED':
      store.addFrame({
        frameIndex: message.frameIndex,
        framePath: message.framePath,
        timestamp: message.timestamp,
      });
      break;
    case 'VIDEO_READY':
      store.setVideoUrl(message.videoPath);
      store.setGenerationProgress(message.frameCount, store.generationProgress.total);
      store.setVideoPreviewStatus('complete');
      store.setVideoViewMode('player');
      break;
    case 'VIDEO_RESET':
      store.resetVideoState();
      store.setGenerationProgress(0, message.estimatedFrameCount);
      if (message.outputDir) {
        store.setVideoOutputDir(message.outputDir);
      }
      break;
    case 'SETTINGS_UPDATED':
      store.setSettings(message.settings);
      break;
    case 'BRIDGE_READY':
      store.setBridgeStatus(message.message);
      break;
    case 'ERROR':
      store.setBridgeStatus(`Error (${message.service}): ${message.message}`);
      if (message.service === 'fileWatcher') {
        store.setVideoPreviewStatus('error');
      }
      break;
    default:
      break;
  }
}

export function useMessageBridge(): void {
  useEffect(() => {
    const listener = (event: MessageEvent<ExtensionToWebviewMessage>) => {
      handleExtensionMessage(event.data);
    };

    window.addEventListener('message', listener);
    postToExtension({ type: 'PANEL_READY' });

    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);
}
