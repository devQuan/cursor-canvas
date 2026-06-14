import * as fs from 'fs/promises';
import * as path from 'path';
import type { CanvasSettings } from '../types';
import { findLatestVideoFile, isVideoFile, listFrameFiles } from './frameDetector';

export const DEFAULT_VIDEO_OUTPUT_FOLDER = '.cursor-canvas/video-output';

const LEGACY_OUTPUT_DIRS = ['output', 'frames', 'video-output', 'renders'];

export interface ResolvedVideoOutput {
  outputDir: string;
  workspaceRoot: string;
  frameCount: number;
  hasVideo: boolean;
}

async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function readTopLevelEntries(dirPath: string): Promise<string[]> {
  try {
    return await fs.readdir(dirPath);
  } catch {
    return [];
  }
}

async function collectCandidateDirs(
  workspaceRoot: string,
  settings: CanvasSettings,
): Promise<string[]> {
  const candidates = new Set<string>();

  if (settings.outputFolder) {
    candidates.add(
      path.isAbsolute(settings.outputFolder)
        ? settings.outputFolder
        : path.join(workspaceRoot, settings.outputFolder),
    );
  }

  candidates.add(path.join(workspaceRoot, DEFAULT_VIDEO_OUTPUT_FOLDER));

  for (const dirName of LEGACY_OUTPUT_DIRS) {
    candidates.add(path.join(workspaceRoot, dirName));
  }

  const entries = await readTopLevelEntries(workspaceRoot);
  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'node_modules') {
      continue;
    }

    const nestedRoot = path.join(workspaceRoot, entry);
    if (!(await isDirectory(nestedRoot))) {
      continue;
    }

    candidates.add(path.join(nestedRoot, DEFAULT_VIDEO_OUTPUT_FOLDER));

    for (const dirName of LEGACY_OUTPUT_DIRS) {
      candidates.add(path.join(nestedRoot, dirName));
    }
  }

  return [...candidates];
}

async function scoreOutputDir(outputDir: string): Promise<ResolvedVideoOutput | null> {
  if (!(await isDirectory(outputDir))) {
    return null;
  }

  const frames = await listFrameFiles(outputDir);
  const latestVideo = await findLatestVideoFile(outputDir);

  if (frames.length === 0 && !latestVideo) {
    return null;
  }

  return {
    outputDir,
    workspaceRoot: outputDir,
    frameCount: frames.length,
    hasVideo: Boolean(latestVideo),
  };
}

export async function resolveVideoOutputDir(
  workspaceRoots: string[],
  settings: CanvasSettings,
): Promise<ResolvedVideoOutput> {
  if (workspaceRoots.length === 0) {
    throw new Error('Open a workspace folder to watch video output.');
  }

  let bestMatch: ResolvedVideoOutput | null = null;

  for (const workspaceRoot of workspaceRoots) {
    const candidates = await collectCandidateDirs(workspaceRoot, settings);

    for (const candidate of candidates) {
      const scored = await scoreOutputDir(candidate);
      if (!scored) {
        continue;
      }

      scored.workspaceRoot = workspaceRoot;

      if (
        !bestMatch ||
        scored.frameCount > bestMatch.frameCount ||
        (scored.hasVideo && !bestMatch.hasVideo)
      ) {
        bestMatch = scored;
      }
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  const primaryRoot = workspaceRoots[0];
  const fallbackDir = settings.outputFolder
    ? path.isAbsolute(settings.outputFolder)
      ? settings.outputFolder
      : path.join(primaryRoot, settings.outputFolder)
    : path.join(primaryRoot, DEFAULT_VIDEO_OUTPUT_FOLDER);

  await fs.mkdir(fallbackDir, { recursive: true });

  return {
    outputDir: fallbackDir,
    workspaceRoot: primaryRoot,
    frameCount: 0,
    hasVideo: false,
  };
}

export async function directoryHasVideoOutput(dirPath: string): Promise<boolean> {
  if (!(await isDirectory(dirPath))) {
    return false;
  }

  const frames = await listFrameFiles(dirPath);
  if (frames.length > 0) {
    return true;
  }

  const entries = await readTopLevelEntries(dirPath);
  return entries.some(isVideoFile);
}
