export type Track = 'app' | 'game' | 'video';

export type TrackMode = 'auto' | 'manual';

export type TrackConfidence = 'high' | 'low';

export type GameEngine = 'threejs' | 'unity-webgl' | 'generic-iframe';

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
}

export type GameViewMode = 'canvas' | 'split' | 'scene';

export type ErrorService =
  | 'trackResolver'
  | 'portDetector'
  | 'fileWatcher'
  | 'engineDetector';
