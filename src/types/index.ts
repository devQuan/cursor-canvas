export type Track = 'app' | 'game' | 'video';

export type TrackMode = 'auto' | 'manual';

export type TrackConfidence = 'high' | 'low';

export type GameEngine =
  | 'unity-webgl'
  | 'unity'
  | 'godot-webgl'
  | 'godot'
  | 'threejs'
  | 'generic-iframe';

export type ServerStatus = 'starting' | 'ready' | 'unreachable';

export interface SceneObject {
  id: string;
  name: string;
  type: 'mesh' | 'camera' | 'light' | 'group' | 'unknown';
  visible: boolean;
  children?: string[];
}

export interface Frame {
  frameIndex: number;
  framePath: string;
  timestamp: number;
}

export interface CanvasSettings {
  outputFolder: string | null;
  estimatedFrameCount: number;
  portOverride: number | null;
  framePollingIntervalMs: number;
  sceneGraphPath: string;
  unityWebGlPath: string | null;
  autoOpenPanel: boolean;
}

export type GamePreviewStatus = 'loading' | 'ready' | 'empty' | 'error';

export type GameViewMode = 'canvas' | 'split' | 'scene';

export type VideoViewMode = 'live' | 'player';

export type VideoPreviewStatus = 'empty' | 'generating' | 'complete' | 'error';

export type PreviewDeviceId =
  | 'desktop'
  | 'iphone-15'
  | 'android-phone'
  | 'ipad-pro'
  | 'ipad-pro-landscape';

export type ErrorService =
  | 'trackResolver'
  | 'portDetector'
  | 'fileWatcher'
  | 'engineDetector';
