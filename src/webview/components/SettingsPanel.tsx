import React from 'react';
import { postToExtension } from '../hooks/useMessageBridge';
import { useCanvasStore } from '../store/canvasStore';

const SettingsPanel = React.memo(() => {
  const settingsOpen = useCanvasStore((state) => state.settingsOpen);
  const settings = useCanvasStore((state) => state.settings);
  const setSettingsOpen = useCanvasStore((state) => state.setSettingsOpen);

  if (!settingsOpen) {
    return null;
  }

  const handleClose = (): void => {
    setSettingsOpen(false);
  };

  const handleSave = (): void => {
    postToExtension({ type: 'SAVE_SETTINGS', settings });
    setSettingsOpen(false);
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded border border-canvas-border bg-canvas-surface p-4 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Settings</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-canvas-muted hover:text-canvas-text"
          >
            ✕
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-canvas-muted">Output folder</dt>
            <dd>{settings.outputFolder ?? 'Not set'}</dd>
          </div>
          <div>
            <dt className="text-canvas-muted">Estimated frames</dt>
            <dd>{settings.estimatedFrameCount}</dd>
          </div>
          <div>
            <dt className="text-canvas-muted">Port override</dt>
            <dd>{settings.portOverride ?? 'Auto'}</dd>
          </div>
        </dl>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded border border-canvas-border px-3 py-1 text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-canvas-accent px-3 py-1 text-xs text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
});

SettingsPanel.displayName = 'SettingsPanel';

export default SettingsPanel;
