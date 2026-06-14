# 04 — Software Architecture (SAD)

## Stack

| Layer | Technology | Why |
|---|---|---|
| Extension runtime | VS Code Extension API | Cursor is built on VS Code — full compatibility |
| Webview UI framework | React 18 + TypeScript | Component model, hooks, ecosystem |
| Styling | Tailwind CSS v3 | Utility-first, no runtime CSS overhead |
| State management | Zustand | Lightweight, no boilerplate, works perfectly in webviews |
| Build tool | esbuild | Fast, extension-friendly, handles both extension host + webview bundles |
| File watching | chokidar v3 | Cross-platform, reliable, debounce built in |
| Testing | Vitest + React Testing Library + Playwright | Unit, component, and E2E coverage |
| Linting | ESLint + Prettier | Enforced via pre-commit hooks (lint-staged + husky) |
| Package manager | pnpm | Fast, disk-efficient |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CURSOR (VS Code Engine)               │
│                                                         │
│  ┌──────────────────────┐   ┌──────────────────────┐   │
│  │   Extension Host     │   │     Webview Panel     │   │
│  │   (Node.js process)  │   │   (isolated iframe)   │   │
│  │                      │   │                       │   │
│  │  • chokidar watcher  │◄──┤  • React 18           │   │
│  │  • track resolver    │   │  • Zustand store      │   │
│  │  • port detector     │   │  • Tailwind CSS       │   │
│  │  • frame detector    │──►│  • Preview components │   │
│  │  • engine detector   │   │                       │   │
│  │  • workspace state   │   │  ┌─────────────────┐  │   │
│  │                      │   │  │  App: iframe     │  │   │
│  └──────────────────────┘   │  │  Game: canvas    │  │   │
│                              │  │  Video: strip+   │  │   │
│  Message Bridge              │  │         player   │  │   │
│  (postMessage / onDid        │  └─────────────────┘  │   │
│   ReceiveMessage)            │                       │   │
│                              └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Extension Host (Node.js)

### Entry Point
`src/extension.ts` — activates on `onStartupFinished`, registers the panel command, initializes all background services.

### Services

#### TrackResolver
```typescript
class TrackResolver {
  resolve(workspacePath: string): Track | 'ambiguous'
  watch(workspacePath: string, onChange: (track: Track) => void): Disposable
}
type Track = 'app' | 'game' | 'video'
```
Reads file signatures in priority order:
1. Workspace settings (`cursor-canvas.track` key) → manual override wins
2. Config files: `vite.config`, `next.config`, `nuxt.config`, `remix.config` → App
3. Game markers: `.unity`, `*.rbxl`, `three` in `package.json`, `babylon`, `phaser` → Game
4. Video markers: output folder exists with frame files, `higgsfield.config`, `seedance.config` → Video
5. None of the above → `'ambiguous'` → prompt user

#### PortDetector
```typescript
class PortDetector {
  detect(workspacePath: string): Promise<number | null>
  scan(ports: number[]): Promise<number | null>
}
```
1. Reads `vite.config` / `next.config` for `server.port` or `port`
2. Reads `package.json` `scripts.dev` for port flags
3. Falls back to scanning: 3000, 3001, 5173, 4000, 8080, 8000

#### FileWatcher
```typescript
class FileWatcher {
  watchFrames(outputDir: string, onFrame: (framePath: string) => void): Disposable
  watchVideo(outputDir: string, onVideo: (videoPath: string) => void): Disposable
  watchWorkspace(root: string, onChange: () => void): Disposable
}
```
All callbacks debounced 300ms to prevent double-fire on rapid saves.

#### EngineDetector
```typescript
class EngineDetector {
  detect(workspacePath: string): GameEngine
}
type GameEngine = 'threejs' | 'unity-webgl' | 'generic-iframe'
```

#### MessageBridge
```typescript
class MessageBridge {
  send(panel: WebviewPanel, message: PanelMessage): void
  receive(panel: WebviewPanel, handler: (msg: PanelMessage) => void): Disposable
}
```

