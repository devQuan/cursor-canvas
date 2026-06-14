import React from 'react';
import { postToExtension } from '../../hooks/useMessageBridge';
import { useCanvasStore } from '../../store/canvasStore';
import EmptyState from '../EmptyState';
import VideoPlayer from './VideoPlayer';
import VideoStage from './VideoStage';

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
  const videoPreviewStatus = useCanvasStore((state) => state.videoPreviewStatus);
  const videoOutputDir = useCanvasStore((state) => state.videoOutputDir);
  const setSettingsOpen = useCanvasStore((state) => state.setSettingsOpen);

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
        title="No video yet"
        description={`Output will appear here as a single live preview when frames or a video file land in your folder. ${pathHint}`}
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
        description={`No video output detected.${pathHint} Check settings and try again.`}
        variant="error"
        action={{
          label: 'Open settings',
          onClick: () => setSettingsOpen(true),
        }}
      />
    );
  }

  if (videoUrl) {
    return <VideoPlayer />;
  }

  return <VideoStage />;
});

VideoPreview.displayName = 'VideoPreview';

export default VideoPreview;
