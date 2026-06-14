import React from 'react';
import type { Track } from '../../types';
import { postToExtension } from '../hooks/useMessageBridge';
import { useCanvasStore } from '../store/canvasStore';

const TRACKS: Track[] = ['app', 'game', 'video'];

const TRACK_LABELS: Record<Track, string> = {
  app: 'App',
  game: 'Game',
  video: 'Video',
};

interface ControlBarProps {
  onRefresh: () => void;
}

const ControlBar = React.memo(({ onRefresh }: ControlBarProps) => {
  const activeTrack = useCanvasStore((state) => state.activeTrack);
  const trackMode = useCanvasStore((state) => state.trackMode);
  const trackConfidence = useCanvasStore((state) => state.trackConfidence);
  const bridgeStatus = useCanvasStore((state) => state.bridgeStatus);
  const setSettingsOpen = useCanvasStore((state) => state.setSettingsOpen);

  const handleTrackClick = (track: Track): void => {
    postToExtension({ type: 'OVERRIDE_TRACK', track });
  };

  const handleBadgeClick = (): void => {
    if (trackMode === 'manual') {
      postToExtension({ type: 'RESET_TO_AUTO' });
    }
  };

  const badgeText = `${trackMode === 'auto' ? 'Auto' : 'Manual'}: ${TRACK_LABELS[activeTrack]}`;
  const badgeColor =
    trackConfidence === 'low'
      ? 'text-amber-400'
      : trackMode === 'manual'
        ? 'text-canvas-accent'
        : 'text-canvas-muted';

  return (
    <header className="flex h-10 shrink-0 items-center justify-between border-b border-canvas-border bg-canvas-surface px-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex shrink-0 overflow-hidden rounded border border-canvas-border"
          role="tablist"
          aria-label="Preview track"
        >
          {TRACKS.map((track) => {
            const isActive = activeTrack === track;
            return (
              <button
                key={track}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTrackClick(track)}
                className={[
                  'px-3 py-1.5 text-xs font-sans font-medium uppercase tracking-wide transition-colors',
                  isActive
                    ? 'bg-canvas-accent text-white'
                    : 'bg-transparent text-canvas-muted hover:bg-canvas-bg hover:text-canvas-text',
                ].join(' ')}
              >
                {track}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleBadgeClick}
          disabled={trackMode !== 'manual'}
          title={
            trackMode === 'manual'
              ? 'Return to auto-detection'
              : trackConfidence === 'low'
                ? 'Low confidence detection — choose a track manually if needed'
                : 'Auto-detected track'
          }
          className={[
            'truncate font-mono text-xs',
            badgeColor,
            trackMode === 'manual'
              ? 'cursor-pointer hover:underline'
              : 'cursor-default',
          ].join(' ')}
        >
          ◉ {badgeText}
          {trackConfidence === 'low' ? ' (uncertain)' : ''}
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {bridgeStatus ? (
          <span className="mr-2 hidden max-w-[160px] truncate font-mono text-[10px] text-emerald-400 lg:inline">
            {bridgeStatus}
          </span>
        ) : null}

        <button
          type="button"
          onClick={onRefresh}
          className="rounded px-2 py-1 text-xs text-canvas-muted hover:bg-canvas-bg hover:text-canvas-text"
          title="Refresh detection"
          aria-label="Refresh detection"
        >
          ↺
        </button>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs text-canvas-muted hover:bg-canvas-bg hover:text-canvas-text"
          title="Fullscreen"
          aria-label="Fullscreen"
        >
          ⛶
        </button>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="rounded px-2 py-1 text-xs text-canvas-muted hover:bg-canvas-bg hover:text-canvas-text"
          title="Settings"
          aria-label="Settings"
        >
          ⚙
        </button>
      </div>
    </header>
  );
});

ControlBar.displayName = 'ControlBar';

export default ControlBar;
