import * as fs from 'fs/promises';
import * as path from 'path';
import type { Track } from '../types';
import {
  DEFAULT_VIDEO_OUTPUT_FOLDER,
  directoryHasVideoOutput,
} from './outputDirResolver';

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

const DEFAULT_OUTPUT_DIRS = [
  DEFAULT_VIDEO_OUTPUT_FOLDER,
  'output',
  'frames',
  'video-output',
  'renders',
];

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

  if (await pathExists(path.join(workspacePath, 'project.godot'))) {
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


async function collectVideoDirs(
  workspacePath: string,
  outputFolder?: string | null,
): Promise<string[]> {
  const dirs = new Set<string>();

  if (outputFolder) {
    dirs.add(
      path.isAbsolute(outputFolder)
        ? outputFolder
        : path.join(workspacePath, outputFolder),
    );
  }

  for (const dirName of DEFAULT_OUTPUT_DIRS) {
    dirs.add(path.join(workspacePath, dirName));
  }

  const entries = await readDirSafe(workspacePath);
  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'node_modules') {
      continue;
    }

    const nestedRoot = path.join(workspacePath, entry);
    const stat = await fs.stat(nestedRoot).catch(() => null);
    if (!stat?.isDirectory()) {
      continue;
    }

    for (const dirName of DEFAULT_OUTPUT_DIRS) {
      dirs.add(path.join(nestedRoot, dirName));
    }
  }

  return [...dirs];
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

  const dirsToCheck = await collectVideoDirs(workspacePath, outputFolder);

  for (const dir of dirsToCheck) {
    if (await directoryHasVideoOutput(dir)) {
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
