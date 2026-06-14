import { describe, expect, it, vi } from 'vitest';
import { PortDetector } from '../../src/services/portDetector';
import {
  createTempWorkspace,
  removeTempWorkspace,
  writeFile,
} from '../helpers/tempWorkspace';

describe('PortDetector', () => {
  const detector = new PortDetector();

  it('reads port from vite.config server.port', async () => {
    const workspace = await createTempWorkspace('port-vite-');

    try {
      await writeFile(
        workspace,
        'vite.config.ts',
        'export default { server: { port: 4321 } }',
      );

      expect(await detector.detectFromConfig(workspace)).toBe(4321);
    } finally {
      await removeTempWorkspace(workspace);
    }
  });

  it('reads port from next.config server.port', async () => {
    const workspace = await createTempWorkspace('port-next-');

    try {
      await writeFile(
        workspace,
        'next.config.js',
        'module.exports = { server: { port: 3005 } }',
      );

      expect(await detector.detectFromConfig(workspace)).toBe(3005);
    } finally {
      await removeTempWorkspace(workspace);
    }
  });

  it('uses port override before config and scan', async () => {
    const workspace = await createTempWorkspace('port-override-');
    const pingSpy = vi.spyOn(detector, 'ping').mockResolvedValue(false);

    try {
      await writeFile(
        workspace,
        'vite.config.ts',
        'export default { server: { port: 5173 } }',
      );

      const result = await detector.detect(workspace, 7777);
      expect(result).toEqual({ port: 7777, source: 'config' });
      expect(pingSpy).not.toHaveBeenCalled();
    } finally {
      pingSpy.mockRestore();
      await removeTempWorkspace(workspace);
    }
  });

  it('scans ports in priority order when config port is offline', async () => {
    const pingSpy = vi
      .spyOn(detector, 'ping')
      .mockImplementation(async (port) => port === 5173);

    try {
      const scanned = await detector.scan([3000, 3001, 5173, 4000]);
      expect(scanned).toBe(5173);
    } finally {
      pingSpy.mockRestore();
    }
  });

  it('returns null when no port responds and no config exists', async () => {
    const workspace = await createTempWorkspace('port-none-');
    const pingSpy = vi.spyOn(detector, 'ping').mockResolvedValue(false);

    try {
      expect(await detector.detect(workspace)).toBeNull();
    } finally {
      pingSpy.mockRestore();
      await removeTempWorkspace(workspace);
    }
  });
});
