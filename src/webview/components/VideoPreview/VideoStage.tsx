import React, { useMemo } from 'react';
import { useCanvasStore } from '../../store/canvasStore';

function formatTimestamp(seconds: number): string {
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const VideoStage = React.memo(() => {
  const frames = useCanvasStore((state) => state.frames);
  const videoPreviewStatus = useCanvasStore((state) => state.videoPreviewStatus);

  const latestFrame = useMemo(
    () => (frames.length > 0 ? frames[frames.length - 1] : null),
    [frames],
  );

  if (!latestFrame) {
    return (
      <div className="flex h-full items-center justify-center bg-black px-6 text-center">
        <p className="text-sm text-canvas-muted">
          Waiting for video output in the watched folder…
        </p>
      </div>
    );
  }

  const isGenerating = videoPreviewStatus === 'generating';

  return (
    <div className="relative flex h-full flex-col bg-black">
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
        <span className="rounded-full border border-canvas-border bg-canvas-surface/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-canvas-muted">
          Live preview
        </span>
        {isGenerating ? (
          <span className="rounded-full border border-canvas-accent/40 bg-canvas-accent-soft px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-canvas-accent">
            Updating
          </span>
        ) : null}
      </div>

      <div className="relative min-h-0 flex-1">
        <img
          key={latestFrame.framePath}
          src={latestFrame.framePath}
          alt="Video preview"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-canvas-border/60 bg-canvas-surface/95 px-3 py-2 text-xs text-canvas-muted">
        <span>{formatTimestamp(latestFrame.timestamp)}</span>
        {isGenerating ? (
          <span className="font-mono uppercase tracking-wide">Rendering…</span>
        ) : (
          <span className="font-mono uppercase tracking-wide">Ready</span>
        )}
      </div>

      {isGenerating ? (
        <div
          className="absolute bottom-[41px] left-0 right-0 h-0.5 overflow-hidden bg-canvas-border/40"
          aria-hidden="true"
        >
          <div className="h-full w-1/3 animate-pulse bg-canvas-accent" />
        </div>
      ) : null}
    </div>
  );
});

VideoStage.displayName = 'VideoStage';

export default VideoStage;
