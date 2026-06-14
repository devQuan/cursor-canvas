# 07 — QA & Test Plan

## Testing Stack
| Tool | Purpose |
|---|---|
| Vitest | Unit tests (services, utilities) |
| React Testing Library | Component tests (webview UI) |
| Playwright | E2E tests (full Cursor extension flow) |
| vscode-test | Extension host integration tests |

---

## Unit Tests — Services

### TrackResolver
- [ ] Returns `'app'` when `vite.config.ts` is present
- [ ] Returns `'app'` when `next.config.js` is present
- [ ] Returns `'game'` when `.unity` files are present
- [ ] Returns `'game'` when `three` is in `package.json` dependencies
- [ ] Returns `'video'` when output folder contains frame files
- [ ] Returns `'ambiguous'` when no recognizable files found
- [ ] Manual override in workspace state takes priority over file detection
- [ ] Debounce: rapid file changes only trigger one resolution

### PortDetector
- [ ] Reads port from `vite.config` `server.port`
- [ ] Reads port from `next.config` `server.port`
- [ ] Falls back to scanning when no config port found
- [ ] Returns `null` when no port responds
- [ ] Scans in correct priority order (3000, 3001, 5173, 4000, 8080, 8000)

### FileWatcher (frame detection)
- [ ] Detects new `frame_001.png` file
- [ ] Sorts frames by index correctly (frame_010 after frame_009)
- [ ] Detects `.mp4` file and fires `onVideo`
- [ ] Detects `.webm` file and fires `onVideo`
- [ ] Debounces rapid frame additions (batch within 300ms)
- [ ] Stops watching when disposed

### EngineDetector
- [ ] Detects `three` in dependencies → `'threejs'`
- [ ] Detects `.unity` files → `'unity-webgl'`
- [ ] Falls back to `'generic-iframe'` when nothing matches

---

## Component Tests — Webview UI

### ControlBar
- [ ] Renders three track buttons (App, Game, Video)
- [ ] Active track button shows correct active state
- [ ] Clicking override button sends `OVERRIDE_TRACK` message
- [ ] Badge shows "Auto: App" in auto mode
- [ ] Badge shows "Manual: Game" in manual mode
- [ ] Refresh button click fires `REQUEST_REFRESH`

### AppPreview
- [ ] Renders iframe when status is `'ready'`
- [ ] Shows spinner when status is `'starting'`
- [ ] Shows error state when status is `'unreachable'`
- [ ] Port displayed in port UI matches store value
- [ ] iframe src set to correct localhost URL

### FrameStrip
- [ ] Renders thumbnails for each frame in store
- [ ] Scrolls to latest frame when new frame added
- [ ] Shows timestamp under each thumbnail
- [ ] Empty state shown when frames array is empty

### VideoPlayer
- [ ] Renders `<video>` element when `videoUrl` is set
- [ ] Autoplays when video becomes available
- [ ] "Show Frames" toggle switches back to FrameStrip
- [ ] Empty state shown when `videoUrl` is null

### ScenePanel
- [ ] Renders list of scene objects
- [ ] Type badge correct for mesh / camera / light
- [ ] Hidden objects shown with reduced opacity
- [ ] Empty state shown when objects array is empty

### ErrorBoundary
- [ ] Catches render errors without crashing the whole panel
- [ ] Shows fallback UI with error message
- [ ] Does not affect sibling components

---

## Integration Tests

### Track Detection → UI Update
- [ ] Open workspace with `vite.config` → badge shows "Auto: App" within 1s
- [ ] Add `.unity` file to workspace → badge switches to "Auto: Game"
- [ ] Set manual override → badge shows "Manual: [track]"
- [ ] Close and reopen panel → manual override persists

### App Preview Flow
- [ ] Port detected → iframe src updated
- [ ] Server status `'ready'` → loading state removed, iframe visible
- [ ] Server stops → status switches to `'unreachable'` within 4s
- [ ] Server restarts → status switches back to `'ready'`

### Video Preview Flow
- [ ] Frame file lands in output folder → frame appears in strip within 1s
- [ ] 10 frames land in sequence → all 10 appear in correct order
- [ ] `.mp4` file detected → player replaces strip, video autoplays
- [ ] "Show Frames" clicked → strip returns

---

## E2E Tests (Playwright + vscode-test)

### Smoke Tests
- [ ] Extension activates without error in Cursor
- [ ] "Open Canvas Panel" command opens the panel
- [ ] Panel renders control bar and preview area
- [ ] No console errors on initial load

### Manual Test Matrix (cross-platform)
Run this before every release:

| Test | macOS | Windows | Linux |
|---|---|---|---|
| Panel opens | | | |
| App mode: iframe loads localhost | | | |
| App mode: hot reload works | | | |
| Game mode: canvas renders | | | |
| Game mode: scene panel populates | | | |
| Video mode: frames appear | | | |
| Video mode: player loads on .mp4 | | | |
| Override persists after restart | | | |
| Settings save and persist | | | |
| Dark theme: no white flashes | | | |

---

## Bug Triage Protocol
1. **Reproduce first** — a bug that can't be reproduced isn't fixed, it's guessed at
2. Open a `fix/[bug-name]` branch — never patch directly on `dev`
3. Write a failing test that catches the bug before fixing it
4. Fix passes the test
5. Merge to `dev`, verify in Cursor manually before closing

---

## QA Gates Per Phase
| Phase | Gate |
|---|---|
| Phase 1 (Shell) | Panel opens, renders, no errors |
| Phase 2 (Detection) | All unit tests pass for TrackResolver |
| Phase 3 (App) | App preview integration tests pass |
| Phase 4 (Game) | Game preview integration tests pass |
| Phase 5 (Video) | Video preview integration tests pass |
| Phase 6 (Polish) | Full manual test matrix complete on all platforms |
| Launch | All automated tests pass + manual matrix clean |
