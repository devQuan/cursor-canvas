import { describe, expect, it } from 'vitest';
import { getPreviewDevice, PREVIEW_DEVICES } from '../../src/webview/lib/devicePresets';

describe('devicePresets', () => {
  it('includes android and ipad landscape devices', () => {
    const ids = PREVIEW_DEVICES.map((device) => device.id);

    expect(ids).toContain('android-phone');
    expect(ids).toContain('ipad-pro-landscape');
  });

  it('uses landscape dimensions for ipad landscape preset', () => {
    const device = getPreviewDevice('ipad-pro-landscape');

    expect(device.width).toBe(1194);
    expect(device.height).toBe(834);
    expect(device.frameVariant).toBe('ipad');
  });

  it('uses pixel dimensions for android preset', () => {
    const device = getPreviewDevice('android-phone');

    expect(device.width).toBe(412);
    expect(device.height).toBe(915);
    expect(device.frameVariant).toBe('android');
  });
});
