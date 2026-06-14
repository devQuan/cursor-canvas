import { describe, expect, it } from 'vitest';
import { TrackResolver } from '../../src/services/trackResolver';
import {
  createTempWorkspace,
  removeTempWorkspace,
  writeFile,
} from '../helpers/tempWorkspace';

describe('TrackResolver', () => {
  const resolver = new TrackResolver();

  it("returns 'app' when vite.config.ts is present", async () => {
    const workspace = await createTempWorkspace('track-app-');

    try {
      await writeFile(workspace, 'vite.config.ts', 'export default { server: { port: 5173 } }');
      expect(await resolver.resolve(workspace)).toBe('app');
    } finally {
      await removeTempWorkspace(workspace);
    }
  });

  it("returns 'app' when next.config.js is present", async () => {
    const workspace = await createTempWorkspace('track-next-');

    try {
      await writeFile(workspace, 'next.config.js', 'module.exports = {}');
      expect(await resolver.resolve(workspace)).toBe('app');
    } finally {
      await removeTempWorkspace(workspace);
    }
  });

  it("returns 'game' when three is in package.json dependencies", async () => {
    const workspace = await createTempWorkspace('track-game-');

    try {
      await writeFile(
        workspace,
        'package.json',
        JSON.stringify({ dependencies: { three: '^0.170.0' } }),
      );
      expect(await resolver.resolve(workspace)).toBe('game');
    } finally {
      await removeTempWorkspace(workspace);
    }
  });

  it("returns 'video' when output folder contains frame files", async () => {
    const workspace = await createTempWorkspace('track-video-');

    try {
      await writeFile(
        workspace,
        '.cursor-canvas/video-output/frame_0001.png',
        'x',
      );
      expect(await resolver.resolve(workspace)).toBe('video');
    } finally {
      await removeTempWorkspace(workspace);
    }
  });

  it("returns 'video' for nested project output folders", async () => {
    const workspace = await createTempWorkspace('track-video-nested-');

    try {
      await writeFile(
        workspace,
        'cursor-canvas/.cursor-canvas/video-output/frame_0001.png',
        'x',
      );
      expect(await resolver.resolve(workspace)).toBe('video');
    } finally {
      await removeTempWorkspace(workspace);
    }
  });

  it("returns 'ambiguous' when no recognizable files are found", async () => {
    const workspace = await createTempWorkspace('track-ambiguous-');

    try {
      expect(await resolver.resolve(workspace)).toBe('ambiguous');
    } finally {
      await removeTempWorkspace(workspace);
    }
  });

  it('prefers app markers over game and video markers', async () => {
    const workspace = await createTempWorkspace('track-priority-');

    try {
      await writeFile(workspace, 'vite.config.ts', 'export default {}');
      await writeFile(
        workspace,
        'package.json',
        JSON.stringify({ dependencies: { three: '^0.170.0' } }),
      );
      await writeFile(
        workspace,
        '.cursor-canvas/video-output/frame_0001.png',
        'x',
      );

      expect(await resolver.resolve(workspace)).toBe('app');
    } finally {
      await removeTempWorkspace(workspace);
    }
  });
});
