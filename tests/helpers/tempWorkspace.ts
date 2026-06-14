import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';

export async function createTempWorkspace(
  prefix = 'cursor-canvas-test-',
): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

export async function writeFile(
  workspacePath: string,
  relativePath: string,
  content: string,
): Promise<void> {
  const fullPath = path.join(workspacePath, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content, 'utf8');
}

export async function removeTempWorkspace(workspacePath: string): Promise<void> {
  await fs.rm(workspacePath, { recursive: true, force: true });
}