### Message Types
```typescript
type PanelMessage =
  | { type: 'TRACK_CHANGED'; track: Track; mode: 'auto' | 'manual' }
  | { type: 'PORT_DETECTED'; port: number }
  | { type: 'FRAME_ADDED'; framePath: string; frameIndex: number }
  | { type: 'VIDEO_READY'; videoPath: string }
  | { type: 'SCENE_UPDATED'; objects: SceneObject[] }
  | { type: 'OVERRIDE_TRACK'; track: Track }
  | { type: 'SETTINGS_UPDATED'; settings: CanvasSettings }
  | { type: 'ERROR'; service: string; message: string }
```

---

## Webview (React)

### Store (Zustand)
```typescript
interface CanvasStore {
  // Track
  activeTrack: Track
  trackMode: 'auto' | 'manual'
  setTrack: (track: Track, mode: 'auto' | 'manual') => void

  // App
  port: number | null
  serverStatus: 'starting' | 'ready' | 'error'

  // Game
  engine: GameEngine
  sceneObjects: SceneObject[]

  // Video
  frames: Frame[]
  videoUrl: string | null
  generationProgress: { current: number; total: number }

  // UI
  gameViewMode: 'canvas' | 'split' | 'scene'
  settingsOpen: boolean
}
```

### Component Tree
```
<App>
  <ErrorBoundary>
    <ControlBar />
    <PreviewArea>
      {track === 'app'   && <AppPreview />}
      {track === 'game'  && <GamePreview />}
      {track === 'video' && <VideoPreview />}
    </PreviewArea>
    <SettingsPanel />
  </ErrorBoundary>
</App>
```

### Message Listener (webview side)
```typescript
window.addEventListener('message', (event) => {
  const msg: PanelMessage = event.data
  switch (msg.type) {
    case 'TRACK_CHANGED': store.setTrack(msg.track, msg.mode); break
    case 'PORT_DETECTED': store.setPort(msg.port); break
    // ... etc
  }
})
```

---

## Build Configuration

### Directory Structure
```
cursor-canvas/
├── src/
│   ├── extension.ts          # Extension host entry
│   ├── services/
│   │   ├── trackResolver.ts
│   │   ├── portDetector.ts
│   │   ├── fileWatcher.ts
│   │   ├── engineDetector.ts
│   │   └── messageBridge.ts
│   └── webview/
│       ├── index.tsx          # Webview React entry
│       ├── store/
│       │   └── canvasStore.ts
│       ├── components/
│       │   ├── ControlBar.tsx
│       │   ├── AppPreview.tsx
│       │   ├── GamePreview/
│       │   │   ├── GameCanvas.tsx
│       │   │   └── ScenePanel.tsx
│       │   ├── VideoPreview/
│       │   │   ├── FrameStrip.tsx
│       │   │   ├── ProgressBar.tsx
│       │   │   └── VideoPlayer.tsx
│       │   ├── EmptyState.tsx
│       │   ├── ErrorBoundary.tsx
│       │   └── SettingsPanel.tsx
│       └── styles/
│           └── globals.css
├── docs/
├── tests/
│   ├── unit/
│   ├── components/
│   └── e2e/
├── package.json
├── tsconfig.json
├── esbuild.config.mjs
└── .eslintrc.json
```

### esbuild — Two Bundles
```javascript
// esbuild.config.mjs
// Bundle 1: Extension host (Node.js target)
esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  external: ['vscode'],
  outfile: 'dist/extension.js',
})

// Bundle 2: Webview (browser target)
esbuild.build({
  entryPoints: ['src/webview/index.tsx'],
  bundle: true,
  platform: 'browser',
  outfile: 'dist/webview.js',
})
```

---

## CSP Configuration
The webview Content Security Policy must explicitly allow localhost for the App preview iframe:

```typescript
const csp = [
  `default-src 'none'`,
  `script-src 'nonce-${nonce}' 'unsafe-eval'`,   // unsafe-eval needed for React DevTools in dev
  `style-src 'nonce-${nonce}' 'unsafe-inline'`,
  `img-src ${webview.cspSource} http://localhost:* data: blob:`,
  `frame-src http://localhost:* http://127.0.0.1:*`,
  `connect-src http://localhost:* ws://localhost:*`,
].join('; ')
```

---

## State Persistence
- Active track override → `vscode.workspace.state.update('cursorCanvas.track', track)`
- Output folder path → `vscode.workspace.getConfiguration('cursorCanvas').get('outputFolder')`
- Panel position → managed by VS Code automatically
