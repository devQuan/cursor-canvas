# 00 — Lifecycle Roadmap

## Product
Cursor Canvas — Embedded Cursor extension panel with live build preview across three tracks: App, Game, Video.

---

## 8-Phase Build Plan

### Phase 1 — Foundation & Extension Shell
**Goal:** Get a working Cursor panel that opens, renders React, and stays stable.

- Scaffold the VS Code extension with `yo code` (TypeScript template)
- Configure `esbuild` as the bundler for the webview React app
- Create the Webview Panel with `vscode.window.createWebviewPanel`
- Establish message passing bridge (`postMessage` / `onDidReceiveMessage`)
- Render a static React shell inside the panel (blank canvas, control bar)
- Wire up basic Tailwind CSS dark theme
- Set up ESLint + Prettier + TypeScript strict mode
- Git init, branch strategy established

**Deliverable:** Panel opens in Cursor. React renders. Message bridge works.

**QA gate:** Panel survives Cursor restart, renders without console errors.

---

### Phase 2 — Auto-Detection Engine
**Goal:** The panel knows what track you're in without you telling it.

**[FRONTEND]**
- Build the track badge UI component (App / Game / Video indicator)
- Build the manual override buttons (three track buttons, active state)
- Mock all three track states with hardcoded data

**[BACKEND]**
- Implement `chokidar` file watcher on the active workspace root
- Write track resolver: reads file signatures and workspace config to classify
- Emit `trackChanged` events to the webview via message bridge
- Handle ambiguous state: prompt user, persist choice per workspace via `vscode.workspace.state`

**[CONNECT]**
- Wire resolver events → React state (Zustand store)
- Track badge updates live as resolver fires
- Manual override writes to workspace state, suppresses auto-detect

**Deliverable:** Open an app project → badge shows App. Open a game folder → badge shows Game. Override button locks the track.

**QA gate:** Switch between 3 project types, badge always correct. Override persists across panel close/reopen.

---

### Phase 3 — App Preview Mode
**Goal:** Live localhost iframe that hot-reloads with the running app.

**[FRONTEND]**
- Build the App preview panel: iframe component with loading state, error state, and empty state
- Port input UI (auto-detected port shown, editable)
- Refresh button, open-in-browser button

**[BACKEND]**
- Port detector: scans `vite.config`, `next.config`, `package.json` scripts for dev server port
- Fallback: scan common ports (3000, 3001, 5173, 8080) for a responding HTTP server
- Health check loop: ping localhost every 2s, show "server starting…" until alive

**[CONNECT]**
- Detected port → iframe `src` attribute
- Health check state → loading/ready/error UI
- Cursor webview CSP must allow `localhost` — configure `localResourceRoots` and CSP header correctly

**Deliverable:** Run `npm run dev`, panel iframe shows the live app. Edit a component, iframe hot-reloads.

**QA gate:** Works with Vite, Next.js, and a plain Express server. Error state shows when port unreachable.

---

### Phase 4 — Game Preview Mode
**Goal:** Dual view — running canvas + scene/asset panel.

**[FRONTEND]**
- Split layout: canvas area (left/top) + scene panel (right/bottom), resizable
- Scene panel: list of active objects, fragments, or nodes with type badges
- Canvas placeholder with engine type badge (Three.js / Unity / Other)
- Toggle button: Canvas only / Scene only / Split

**[BACKEND]**
- Three.js mode: inject a small WebGL canvas renderer inside the webview that reads from a shared state file the game writes to (JSON dump of scene graph at a configurable interval)
- Unity WebGL mode: iframe pointed at the local Unity WebGL build output folder
- Generic iframe fallback: any local game server on a detected port
- Engine detector: reads workspace for `three`, `unity`, `.unity`, engine config files

**[CONNECT]**
- Engine type → renderer selection
- Scene graph JSON → scene panel list (file watcher on the output JSON)
- Canvas + scene panel update on file change

**Deliverable:** Three.js project open → canvas renders the game scene, scene panel shows active objects. Unity WebGL build → iframe loads the game.

