import React from 'react';

const VideoPlayer = React.memo(() => {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-canvas-muted">
        Finished video player — Phase 5
      </p>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
