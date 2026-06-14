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
  private disposables: vscode.Disposable[] = [];

  watchWorkspace(
    root: string,
    onChange: () => void,
  ): vscode.Disposable {
    const debounced = createDebouncedCallback(onChange, DEBOUNCE_MS);
    const pattern = new vscode.RelativePattern(root, '**/*');
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);

    const trigger = (uri: vscode.Uri): void => {
      if (shouldIgnorePath(uri.fsPath)) {
        return;
      }
      debounced.trigger();
    };

    watcher.onDidCreate(trigger);
    watcher.onDidChange(trigger);
    watcher.onDidDelete(trigger);

    const disposable = new vscode.Disposable(() => {
      debounced.dispose();
      watcher.dispose();
    });

    this.disposables.push(disposable);
    return disposable;
  }

  watchFrames(
    outputDir: string,
    onFrame: (framePath: string) => void,
  ): vscode.Disposable {
    const pattern = new vscode.RelativePattern(outputDir, 'frame_*.*');
    let pendingPath: string | undefined;

    const debounced = createDebouncedCallback(() => {
      if (pendingPath) {
        onFrame(pendingPath);
        pendingPath = undefined;
      }
    }, DEBOUNCE_MS);

    const watcher = vscode.workspace.createFileSystemWatcher(pattern);

    watcher.onDidCreate((uri) => {
      const fileName = uri.fsPath.split(/[/\\]/).pop() ?? '';
      if (!FRAME_FILE_PATTERN.test(fileName)) {
        return;
      }

      pendingPath = uri.fsPath;
      debounced.trigger();
    });

    const disposable = new vscode.Disposable(() => {
      debounced.dispose();
      watcher.dispose();
    });

    this.disposables.push(disposable);
    return disposable;
  }

  watchVideo(
    outputDir: string,
    onVideo: (videoPath: string) => void,
  ): vscode.Disposable {
    const pattern = new vscode.RelativePattern(outputDir, '*.{mp4,webm}');
    const watcher = vscode.workspace.createFileSystemWatcher(pattern);

    watcher.onDidCreate((uri) => {
      const fileName = uri.fsPath.split(/[/\\]/).pop() ?? '';
      if (!VIDEO_FILE_PATTERN.test(fileName)) {
        return;
      }

      onVideo(uri.fsPath);
    });

    const disposable = new vscode.Disposable(() => {
      watcher.dispose();
    });

    this.disposables.push(disposable);
    return disposable;
  }

  watchSceneGraph(
    sceneGraphPath: string,
    onChange: () => void,
  ): vscode.Disposable {
    const debounced = createDebouncedCallback(onChange, DEBOUNCE_MS);
    const watcher = vscode.workspace.createFileSystemWatcher(sceneGraphPath);

    const trigger = (): void => {
      debounced.trigger();
    };

    watcher.onDidCreate(trigger);
    watcher.onDidChange(trigger);
    watcher.onDidDelete(trigger);

    const disposable = new vscode.Disposable(() => {
      debounced.dispose();
      watcher.dispose();
    });

    this.disposables.push(disposable);
    return disposable;
  }

  dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    this.disposables = [];
  }
}
