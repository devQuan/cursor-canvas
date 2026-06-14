import type {
  CanvasSettings,
  ErrorService,
  GameEngine,
  SceneObject,
  Track,
} from './index';

/** Extension → Webview */
export type ExtensionToWebviewMessage =
  | {
      type: 'TRACK_CHANGED';
      track: Track;
      mode: 'auto' | 'manual';
      confidence?: 'high' | 'low';
    }
  | {
      type: 'PORT_DETECTED';
      port: number;
      source: 'config' | 'scan';
    }
  | {
      type: 'SERVER_STATUS';
      status: 'starting' | 'ready' | 'unreachable';
      port: number;
    }
  | {
      type: 'FRAME_ADDED';
      frameIndex: number;
      framePath: string;
      timestamp: number;
    }
  | {
      type: 'VIDEO_READY';
      videoPath: string;
      frameCount: number;
    }
  | {
      type: 'SCENE_UPDATED';
      objects: SceneObject[];
      engine: GameEngine;
    }
  | {
      type: 'ENGINE_DETECTED';
      engine: GameEngine;
      port?: number;
    }
  | {
      type: 'SETTINGS_UPDATED';
      settings: CanvasSettings;
    }
  | {
      type: 'ERROR';
      service: ErrorService;
      message: string;
      recoverable: boolean;
    }
  | {
      type: 'BRIDGE_READY';
      message: string;
    };

/** Webview → Extension */
export type WebviewToExtensionMessage =
  | { type: 'OVERRIDE_TRACK'; track: Track }
  | { type: 'RESET_TO_AUTO' }
  | { type: 'REQUEST_REFRESH' }
  | { type: 'SAVE_SETTINGS'; settings: CanvasSettings }
  | { type: 'PANEL_READY' }
  | { type: 'OPEN_IN_BROWSER'; port: number };

export type PanelMessage = ExtensionToWebviewMessage | WebviewToExtensionMessage;

export function isWebviewToExtensionMessage(
  message: unknown,
): message is WebviewToExtensionMessage {
  if (typeof message !== 'object' || message === null || !('type' in message)) {
    return false;
  }

  const type = (message as { type: string }).type;
  return (
    type === 'OVERRIDE_TRACK' ||
    type === 'RESET_TO_AUTO' ||
    type === 'REQUEST_REFRESH' ||
    type === 'SAVE_SETTINGS' ||
    type === 'PANEL_READY' ||
    type === 'OPEN_IN_BROWSER'
  );
}
