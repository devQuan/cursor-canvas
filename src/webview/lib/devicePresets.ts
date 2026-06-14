export type PreviewDeviceId =
  | 'desktop'
  | 'iphone-15'
  | 'android-phone'
  | 'ipad-pro'
  | 'ipad-pro-landscape';

export type DeviceFrameVariant = 'none' | 'iphone' | 'android' | 'ipad';

export interface PreviewDevice {
  id: PreviewDeviceId;
  label: string;
  shortLabel: string;
  width: number;
  height: number;
  framed: boolean;
  cornerRadius: number;
  bezel: number;
  frameVariant: DeviceFrameVariant;
}

export const PREVIEW_DEVICES: PreviewDevice[] = [
  {
    id: 'desktop',
    label: 'Desktop',
    shortLabel: 'Web',
    width: 0,
    height: 0,
    framed: false,
    cornerRadius: 0,
    bezel: 0,
    frameVariant: 'none',
  },
  {
    id: 'iphone-15',
    label: 'iPhone 15 Pro',
    shortLabel: 'iPhone',
    width: 393,
    height: 852,
    framed: true,
    cornerRadius: 46,
    bezel: 12,
    frameVariant: 'iphone',
  },
  {
    id: 'android-phone',
    label: 'Pixel 8',
    shortLabel: 'Android',
    width: 412,
    height: 915,
    framed: true,
    cornerRadius: 38,
    bezel: 10,
    frameVariant: 'android',
  },
  {
    id: 'ipad-pro',
    label: 'iPad Pro 11" Portrait',
    shortLabel: 'iPad',
    width: 834,
    height: 1194,
    framed: true,
    cornerRadius: 30,
    bezel: 16,
    frameVariant: 'ipad',
  },
  {
    id: 'ipad-pro-landscape',
    label: 'iPad Pro 11" Landscape',
    shortLabel: 'iPad ↔',
    width: 1194,
    height: 834,
    framed: true,
    cornerRadius: 30,
    bezel: 16,
    frameVariant: 'ipad',
  },
];

export function getPreviewDevice(id: PreviewDeviceId): PreviewDevice {
  return PREVIEW_DEVICES.find((device) => device.id === id) ?? PREVIEW_DEVICES[0];
}

export function getDeviceDimensionsLabel(device: PreviewDevice): string {
  if (!device.framed) {
    return 'Responsive';
  }

  return `${device.width} × ${device.height}`;
}
