import React, { useEffect, useState } from 'react';
import { postToExtension } from '../hooks/useMessageBridge';
import { useCanvasStore } from '../store/canvasStore';

const SettingsPanel = React.memo(() => {
  const settingsOpen = useCanvasStore((state) => state.settingsOpen);
  const settings = useCanvasStore((state) => state.settings);
  const setSettingsOpen = useCanvasStore((state) => state.setSettingsOpen);
  const setSettings = useCanvasStore((state) => state.setSettings);

  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    if (settingsOpen) {
      setDraft(settings);
    }
  }, [settingsOpen, settings]);

  if (!settingsOpen) {
    return null;
  }

  const handleClose = (): void => {
    setSettingsOpen(false);
    setDraft(settings);
  };

  const handleSave = (): void => {
    setSettings(draft);
    postToExtension({ type: 'SAVE_SETTINGS', settings: draft });
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

        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="mb-1 block text-canvas-muted">Output folder</span>
            <input
              type="text"
              value={draft.outputFolder ?? ''}
              placeholder=".cursor-canvas/video-output"
              onChange={(event) =>
                setDraft({
                  ...draft,
                  outputFolder: event.target.value || null,
                })
              }
              className="w-full rounded border border-canvas-border bg-canvas-bg px-2 py-1 text-xs"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-canvas-muted">Estimated frames</span>
            <input
              type="number"
              min={1}
              value={draft.estimatedFrameCount}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  estimatedFrameCount: Number.parseInt(event.target.value, 10) || 60,
                })
              }
              className="w-full rounded border border-canvas-border bg-canvas-bg px-2 py-1 text-xs"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-canvas-muted">Port override</span>
            <input
              type="number"
              value={draft.portOverride ?? ''}
              placeholder="Auto"
              onChange={(event) =>
                setDraft({
                  ...draft,
                  portOverride: event.target.value
                    ? Number.parseInt(event.target.value, 10)
                    : null,
                })
              }
              className="w-full rounded border border-canvas-border bg-canvas-bg px-2 py-1 text-xs"
            />
          </label>
        </div>

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
