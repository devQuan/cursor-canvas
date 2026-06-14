import React, { useEffect, useRef } from 'react';
import { useCanvasStore } from '../../store/canvasStore';

function formatTimestamp(seconds: number): string {
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const FrameStrip = React.memo(() => {
  const frames = useCanvasStore((state) => state.frames);
  const scrollRef = useRef<HTMLDivElement>(null);
  const latestFrameIndex =
    frames.length > 0 ? frames[frames.length - 1].frameIndex : null;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      left: container.scrollWidth,
      behavior: 'smooth',
    });
  }, [frames.length]);

  if (frames.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <p className="text-sm text-canvas-muted">
          Waiting for frames in the output folder…
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex h-full gap-2 overflow-x-auto p-4"
      aria-label="Frame strip"
    >
      {frames.map((frame) => {
        const isLatest = frame.frameIndex === latestFrameIndex;

        return (
          <figure
            key={frame.frameIndex}
            className={[
              'flex shrink-0 flex-col gap-1',
              isLatest ? 'opacity-100' : 'opacity-80',
            ].join(' ')}
          >
            <div
              className={[
                'overflow-hidden rounded border bg-canvas-bg',
                isLatest
                  ? 'border-canvas-accent ring-1 ring-canvas-accent/40'
                  : 'border-canvas-border',
              ].join(' ')}
            >
              <img
                src={frame.framePath}
                alt={`Frame ${frame.frameIndex}`}
                className="h-24 w-36 object-cover"
                loading="lazy"
              />
            </div>
            <figcaption className="text-center text-[10px] text-canvas-muted">
              {formatTimestamp(frame.timestamp)}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
});

FrameStrip.displayName = 'FrameStrip';

export default FrameStrip;
