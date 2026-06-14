import React from 'react';

const FrameStrip = React.memo(() => {
  return (
    <div className="flex gap-2 overflow-x-auto border-t border-canvas-border p-3">
      <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded border border-dashed border-canvas-border text-xs text-canvas-muted">
        Frame strip — Phase 5
      </div>
    </div>
  );
});

FrameStrip.displayName = 'FrameStrip';

export default FrameStrip;
