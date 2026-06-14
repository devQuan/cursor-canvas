import chokidar, { type FSWatcher } from 'chokidar';
import * as vscode from 'vscode';

const DEBOUNCE_MS = 300;
const FRAME_FILE_PATTERN = /^frame_\d+\.(png|jpe?g)$/i;
const VIDEO_FILE_PATTERN = /\.(mp4|webm)$/i;

function shouldIgnorePath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  return (
    normalized.includes('/node_modules/') ||
    normalized.includes('/.git/') ||
    normalized.includes('/dist/') ||
    normalized.includes('/.cursor/')
  );
}

function createDebouncedCallback(
  callback: () => void,
  delayMs: number,
): { trigger: () => void; dispose: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return {
    trigger: () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(callback, delayMs);
    },
    dispose: () => {
      if (timer) {
        clearTimeout(timer);
      }
    },
  };
}

export class FileWatcher {
  private workspaceWatcher: FSWatcher | undefined;
  private frameWatcher: FSWatcher | undefined;
  private videoWatcher: FSWatcher | undefined;
  private debouncers: Array<{ dispose: () => void }> = [];

  watchWorkspace(
    root: string,
    onChange: () => void,
  ): vscode.Disposable {
    this.workspaceWatcher?.close();

    const debounced = createDebouncedCallback(onChange, DEBOUNCE_MS);
    this.debouncers.push(debounced);

    this.workspaceWatcher = chokidar.watch(root, {
      ignoreInitial: true,
      depth: 4,
      ignored: (watchPath) => shouldIgnorePath(watchPath),
    });

    this.workspaceWatcher.on('all', () => {
      debounced.trigger();
    });

    return new vscode.Disposable(() => {
      debounced.dispose();
      void this.workspaceWatcher?.close();
      this.workspaceWatcher = undefined;
    });
  }

  watchFrames(
    outputDir: string,
    onFrame: (framePath: string) => void,
  ): vscode.Disposable {
    this.frameWatcher?.close();

    let pendingPath: string | undefined;
    const debounced = createDebouncedCallback(() => {
      if (pendingPath) {
        onFrame(pendingPath);
        pendingPath = undefined;
      }
    }, DEBOUNCE_MS);
    this.debouncers.push(debounced);

    this.frameWatcher = chokidar.watch(outputDir, {
      ignoreInitial: false,
      depth: 0,
      ignored: (watchPath) => shouldIgnorePath(watchPath),
    });

    this.frameWatcher.on('add', (filePath) => {
      const fileName = filePath.split(/[/\\]/).pop() ?? '';
      if (!FRAME_FILE_PATTERN.test(fileName)) {
        return;
      }

      pendingPath = filePath;
      debounced.trigger();
    });

    return new vscode.Disposable(() => {
      debounced.dispose();
      void this.frameWatcher?.close();
      this.frameWatcher = undefined;
    });
  }

  watchVideo(
    outputDir: string,
    onVideo: (videoPath: string) => void,
  ): vscode.Disposable {
    this.videoWatcher?.close();

    this.videoWatcher = chokidar.watch(outputDir, {
      ignoreInitial: false,
      depth: 0,
      ignored: (watchPath) => shouldIgnorePath(watchPath),
    });

    this.videoWatcher.on('add', (filePath) => {
      const fileName = filePath.split(/[/\\]/).pop() ?? '';
      if (!VIDEO_FILE_PATTERN.test(fileName)) {
        return;
      }

      onVideo(filePath);
    });

    return new vscode.Disposable(() => {
      void this.videoWatcher?.close();
      this.videoWatcher = undefined;
    });
  }

  dispose(): void {
    for (const debouncer of this.debouncers) {
      debouncer.dispose();
    }
    this.debouncers = [];

    void this.workspaceWatcher?.close();
    void this.frameWatcher?.close();
    void this.videoWatcher?.close();

    this.workspaceWatcher = undefined;
    this.frameWatcher = undefined;
    this.videoWatcher = undefined;
  }
}
