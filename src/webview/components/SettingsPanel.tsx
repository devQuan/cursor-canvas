import React, { useEffect, useState } from 'react';
import { postToExtension } from '../hooks/useMessageBridge';
import { useCanvasStore } from '../store/canvasStore';

const inputClassName =
  'w-full rounded border border-canvas-border bg-canvas-bg px-2 py-1.5 text-xs text-canvas-text outline-none focus:border-canvas-accent';

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
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Cursor Canvas settings"
    >
      <div className="canvas-panel-enter w-full max-w-md rounded border border-canvas-border bg-canvas-surface p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-canvas-text">Settings</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close settings"
            className="rounded px-1 text-canvas-muted hover:text-canvas-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-canvas-accent"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto text-sm">
          <fieldset className="space-y-3 border-0 p-0">
            <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-canvas-muted">
              Video
            </legend>

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
                className={inputClassName}
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
                    estimatedFrameCount:
                      Number.parseInt(event.target.value, 10) || 60,
                  })
                }
                className={inputClassName}
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3 border-0 border-t border-canvas-border p-0 pt-3">
            <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-canvas-muted">
              App
            </legend>

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
                className={inputClassName}
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3 border-0 border-t border-canvas-border p-0 pt-3">
            <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-canvas-muted">
              Game
            </legend>

            <label className="block">
              <span className="mb-1 block text-canvas-muted">Scene graph path</span>
              <input
                type="text"
                value={draft.sceneGraphPath}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    sceneGraphPath: event.target.value,
                  })
                }
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-canvas-muted">Unity WebGL path</span>
              <input
                type="text"
                value={draft.unityWebGlPath ?? ''}
                placeholder="Build/WebGL"
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    unityWebGlPath: event.target.value || null,
                  })
                }
                className={inputClassName}
              />
            </label>
          </fieldset>
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t border-canvas-border pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded border border-canvas-border px-3 py-1.5 text-xs text-canvas-text hover:bg-canvas-bg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-canvas-accent px-3 py-1.5 text-xs text-white hover:opacity-90"
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
