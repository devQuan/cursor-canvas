import React, { useEffect, useMemo, useState } from 'react';
import { postToExtension } from '../hooks/useMessageBridge';
import { useCanvasStore } from '../store/canvasStore';
import EmptyState from './EmptyState';

const AppPreview = React.memo(() => {
  const port = useCanvasStore((state) => state.port);
  const serverStatus = useCanvasStore((state) => state.serverStatus);
  const portSource = useCanvasStore((state) => state.portSource);
  const [editablePort, setEditablePort] = useState('5173');

  useEffect(() => {
    if (port) {
      setEditablePort(String(port));
    }
  }, [port]);

  const parsedPort = Number.parseInt(editablePort, 10);
  const hasValidPort =
    Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535;

  const previewUrl = useMemo(() => {
    if (!hasValidPort) {
      return null;
    }
    return `http://localhost:${parsedPort}`;
  }, [hasValidPort, parsedPort]);

  const handleRefresh = (): void => {
    postToExtension({ type: 'REQUEST_REFRESH' });
  };

  const handleOpenInBrowser = (): void => {
    if (!hasValidPort) {
      return;
    }
    postToExtension({ type: 'OPEN_IN_BROWSER', port: parsedPort });
  };

  const handlePortCommit = (): void => {
    if (!hasValidPort) {
      return;
    }

    const settings = useCanvasStore.getState().settings;
    postToExtension({
      type: 'SAVE_SETTINGS',
      settings: {
        ...settings,
        portOverride: parsedPort,
      },
    });
  };

  if (!port && serverStatus === 'starting') {
    return (
      <EmptyState
        title="Open a web project"
        description="Start your dev server to see a live localhost preview here."
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-canvas-border bg-canvas-surface px-3 py-2">
        <label className="flex items-center gap-2 text-xs text-canvas-muted">
          <span>Port</span>
          <input
            type="number"
            min={1}
            max={65535}
            value={editablePort}
            onChange={(event) => setEditablePort(event.target.value)}
            onBlur={handlePortCommit}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handlePortCommit();
              }
            }}
            className="w-20 rounded border border-canvas-border bg-canvas-bg px-2 py-1 font-mono text-xs text-canvas-text outline-none focus:border-canvas-accent"
          />
          {portSource ? (
            <span className="font-mono text-[10px] uppercase text-canvas-muted">
              {portSource}
            </span>
          ) : null}
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded border border-canvas-border px-2 py-1 text-xs text-canvas-text hover:bg-canvas-bg"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleOpenInBrowser}
            disabled={!hasValidPort}
            className="rounded border border-canvas-border px-2 py-1 text-xs text-canvas-text hover:bg-canvas-bg disabled:cursor-not-allowed disabled:opacity-50"
          >
            Open in Browser
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-canvas-bg">
        {serverStatus === 'starting' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-canvas-bg/90">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-canvas-border border-t-canvas-accent" />
            <p className="text-sm text-canvas-muted">Starting dev server…</p>
          </div>
        )}

        {serverStatus === 'unreachable' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-canvas-bg p-6 text-center">
            <p className="text-sm text-canvas-text">
              No server found on port {editablePort}. Is your dev server running?
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              className="rounded bg-canvas-accent px-3 py-1.5 text-xs text-white"
            >
              Retry
            </button>
          </div>
        )}

        {previewUrl && serverStatus === 'ready' ? (
          <iframe
            title="App preview"
            src={previewUrl}
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        ) : null}
      </div>
    </div>
  );
});

AppPreview.displayName = 'AppPreview';

export default AppPreview;
