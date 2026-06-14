import { describe, expect, it } from 'vitest';
import { resolveVideoOutputDir } from '../../src/services/outputDirResolver';
import {
  createTempWorkspace,
  removeTempWorkspace,
  writeFile,
} from '../helpers/tempWorkspace';

describe('outputDirResolver', () => {
  it('finds nested project video output folders with frames', async () => {
    const workspace = await createTempWorkspace('output-nested-');

    try {
      await writeFile(
        workspace,
        'cursor-canvas/.cursor-canvas/video-output/frame_0001.png',
        'x',
      );
      await writeFile(
        workspace,
        'cursor-canvas/.cursor-canvas/video-output/frame_0002.png',
        'y',
      );

      const resolved = await resolveVideoOutputDir([workspace], {
        outputFolder: null,
        estimatedFrameCount: 60,
        portOverride: null,
        framePollingIntervalMs: 1000,
        sceneGraphPath: '.cursor-canvas/scene-graph.json',
        unityWebGlPath: null,
      });

      expect(resolved.frameCount).toBe(2);
      expect(resolved.outputDir).toContain('cursor-canvas/.cursor-canvas/video-output');
    } finally {
      await removeTempWorkspace(workspace);
    }
  });

  it('falls back to the primary workspace default folder when empty', async () => {
    const workspace = await createTempWorkspace('output-empty-');

    try {
      const resolved = await resolveVideoOutputDir([workspace], {
        outputFolder: null,
        estimatedFrameCount: 60,
        portOverride: null,
        framePollingIntervalMs: 1000,
        sceneGraphPath: '.cursor-canvas/scene-graph.json',
        unityWebGlPath: null,
      });

      expect(resolved.frameCount).toBe(0);
      expect(resolved.outputDir).toContain('.cursor-canvas/video-output');
    } finally {
      await removeTempWorkspace(workspace);
    }
  });
});