**QA gate:** Scene panel updates when a new object is added to the scene graph dump. Canvas survives hot reload.

---

### Phase 5 — Video Preview Mode
**Goal:** Frame-by-frame strip as video generates, then a finished player.

**[FRONTEND]**
- Frame strip component: horizontal scrollable row of thumbnails, timestamp labels, current frame highlighted
- Generation progress bar: shows frames rendered / total estimated
- Finished player: HTML5 `<video>` with controls, auto-plays when generation completes
- Empty state: "Start generating a video to see frames here"
- Two-stage transition: strip → player when final output file detected

**[BACKEND]**
- Output folder watcher: `chokidar` watching the configured video output directory
- Frame detector: picks up `frame_*.png` / `frame_*.jpg` files as they land, sorts by number
- Finished video detector: watches for `.mp4` / `.webm` file in the output dir
- Config: user sets output folder path in extension settings (`vscode.workspace.getConfiguration`)

**[CONNECT]**
- New frame file → append thumbnail to strip, scroll to latest
- Final video file → switch UI from strip to player, autoplay
- Progress bar derives from frame count vs. estimated total (configurable)

**Deliverable:** Start a video generation job. Frames appear in the strip as they land on disk. When `.mp4` appears, player takes over.

**QA gate:** Strip scrolls correctly at 100+ frames. Player autoplay works. Empty state shows before first frame.

---

### Phase 6 — Polish, Edge Cases & Dark Theme
**Goal:** Everything feels tight, looks intentional, handles failure gracefully.

- Consistent dark theme across all three modes (CSS variables, Tailwind dark config)
- Smooth mode transitions (fade/slide between track views)
- Error boundaries on every preview component — panel never fully crashes
- Keyboard shortcuts: `Cmd+Shift+P` → "Open Canvas Panel"
- Settings UI: output folder path, frame estimation count, port override
- Empty states for every mode that haven't loaded yet
- Resize handling: panel responds to Cursor sidebar width changes
- Accessibility: focus management, keyboard navigation in control bar

**Deliverable:** Panel is shippable quality. No white flashes, no uncaught errors, no broken layouts.

---

### Phase 7 — QA & Testing
See [07-qa-test-plan.md](./07-qa-test-plan.md) for full test case list.

- Unit tests: track resolver, port detector, frame sorter, engine detector
- Component tests: each preview mode rendered with mock data
- Integration tests: file watcher → event → UI update end-to-end
- Playwright: open Cursor, trigger panel, verify each mode renders
- Manual: test on macOS, Windows, Linux inside actual Cursor

**QA gate:** All automated tests pass. Manual test matrix complete.

---

### Phase 8 — Launch & Distribution
See [09-launch-and-distribution.md](./09-launch-and-distribution.md).

- Package with `vsce package`
- Publish to VS Code Marketplace (works in Cursor via compatibility)
- Write CHANGELOG.md for v1.0.0
- README with install, usage GIF, configuration docs
- Tag `v1.0.0` in git

---

## Build Layer Order (Engineering Phases)

```
Sprint 1–2   [FOUNDATION]  Extension shell, webview, message bridge, tooling
Sprint 3–4   [FRONTEND]    All UI components, mock data, all three preview modes as static shells
Sprint 5–6   [BACKEND]     File watcher, track resolver, port detector, frame detector, engine detector
Sprint 7–8   [CONNECT]     Wire all backends to UI, integration testing, error handling
Sprint 9     [POLISH]      Dark theme, transitions, edge cases, settings
Sprint 10    [QA + LAUNCH] Full test pass, package, publish
```

---

## Debugging Thread (runs every sprint)

- Every sprint includes a `fix/` branch discipline — bugs get their own branch, not patched inline
- The message bridge (`postMessage`) is the most failure-prone layer — log every message in dev mode
- CSP violations in the webview are silent by default — enable `webview.options.enableScripts` and check DevTools
- File watcher events can fire multiple times for one save — debounce all watcher callbacks (300ms)
- Localhost iframe in a webview requires explicit CSP allowance — test this in Phase 3, not Phase 6
