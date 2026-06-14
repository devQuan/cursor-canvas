import { describe, expect, it } from 'vitest';
import { resolveSceneGraphPath } from '../../src/services/sceneGraphResolver';
import {
  createTempWorkspace,
  removeTempWorkspace,
  writeFile,
} from '../helpers/tempWorkspace';

describe('sceneGraphResolver', () => {
  it('finds nested project scene graph files', async () => {
    const workspace = await createTempWorkspace('scene-graph-nested-');

    try {
      await writeFile(
        workspace,
        'cursor-canvas/.cursor-canvas/scene-graph.json',
        '{"objects":[]}',
      );

      const resolved = await resolveSceneGraphPath([workspace], null);
      expect(resolved).toContain('cursor-canvas/.cursor-canvas/scene-graph.json');
    } finally {
      await removeTempWorkspace(workspace);
    }
  });
});
