import React from 'react';
import type { PreviewDeviceId } from '../../lib/devicePresets';
import { PREVIEW_DEVICES } from '../../lib/devicePresets';
import { useCanvasStore } from '../../store/canvasStore';

const DeviceSwitcher = React.memo(() => {
  const previewDevice = useCanvasStore((state) => state.previewDevice);
  const setPreviewDevice = useCanvasStore((state) => state.setPreviewDevice);

  return (
    <div
      className="flex max-w-full overflow-x-auto rounded-md border border-canvas-border bg-canvas-bg/80 p-0.5"
      role="group"
      aria-label="Preview device"
    >
      {PREVIEW_DEVICES.map((device) => {
        const isActive = previewDevice === device.id;

        return (
          <button
            key={device.id}
            type="button"
            aria-pressed={isActive}
            aria-label={device.label}
            title={device.label}
            onClick={() => setPreviewDevice(device.id as PreviewDeviceId)}
            className={[
              'shrink-0 px-2.5 py-1 text-[11px] font-medium transition-all',
              isActive
                ? 'rounded bg-canvas-accent text-white shadow-sm'
                : 'text-canvas-muted hover:text-canvas-text',
            ].join(' ')}
          >
            {device.shortLabel}
          </button>
        );
      })}
    </div>
  );
});

DeviceSwitcher.displayName = 'DeviceSwitcher';

export default DeviceSwitcher;
