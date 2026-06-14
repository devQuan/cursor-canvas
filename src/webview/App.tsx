import React from 'react';
import AppPreview from './components/AppPreview';
import ControlBar from './components/ControlBar';
import ErrorBoundary from './components/ErrorBoundary';
import GameCanvas from './components/GamePreview/GameCanvas';
import GameViewToolbar from './components/GamePreview/GameViewToolbar';
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
  const gameViewMode = useCanvasStore((state) => state.gameViewMode);

  const handleRefresh = (): void => {
    postToExtension({ type: 'REQUEST_REFRESH' });
  };

  const showCanvas = gameViewMode === 'canvas' || gameViewMode === 'split';
  const showScene = gameViewMode === 'scene' || gameViewMode === 'split';

  return (
    <div className="relative flex h-full flex-col">
      <ControlBar onRefresh={handleRefresh} />

      <main className="min-h-0 flex-1 overflow-hidden">
        <ErrorBoundary>
          {activeTrack === 'app' && <AppPreview />}
          {activeTrack === 'game' && (
            <div className="flex h-full flex-col">
              <div
                className={[
                  'min-h-0 flex-1',
                  gameViewMode === 'split'
                    ? 'grid grid-cols-[1fr_240px]'
                    : 'grid grid-cols-1',
                ].join(' ')}
              >
                {showCanvas ? <GameCanvas /> : null}
                {showScene ? <ScenePanel /> : null}
              </div>
              <GameViewToolbar />
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
