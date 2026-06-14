import React, { useEffect, useRef } from 'react';
import { postToExtension } from '../../hooks/useMessageBridge';
import { useCanvasStore } from '../../store/canvasStore';

const VideoPlayer = React.memo(() => {
  const videoUrl = useCanvasStore((state) => state.videoUrl);
  const setVideoViewMode = useCanvasStore((state) => state.setVideoViewMode);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) {
      return;
    }

    void video.play().catch(() => {
      // Autoplay may be blocked until user interacts with the panel.
    });
  }, [videoUrl]);

  if (!videoUrl) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 items-center justify-center bg-black/40 p-4">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          playsInline
          className="max-h-full max-w-full rounded shadow-lg"
        />
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-canvas-border px-3 py-2">
        <button
          type="button"
          onClick={() => setVideoViewMode('strip')}
          className="rounded border border-canvas-border px-3 py-1 text-xs hover:bg-canvas-border/40"
        >
          Show Frames
        </button>
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
