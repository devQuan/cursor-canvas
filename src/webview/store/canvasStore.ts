import { create } from 'zustand';
import type {
  CanvasSettings,
  Frame,
  GameEngine,
  GameViewMode,
  SceneObject,
  ServerStatus,
  Track,
  TrackConfidence,
  TrackMode,
} from '../../types';

interface CanvasStore {
  activeTrack: Track;
  trackMode: TrackMode;
  trackConfidence: TrackConfidence;
  bridgeStatus: string | null;
  port: number | null;
  serverStatus: ServerStatus;
  engine: GameEngine;
  sceneObjects: SceneObject[];
  frames: Frame[];
  videoUrl: string | null;
  generationProgress: { current: number; total: number };
  gameViewMode: GameViewMode;
  settingsOpen: boolean;
  settings: CanvasSettings;
  setTrack: (track: Track, mode: TrackMode, confidence?: TrackConfidence) => void;
  setBridgeStatus: (status: string | null) => void;
  setPort: (port: number | null) => void;
  setServerStatus: (status: ServerStatus) => void;
  setEngine: (engine: GameEngine) => void;
  setSceneObjects: (objects: SceneObject[]) => void;
  setSettings: (settings: CanvasSettings) => void;
  setSettingsOpen: (open: boolean) => void;
  setGameViewMode: (mode: GameViewMode) => void;
}

const defaultSettings: CanvasSettings = {
  outputFolder: null,
  estimatedFrameCount: 60,
  portOverride: null,
  framePollingIntervalMs: 1000,
};

export const useCanvasStore = create<CanvasStore>((set) => ({
  activeTrack: 'app',
  trackMode: 'auto',
  trackConfidence: 'high',
  bridgeStatus: null,
  port: null,
  serverStatus: 'starting',
  engine: 'threejs',
  sceneObjects: [],
  frames: [],
  videoUrl: null,
  generationProgress: { current: 0, total: 60 },
  gameViewMode: 'split',
  settingsOpen: false,
  settings: defaultSettings,
  setTrack: (track, mode, confidence = 'high') =>
    set({ activeTrack: track, trackMode: mode, trackConfidence: confidence }),
  setBridgeStatus: (status) => set({ bridgeStatus: status }),
  setPort: (port) => set({ port }),
  setServerStatus: (status) => set({ serverStatus: status }),
  setEngine: (engine) => set({ engine }),
  setSceneObjects: (objects) => set({ sceneObjects: objects }),
  setSettings: (settings) => set({ settings }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setGameViewMode: (mode) => set({ gameViewMode: mode }),
}));
