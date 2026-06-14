import React from 'react';
import AppPreview from './components/AppPreview';
import ControlBar from './components/ControlBar';
import ErrorBoundary from './components/ErrorBoundary';
import GameCanvas from './components/GamePreview/GameCanvas';
import ScenePanel from './components/GamePreview/ScenePanel';
import SettingsPanel from './components/SettingsPanel';
import FrameStrip from './components/VideoPreview/FrameStrip';
import ProgressBar from './components/VideoPreview/ProgressBar';
import VideoPlayer from './components/VideoPreview/VideoPlayer';
import {
  postToExtension,
  useMessageBridge,
} from './hooks/useMessageBridge';
import { useCanvasStore } from './store/canvasStore';

const App = React.memo(() => {
  useMessageBridge();

  const activeTrack = useCanvasStore((state) => state.activeTrack);

  const handleRefresh = (): void => {
    postToExtension({ type: 'REQUEST_REFRESH' });
  };

  return (
    <div className="relative flex h-full flex-col">
      <ControlBar onRefresh={handleRefresh} />

      <main className="min-h-0 flex-1 overflow-hidden">
        <ErrorBoundary>
          {activeTrack === 'app' && <AppPreview />}
          {activeTrack === 'game' && (
            <div className="grid h-full grid-cols-[1fr_220px]">
              <GameCanvas />
              <ScenePanel />
            </div>
          )}
          {activeTrack === 'video' && (
            <div className="flex h-full flex-col">
              <ProgressBar />
              <div className="min-h-0 flex-1">
                <VideoPlayer />
              </div>
              <FrameStrip />
            </div>
          )}
        </ErrorBoundary>
      </main>

      <SettingsPanel />
    </div>
  );
});

App.displayName = 'App';

export default App;
