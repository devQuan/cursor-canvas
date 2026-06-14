import { beforeEach, describe, expect, it } from 'vitest';
import { handleExtensionMessage } from '../../src/webview/lib/extensionMessageHandler';
import { useCanvasStore } from '../../src/webview/store/canvasStore';
import { resetCanvasStore } from '../helpers/resetCanvasStore';

describe('extension message integration', () => {
  beforeEach(() => {
    resetCanvasStore();
  });

  it('updates track badge when TRACK_CHANGED arrives', () => {
    handleExtensionMessage({
      type: 'TRACK_CHANGED',
      track: 'game',
      mode: 'auto',
      confidence: 'high',
    });

    const state = useCanvasStore.getState();
    expect(state.activeTrack).toBe('game');
    expect(state.trackMode).toBe('auto');
    expect(state.trackConfidence).toBe('high');
  });

  it('wires app preview flow from port detection to ready server', () => {
    handleExtensionMessage({
      type: 'PORT_DETECTED',
      port: 5173,
      source: 'config',
    });
    handleExtensionMessage({
      type: 'SERVER_STATUS',
      status: 'ready',
      port: 5173,
    });

    const state = useCanvasStore.getState();
    expect(state.port).toBe(5173);
    expect(state.portSource).toBe('config');
    expect(state.serverStatus).toBe('ready');
  });

  it('marks server unreachable when health check fails', () => {
    handleExtensionMessage({
      type: 'SERVER_STATUS',
      status: 'unreachable',
      port: 3000,
    });

    expect(useCanvasStore.getState().serverStatus).toBe('unreachable');
  });

  it('populates scene panel when SCENE_UPDATED arrives', () => {
    handleExtensionMessage({
      type: 'SCENE_UPDATED',
      engine: 'threejs',
      objects: [
        { id: 'player', name: 'Player Ship', type: 'mesh', visible: true },
        { id: 'sun', name: 'Key Light', type: 'light', visible: true },
      ],
    });

    const state = useCanvasStore.getState();
    expect(state.engine).toBe('threejs');
    expect(state.sceneObjects).toHaveLength(2);
    expect(state.gamePreviewStatus).toBe('ready');
  });

  it('appends frames and switches to player when video completes', () => {
    handleExtensionMessage({
      type: 'VIDEO_RESET',
      estimatedFrameCount: 3,
      outputDir: '/tmp/video-output',
    });

    handleExtensionMessage({
      type: 'FRAME_ADDED',
      frameIndex: 1,
      framePath: '/tmp/video-output/frame_0001.png',
      timestamp: 100,
    });
    handleExtensionMessage({
      type: 'FRAME_ADDED',
      frameIndex: 2,
      framePath: '/tmp/video-output/frame_0002.png',
      timestamp: 200,
    });
    handleExtensionMessage({
      type: 'VIDEO_READY',
      videoPath: '/tmp/video-output/output.mp4',
      frameCount: 2,
    });

    const state = useCanvasStore.getState();
    expect(state.frames).toHaveLength(2);
    expect(state.videoUrl).toBe('/tmp/video-output/output.mp4');
    expect(state.videoViewMode).toBe('player');
    expect(state.videoPreviewStatus).toBe('complete');
  });

  it('clears video state when switching away from video track', () => {
    handleExtensionMessage({
      type: 'FRAME_ADDED',
      frameIndex: 1,
      framePath: '/tmp/frame_0001.png',
      timestamp: 100,
    });

    handleExtensionMessage({
      type: 'TRACK_CHANGED',
      track: 'app',
      mode: 'manual',
    });

    const state = useCanvasStore.getState();
    expect(state.activeTrack).toBe('app');
    expect(state.frames).toHaveLength(0);
    expect(state.videoUrl).toBeNull();
  });
});
