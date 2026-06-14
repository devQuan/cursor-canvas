import { useCanvasStore } from '../../src/webview/store/canvasStore';
import type { CanvasSettings } from '../../src/types';

const defaultSettings: CanvasSettings = {
  outputFolder: null,
  estimatedFrameCount: 60,
  portOverride: null,
  framePollingIntervalMs: 1000,
  sceneGraphPath: '.cursor-canvas/scene-graph.json',
  unityWebGlPath: null,
  autoOpenPanel: true,
};

export function resetCanvasStore(): void {
  useCanvasStore.setState({
    activeTrack: 'app',
    trackMode: 'auto',
    trackConfidence: 'high',
    bridgeStatus: null,
    port: null,
    portSource: null,
    serverStatus: 'starting',
    engine: 'threejs',
    gamePreviewUrl: null,
    gamePreviewStatus: 'loading',
    sceneObjects: [],
    frames: [],
    videoUrl: null,
    videoViewMode: 'live',
    videoPreviewStatus: 'empty',
    generationProgress: { current: 0, total: 60 },
    videoOutputDir: null,
    previewDevice: 'desktop',
    gameViewMode: 'split',
    settingsOpen: false,
    settings: defaultSettings,
  });
}
