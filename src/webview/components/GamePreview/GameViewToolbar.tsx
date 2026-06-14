import React from 'react';
import type { GameViewMode } from '../../../types';
import { useCanvasStore } from '../../store/canvasStore';

const MODES: Array<{ id: GameViewMode; label: string }> = [
  { id: 'canvas', label: 'Canvas Only' },
  { id: 'split', label: 'Split' },
  { id: 'scene', label: 'Scene Only' },
];

const GameViewToolbar = React.memo(() => {
  const gameViewMode = useCanvasStore((state) => state.gameViewMode);
  const setGameViewMode = useCanvasStore((state) => state.setGameViewMode);

  return (
    <div className="flex shrink-0 items-center justify-center gap-2 border-t border-canvas-border bg-canvas-surface px-3 py-2">
      {MODES.map((mode) => {
        const isActive = gameViewMode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => setGameViewMode(mode.id)}
            className={[
              'rounded px-3 py-1 text-xs transition-colors',
              isActive
                ? 'bg-canvas-accent text-white'
                : 'border border-canvas-border text-canvas-muted hover:text-canvas-text',
            ].join(' ')}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
});

GameViewToolbar.displayName = 'GameViewToolbar';

export default GameViewToolbar;
