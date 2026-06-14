import React, { useEffect, useRef } from 'react';
import { postToExtension } from '../../hooks/useMessageBridge';
import { useCanvasStore } from '../../store/canvasStore';

const VideoPlayer = React.memo(() => {
  const videoUrl = useCanvasStore((state) => state.videoUrl);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) {
      return;
    }

    const playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      void playResult.catch(() => {
        // Autoplay may be blocked until user interacts with the panel.
      });
    }
  }, [videoUrl]);

  if (!videoUrl) {
    return null;
  }

  return (
    <div className="relative flex h-full flex-col bg-black">
      <div className="absolute left-3 top-3 z-10 rounded-full border border-canvas-border bg-canvas-surface/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-canvas-muted">
        Final video
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          playsInline
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex shrink-0 items-center justify-end border-t border-canvas-border/60 bg-canvas-surface/95 px-3 py-2">
        <button
          type="button"
          onClick={() => postToExtension({ type: 'OPEN_OUTPUT_FILE' })}
          className="rounded bg-canvas-accent px-3 py-1 text-xs text-white hover:opacity-90"
        >
          Open File
        </button>
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
