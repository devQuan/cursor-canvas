import { describe, expect, it } from 'vitest';
import { EngineDetector } from '../../src/services/engineDetector';
import {
  createTempWorkspace,
  removeTempWorkspace,
  writeFile,
} from '../helpers/tempWorkspace';

describe('EngineDetector', () => {
  const detector = new EngineDetector();

  it("detects 'threejs' when three is in dependencies", async () => {
    const workspace = await createTempWorkspace('engine-three-');

    try {
      await writeFile(
        workspace,
        'package.json',
        JSON.stringify({ dependencies: { three: '^0.170.0' } }),
      );

      const result = await detector.detect(workspace);
      expect(result.engine).toBe('threejs');
    } finally {
      await removeTempWorkspace(workspace);
    }
  });

  it("detects 'unity-webgl' when Unity project and build index exist", async () => {
    const workspace = await createTempWorkspace('engine-unity-');

    try {
      await writeFile(workspace, 'ProjectSettings/ProjectVersion.txt', '6000');
      await writeFile(workspace, 'Build/WebGL/index.html', '<html></html>');

      const result = await detector.detect(workspace);
      expect(result.engine).toBe('unity-webgl');
      expect(result.unityBuildIndexPath).toContain('Build/WebGL/index.html');
    } finally {
      await removeTempWorkspace(workspace);
    }
  });

  it("falls back to 'generic-iframe' when nothing matches", async () => {
    const workspace = await createTempWorkspace('engine-generic-');

    try {
      const result = await detector.detect(workspace);
      expect(result.engine).toBe('generic-iframe');
    } finally {
      await removeTempWorkspace(workspace);
    }
  });
});
