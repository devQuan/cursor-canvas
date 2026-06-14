import type { GameEngine } from '../types';

/** Stub — implemented in Phase 4 (Game Preview Mode). */
export class EngineDetector {
  detect(_workspacePath: string): GameEngine {
    return 'threejs';
  }

  dispose(): void {
    // no-op until Phase 4
  }
}
