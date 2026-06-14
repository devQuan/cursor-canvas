/** Stub — implemented in Phase 3 (App Preview Mode). */
export class PortDetector {
  async detect(_workspacePath: string): Promise<number | null> {
    return null;
  }

  async scan(_ports: number[]): Promise<number | null> {
    return null;
  }

  dispose(): void {
    // no-op until Phase 3
  }
}
