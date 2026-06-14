import * as fs from 'fs/promises';
import * as path from 'path';
import type { GameEngine } from '../types';

const WEB_GAME_PACKAGE_DEPS = [
  'three',
  '@react-three/fiber',
  '@react-three/drei',
  'babylonjs',
  '@babylonjs/core',
  'phaser',
  'playcanvas',
];

const UNITY_BUILD_CANDIDATES = [
  'Build/WebGL',
  'build/webgl',
  'Builds/WebGL',
  'WebGLBuild',
  'build',
];

const GODOT_WEB_CANDIDATES = [
  'build/web/index.html',
  'export/web/index.html',
  'web/index.html',
  'Build/Web/index.html',
];

export interface EngineDetectionResult {
  engine: GameEngine;
  unityBuildIndexPath?: string;
  godotBuildIndexPath?: string;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readPackageJson(
  workspacePath: string,
): Promise<Record<string, unknown> | null> {
  try {
    const raw = await fs.readFile(
      path.join(workspacePath, 'package.json'),
      'utf8',
    );
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function hasWebGameDependency(pkg: Record<string, unknown>): boolean {
  const deps = {
    ...(pkg.dependencies as Record<string, string> | undefined),
    ...(pkg.devDependencies as Record<string, string> | undefined),
  };

  return WEB_GAME_PACKAGE_DEPS.some((dep) => dep in deps);
}

async function findUnityWebGlIndex(
  workspacePath: string,
  configuredPath?: string | null,
): Promise<string | undefined> {
  const candidates = new Set<string>();

  if (configuredPath) {
    candidates.add(
      path.isAbsolute(configuredPath)
        ? configuredPath
        : path.join(workspacePath, configuredPath),
    );
  }

  for (const candidate of UNITY_BUILD_CANDIDATES) {
    candidates.add(path.join(workspacePath, candidate));
  }

  for (const buildDir of candidates) {
    const indexPath = path.join(buildDir, 'index.html');
    if (await pathExists(indexPath)) {
      return indexPath;
    }
  }

  return undefined;
}

async function findGodotWebIndex(
  workspacePath: string,
): Promise<string | undefined> {
  for (const candidate of GODOT_WEB_CANDIDATES) {
    const indexPath = path.join(workspacePath, candidate);
    if (await pathExists(indexPath)) {
      return indexPath;
    }
  }

  return undefined;
}

export class EngineDetector {
  async detect(
    workspacePath: string,
    unityWebGlPath?: string | null,
  ): Promise<EngineDetectionResult> {
    const isUnityProject = await pathExists(
      path.join(workspacePath, 'ProjectSettings', 'ProjectVersion.txt'),
    );

    if (isUnityProject) {
      const unityBuildIndexPath = await findUnityWebGlIndex(
        workspacePath,
        unityWebGlPath,
      );

      if (unityBuildIndexPath) {
        return { engine: 'unity-webgl', unityBuildIndexPath };
      }

      return { engine: 'unity' };
    }

    const isGodotProject = await pathExists(
      path.join(workspacePath, 'project.godot'),
    );

    if (isGodotProject) {
      const godotBuildIndexPath = await findGodotWebIndex(workspacePath);

      if (godotBuildIndexPath) {
        return { engine: 'godot-webgl', godotBuildIndexPath };
      }

      return { engine: 'godot' };
    }

    const packageJson = await readPackageJson(workspacePath);
    if (packageJson && hasWebGameDependency(packageJson)) {
      return { engine: 'threejs' };
    }

    return { engine: 'generic-iframe' };
  }

  dispose(): void {
    // stateless service
  }
}
