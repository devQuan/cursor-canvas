import React from 'react';

interface TrackViewProps {
  trackKey: string;
  children: React.ReactNode;
}

const TrackView = React.memo(({ trackKey, children }: TrackViewProps) => {
  return (
    <div key={trackKey} className="canvas-track-enter h-full">
      {children}
    </div>
  );
});

TrackView.displayName = 'TrackView';

export default TrackView;
