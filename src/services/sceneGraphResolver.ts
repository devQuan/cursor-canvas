import * as fs from 'fs/promises';
import * as path from 'path';

const DEFAULT_SCENE_GRAPH_PATH = '.cursor-canvas/scene-graph.json';

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
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

async function collectSceneGraphCandidates(
  workspaceRoot: string,
  configuredPath?: string | null,
): Promise<string[]> {
  const candidates = new Set<string>();

  if (configuredPath) {
    candidates.add(
      path.isAbsolute(configuredPath)
        ? configuredPath
        : path.join(workspaceRoot, configuredPath),
    );
  }

  candidates.add(path.join(workspaceRoot, DEFAULT_SCENE_GRAPH_PATH));

  const entries = await readTopLevelEntries(workspaceRoot);
  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'node_modules') {
      continue;
    }

    const nestedRoot = path.join(workspaceRoot, entry);
    try {
      const stat = await fs.stat(nestedRoot);
      if (!stat.isDirectory()) {
        continue;
      }
    } catch {
      continue;
    }

    candidates.add(path.join(nestedRoot, DEFAULT_SCENE_GRAPH_PATH));

    if (configuredPath && !path.isAbsolute(configuredPath)) {
      candidates.add(path.join(nestedRoot, configuredPath));
    }
  }

  return [...candidates];
}

export async function resolveSceneGraphPath(
  workspaceRoots: string[],
  configuredPath?: string | null,
): Promise<string | null> {
  for (const workspaceRoot of workspaceRoots) {
    const candidates = await collectSceneGraphCandidates(
      workspaceRoot,
      configuredPath,
    );

    for (const candidate of candidates) {
      if (await pathExists(candidate)) {
        return candidate;
      }
    }
  }

  if (workspaceRoots.length === 0) {
    return null;
  }

  return path.join(workspaceRoots[0], configuredPath ?? DEFAULT_SCENE_GRAPH_PATH);
}
