import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';

const ProgressBar = React.memo(() => {
  const current = useCanvasStore((state) => state.generationProgress.current);
  const total = useCanvasStore((state) => state.generationProgress.total);
  const videoPreviewStatus = useCanvasStore((state) => state.videoPreviewStatus);

  const percent = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const label =
    videoPreviewStatus === 'complete'
      ? `Complete — ${current} frames`
      : `Generating… ${current}/${total} fr`;

  return (
    <div className="border-b border-canvas-border px-3 py-2">
      <div className="mb-1 text-xs text-canvas-muted">{label}</div>
      <div className="h-1.5 overflow-hidden rounded bg-canvas-border">
        <div
          className="h-full bg-canvas-accent transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;
