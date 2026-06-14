import React from 'react';

const ProgressBar = React.memo(() => {
  return (
    <div className="border-b border-canvas-border px-3 py-2">
      <div className="mb-1 text-xs text-canvas-muted">Generating… 0/60 fr</div>
      <div className="h-1.5 overflow-hidden rounded bg-canvas-border">
        <div className="h-full w-0 bg-canvas-accent" />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
