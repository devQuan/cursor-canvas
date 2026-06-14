import * as fs from 'fs/promises';
import * as path from 'path';

const FRAME_FILE_PATTERN = /^frame_(\d+)\.(png|jpe?g)$/i;

export function parseFrameIndex(fileName: string): number | null {
  const match = FRAME_FILE_PATTERN.exec(fileName);
  if (!match?.[1]) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

export function isFrameFile(fileName: string): boolean {
  return FRAME_FILE_PATTERN.test(fileName);
}

export function isVideoFile(fileName: string): boolean {
  return /\.(mp4|webm)$/i.test(fileName);
}

export async function listFrameFiles(outputDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(outputDir);
    return entries
      .filter(isFrameFile)
      .sort((left, right) => {
        const leftIndex = parseFrameIndex(left) ?? 0;
        const rightIndex = parseFrameIndex(right) ?? 0;
        return leftIndex - rightIndex;
      })
      .map((entry) => path.join(outputDir, entry));
  } catch {
    return [];
  }
}

export async function findLatestVideoFile(
  outputDir: string,
): Promise<string | null> {
  try {
    const entries = await fs.readdir(outputDir);
    const videos = entries.filter(isVideoFile).sort();
    if (videos.length === 0) {
      return null;
    }

    return path.join(outputDir, videos[videos.length - 1]);
  } catch {
    return null;
  }
}

export function frameTimestamp(frameIndex: number, fps = 24): number {
  return frameIndex / fps;
}
