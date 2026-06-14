import * as fs from 'fs/promises';
import * as path from 'path';
import type { Track } from '../types';

const APP_CONFIG_FILES = [
  'vite.config.ts',
  'vite.config.js',
  'vite.config.mjs',
  'next.config.js',
  'next.config.ts',
  'next.config.mjs',
  'nuxt.config.ts',
  'nuxt.config.js',
  'remix.config.js',
];

const GAME_PACKAGE_DEPS = [
  'three',
  '@react-three/fiber',
  '@react-three/drei',
  'babylonjs',
  '@babylonjs/core',
  'phaser',
  'playcanvas',
];

const VIDEO_CONFIG_FILES = [
  'higgsfield.config',
  'higgsfield.config.js',
  'higgsfield.config.ts',
  'seedance.config',
  'seedance.config.js',
  'seedance.config.ts',
];

const FRAME_FILE_PATTERN = /^frame_\d+\.(png|jpe?g)$/i;
const VIDEO_FILE_PATTERN = /\.(mp4|webm)$/i;

const DEFAULT_OUTPUT_DIRS = ['output', 'frames', 'video-output', 'renders'];

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readDirSafe(dirPath: string): Promise<string[]> {
  try {
    return await fs.readdir(dirPath);
  } catch {
    return [];
  }
}

async function hasAppMarkers(workspacePath: string): Promise<boolean> {
  for (const file of APP_CONFIG_FILES) {
    if (await pathExists(path.join(workspacePath, file))) {
      return true;
    }
  }

  return false;
}

async function directoryHasExtension(
  dirPath: string,
  extension: string,
  maxDepth = 2,
): Promise<boolean> {
  if (maxDepth < 0) {
    return false;
  }

  const entries = await readDirSafe(dirPath);

  for (const entry of entries) {
    if (entry === 'node_modules' || entry === '.git' || entry.startsWith('.')) {
      continue;
    }

    const entryPath = path.join(dirPath, entry);
    const stat = await fs.stat(entryPath).catch(() => null);

    if (!stat) {
      continue;
    }

    if (stat.isFile() && entry.endsWith(extension)) {
      return true;
    }

    if (stat.isDirectory() && maxDepth > 0) {
      const nested = await directoryHasExtension(entryPath, extension, maxDepth - 1);
      if (nested) {
        return true;
      }
    }
  }

  return false;
}

async function hasGameMarkers(workspacePath: string): Promise<boolean> {
  if (await pathExists(path.join(workspacePath, 'ProjectSettings', 'ProjectVersion.txt'))) {
    return true;
  }

  if (await directoryHasExtension(workspacePath, '.rbxl', 1)) {
    return true;
  }

  if (await directoryHasExtension(workspacePath, '.unity', 2)) {
    return true;
  }

  const packageJsonPath = path.join(workspacePath, 'package.json');
  if (!(await pathExists(packageJsonPath))) {
    return false;
  }

  try {
    const raw = await fs.readFile(packageJsonPath, 'utf8');
    const pkg = JSON.parse(raw) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    return GAME_PACKAGE_DEPS.some((dep) => dep in deps);
  } catch {
    return false;
  }
}

async function directoryHasFrameFiles(dirPath: string): Promise<boolean> {
  const entries = await readDirSafe(dirPath);
  return entries.some((entry) => FRAME_FILE_PATTERN.test(entry));
}

async function directoryHasVideoFiles(dirPath: string): Promise<boolean> {
  const entries = await readDirSafe(dirPath);
  return entries.some((entry) => VIDEO_FILE_PATTERN.test(entry));
}

async function hasVideoMarkers(
  workspacePath: string,
  outputFolder?: string | null,
): Promise<boolean> {
  for (const file of VIDEO_CONFIG_FILES) {
    if (await pathExists(path.join(workspacePath, file))) {
      return true;
    }
  }

  const dirsToCheck = new Set<string>();

  if (outputFolder) {
    dirsToCheck.add(outputFolder);
  }

  for (const dirName of DEFAULT_OUTPUT_DIRS) {
    dirsToCheck.add(path.join(workspacePath, dirName));
  }

  for (const dir of dirsToCheck) {
    if (!(await pathExists(dir))) {
      continue;
    }

    if (
      (await directoryHasFrameFiles(dir)) ||
      (await directoryHasVideoFiles(dir))
    ) {
      return true;
    }
  }

  return false;
}

export class TrackResolver {
  async resolve(
    workspacePath: string,
    outputFolder?: string | null,
  ): Promise<Track | 'ambiguous'> {
    try {
      if (await hasAppMarkers(workspacePath)) {
        return 'app';
      }

      if (await hasGameMarkers(workspacePath)) {
        return 'game';
      }

      if (await hasVideoMarkers(workspacePath, outputFolder)) {
        return 'video';
      }

      return 'ambiguous';
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Track resolution failed';
      throw new Error(message);
    }
  }

  dispose(): void {
    // stateless resolver — nothing to clean up
  }
}
