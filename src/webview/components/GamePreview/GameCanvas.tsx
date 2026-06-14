import React from 'react';

const GameCanvas = React.memo(() => {
  return (
    <div className="flex h-full items-center justify-center rounded border border-dashed border-canvas-border bg-canvas-bg/60">
      <p className="text-sm text-canvas-muted">Game canvas — Phase 4</p>
    </div>
  );
});

GameCanvas.displayName = 'GameCanvas';

export default GameCanvas;
