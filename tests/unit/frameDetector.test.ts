import * as fs from 'fs/promises';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import {
  findLatestVideoFile,
  isFrameFile,
  isVideoFile,
  listFrameFiles,
  parseFrameIndex,
} from '../../src/services/frameDetector';
import {
  createTempWorkspace,
  removeTempWorkspace,
  writeFile,
} from '../helpers/tempWorkspace';

describe('frameDetector', () => {
  it('parses frame index from frame file names', () => {
    expect(parseFrameIndex('frame_0001.png')).toBe(1);
    expect(parseFrameIndex('frame_0010.jpg')).toBe(10);
    expect(parseFrameIndex('not-a-frame.png')).toBeNull();
  });

  it('identifies frame and video files', () => {
    expect(isFrameFile('frame_0001.png')).toBe(true);
    expect(isFrameFile('output.mp4')).toBe(false);
    expect(isVideoFile('render.webm')).toBe(true);
    expect(isVideoFile('frame_0002.png')).toBe(false);
  });

  it('sorts frames by index so frame_010 comes after frame_009', async () => {
    const workspace = await createTempWorkspace('frame-sort-');
    const outputDir = path.join(workspace, 'frames');

    try {
      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(path.join(outputDir, 'frame_0010.png'), 'a');
      await fs.writeFile(path.join(outputDir, 'frame_0009.png'), 'b');
      await fs.writeFile(path.join(outputDir, 'frame_0002.png'), 'c');

      const frames = await listFrameFiles(outputDir);
      expect(frames.map((framePath) => path.basename(framePath))).toEqual([
        'frame_0002.png',
        'frame_0009.png',
        'frame_0010.png',
      ]);
    } finally {
      await removeTempWorkspace(workspace);
    }
  });

  it('finds the latest video file in a directory', async () => {
    const workspace = await createTempWorkspace('video-find-');
    const outputDir = path.join(workspace, 'output');

    try {
      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(path.join(outputDir, 'clip-a.mp4'), 'a');
      await fs.writeFile(path.join(outputDir, 'clip-b.webm'), 'b');

      const latest = await findLatestVideoFile(outputDir);
      expect(latest).toBe(path.join(outputDir, 'clip-b.webm'));
    } finally {
      await removeTempWorkspace(workspace);
    }
  });
});

describe('frameDetector fixtures', () => {
  it('writes sample frame files for integration-style checks', async () => {
    const workspace = await createTempWorkspace('frame-write-');

    try {
      await writeFile(workspace, '.cursor-canvas/video-output/frame_0001.png', 'x');
      const frames = await listFrameFiles(
        path.join(workspace, '.cursor-canvas/video-output'),
      );
      expect(frames).toHaveLength(1);
    } finally {
      await removeTempWorkspace(workspace);
    }
  });
});
