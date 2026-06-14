import React from 'react';
import { postToExtension } from '../../hooks/useMessageBridge';
import { useCanvasStore } from '../../store/canvasStore';
import FrameStrip from './FrameStrip';
import ProgressBar from './ProgressBar';
import VideoPlayer from './VideoPlayer';

function shortenPath(fullPath: string): string {
  const parts = fullPath.split(/[/\\]/);
  if (parts.length <= 4) {
    return fullPath;
  }

  return ['…', ...parts.slice(-3)].join('/');
}

const VideoPreview = React.memo(() => {
  const frames = useCanvasStore((state) => state.frames);
  const videoUrl = useCanvasStore((state) => state.videoUrl);
  const videoViewMode = useCanvasStore((state) => state.videoViewMode);
  const videoPreviewStatus = useCanvasStore((state) => state.videoPreviewStatus);
  const videoOutputDir = useCanvasStore((state) => state.videoOutputDir);

  const showPlayer = videoViewMode === 'player' && Boolean(videoUrl);
  const isEmpty =
    frames.length === 0 && !videoUrl && videoPreviewStatus === 'empty';

  if (isEmpty) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-canvas-muted">
          No frames found yet. Drop <code>frame_0001.png</code> files into your
          output folder, or set a custom path in settings.
        </p>
        {videoOutputDir ? (
          <p className="font-mono text-xs text-canvas-muted/80">
            Watching: {shortenPath(videoOutputDir)}
          </p>
        ) : (
          <p className="text-xs text-canvas-muted/80">
            Default: <code>.cursor-canvas/video-output</code> (searches nested
            projects too)
          </p>
        )}
        <button
          type="button"
          onClick={() => postToExtension({ type: 'REQUEST_REFRESH' })}
          className="rounded border border-canvas-border px-3 py-1 text-xs hover:bg-canvas-border/40"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (videoPreviewStatus === 'error' && frames.length === 0 && !videoUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-red-400">
          Output folder not found or no frames detected.
        </p>
        {videoOutputDir ? (
          <p className="font-mono text-xs text-canvas-muted/80">
            Tried: {shortenPath(videoOutputDir)}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => postToExtension({ type: 'REQUEST_REFRESH' })}
          className="rounded border border-canvas-border px-3 py-1 text-xs hover:bg-canvas-border/40"
        >
          Refresh
        </button>
      </div>
    );
  }

  if (showPlayer) {
    return <VideoPlayer />;
  }

  return (
    <div className="flex h-full flex-col">
      <ProgressBar />
      <div className="min-h-0 flex-1 overflow-hidden">
        <FrameStrip />
      </div>
    </div>
  );
});

VideoPreview.displayName = 'VideoPreview';

export default VideoPreview;
