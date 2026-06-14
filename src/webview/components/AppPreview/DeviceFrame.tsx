import React, { useEffect, useRef, useState } from 'react';
import type { PreviewDevice } from '../../lib/devicePresets';
import { getDeviceDimensionsLabel } from '../../lib/devicePresets';

interface DeviceFrameProps {
  device: PreviewDevice;
  previewUrl?: string;
  children?: React.ReactNode;
}

function computeScale(
  stageWidth: number,
  stageHeight: number,
  device: PreviewDevice,
): number {
  if (!device.framed) {
    return 1;
  }

  const shellWidth = device.width + device.bezel * 2;
  const shellHeight = device.height + device.bezel * 2 + 28;
  const padding = 48;

  const scaleX = (stageWidth - padding) / shellWidth;
  const scaleY = (stageHeight - padding) / shellHeight;

  return Math.min(scaleX, scaleY, 1);
}

function DeviceChrome({ device }: { device: PreviewDevice }): React.ReactNode {
  if (device.frameVariant === 'iphone') {
    return (
      <div className="pointer-events-none absolute left-1/2 top-3 z-10 h-[26px] w-[108px] -translate-x-1/2 rounded-full bg-black/95 shadow-inner" />
    );
  }

  if (device.frameVariant === 'android') {
    return (
      <div className="pointer-events-none absolute left-1/2 top-3 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-black/90 ring-1 ring-white/10" />
    );
  }

  if (device.frameVariant === 'ipad') {
    return (
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 h-1 w-28 -translate-x-1/2 rounded-full bg-white/70" />
    );
  }

  return null;
}

const DeviceFrame = React.memo(({ device, previewUrl, children }: DeviceFrameProps) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !device.framed) {
      setScale(1);
      return;
    }

    const updateScale = (): void => {
      setScale(computeScale(stage.clientWidth, stage.clientHeight, device));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(stage);

    return () => {
      observer.disconnect();
    };
  }, [device]);

  if (!device.framed) {
    return (
      <div ref={stageRef} className="h-full w-full">
        {children ?? (
          <iframe
            title="App preview"
            src={previewUrl}
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        )}
      </div>
    );
  }

  const shellWidth = device.width + device.bezel * 2;
  const shellBackground =
    device.frameVariant === 'android'
      ? 'linear-gradient(155deg, #2f3338 0%, #17191d 48%, #090a0c 100%)'
      : 'linear-gradient(145deg, #3a3a3f 0%, #151518 45%, #0b0b0d 100%)';

  return (
    <div
      ref={stageRef}
      className="flex h-full w-full flex-col items-center justify-center overflow-hidden px-4 py-6"
    >
      <div
        className="origin-center transition-transform duration-300 ease-out"
        style={{ transform: `scale(${scale})` }}
      >
        <div
          className="relative shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
          style={{
            width: shellWidth,
            borderRadius: device.cornerRadius + device.bezel,
            padding: device.bezel,
            background: shellBackground,
          }}
        >
          <div
            className="relative overflow-hidden bg-black"
            style={{
              width: device.width,
              height: device.height,
              borderRadius: device.cornerRadius,
            }}
          >
            <DeviceChrome device={device} />

            {children ? (
              <div
                className="overflow-hidden bg-[#0f0f12]"
                style={{ width: device.width, height: device.height }}
              >
                {children}
              </div>
            ) : (
              <iframe
                title="App preview"
                src={previewUrl}
                width={device.width}
                height={device.height}
                className="border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-canvas-muted">
        {device.label} · {getDeviceDimensionsLabel(device)}
      </p>
    </div>
  );
});

DeviceFrame.displayName = 'DeviceFrame';

export default DeviceFrame;
