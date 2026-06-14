import React from 'react';
import { postToExtension } from '../../hooks/useMessageBridge';
import { useCanvasStore } from '../../store/canvasStore';
import EmptyState from '../EmptyState';
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
  const setSettingsOpen = useCanvasStore((state) => state.setSettingsOpen);

  const showPlayer = videoViewMode === 'player' && Boolean(videoUrl);
  const isEmpty =
    frames.length === 0 && !videoUrl && videoPreviewStatus === 'empty';

  const refresh = (): void => {
    postToExtension({ type: 'REQUEST_REFRESH' });
  };

  if (isEmpty) {
    const pathHint = videoOutputDir
      ? `Watching: ${shortenPath(videoOutputDir)}`
      : 'Default: .cursor-canvas/video-output (searches nested projects too)';

    return (
      <EmptyState
        title="No frames yet"
        description={`Drop frame_0001.png files into your output folder, or configure a custom path in settings. ${pathHint}`}
        action={{ label: 'Refresh', onClick: refresh }}
      />
    );
  }

  if (videoPreviewStatus === 'error' && frames.length === 0 && !videoUrl) {
    const pathHint = videoOutputDir
      ? ` Tried: ${shortenPath(videoOutputDir)}.`
      : '';

    return (
      <EmptyState
        title="Output folder not found"
        description={`No frames detected.${pathHint} Check settings and try again.`}
        variant="error"
        action={{
          label: 'Open settings',
          onClick: () => setSettingsOpen(true),
        }}
      />
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
