import React from 'react';
import AppPreview from './components/AppPreview';
import ControlBar from './components/ControlBar';
import ErrorBoundary from './components/ErrorBoundary';
import GameCanvas from './components/GamePreview/GameCanvas';
import GameViewToolbar from './components/GamePreview/GameViewToolbar';
import ScenePanel from './components/GamePreview/ScenePanel';
import SettingsPanel from './components/SettingsPanel';
import TrackView from './components/TrackView';
import VideoPreview from './components/VideoPreview/VideoPreview';
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
    <div className="relative flex h-full flex-col bg-canvas-bg">
      <ControlBar onRefresh={handleRefresh} />

      <main className="min-h-0 flex-1 overflow-hidden">
        {activeTrack === 'app' ? (
          <TrackView trackKey="app">
            <ErrorBoundary label="App preview">
              <AppPreview />
            </ErrorBoundary>
          </TrackView>
        ) : null}

        {activeTrack === 'game' ? (
          <TrackView trackKey="game">
            <ErrorBoundary label="Game preview">
              <div className="flex h-full flex-col">
                <div
                  className={[
                    'min-h-0 flex-1',
                    gameViewMode === 'split'
                      ? 'grid grid-cols-[1fr_240px]'
                      : 'grid grid-cols-1',
                  ].join(' ')}
                >
                  {showCanvas ? (
                    <ErrorBoundary label="Game canvas">
                      <GameCanvas />
                    </ErrorBoundary>
                  ) : null}
                  {showScene ? (
                    <ErrorBoundary label="Scene panel">
                      <ScenePanel />
                    </ErrorBoundary>
                  ) : null}
                </div>
                <GameViewToolbar />
              </div>
            </ErrorBoundary>
          </TrackView>
        ) : null}

        {activeTrack === 'video' ? (
          <TrackView trackKey="video">
            <ErrorBoundary label="Video preview">
              <VideoPreview />
            </ErrorBoundary>
          </TrackView>
        ) : null}
      </main>

      <SettingsPanel />
    </div>
  );
});

App.displayName = 'App';

export default App;
