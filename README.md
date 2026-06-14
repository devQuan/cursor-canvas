# Cursor Canvas

Live preview panel for Cursor — see your app, game, or video build in real time inside the editor.

**GitHub:** https://github.com/devQuan/cursor-canvas  
**Publisher:** devQuan

---

## Features

| Mode | What you get |
|------|----------------|
| **App** | Live localhost iframe, port auto-detection, device frames (Web / iPhone / Android / iPad) |
| **Game** | Three.js canvas + scene graph panel; Unity WebGL and generic iframe support |
| **Video** | One large live preview while rendering → full video player when output lands |

Auto-detection picks the track from your workspace. Override manually when needed.

---

## Install

### From VSIX (local)

```bash
git clone https://github.com/devQuan/cursor-canvas.git
cd cursor-canvas
npm install
npm run reinstall
```

Then **Developer: Reload Window** in Cursor.

### From Marketplace

Search **Cursor Canvas** in the Extensions panel (coming soon).

---

## Usage

1. Open a project in Cursor
2. `Cmd+Shift+P` → **Open Canvas Panel**
3. Use **app** / **game** / **video** tabs
4. On **App**, try the device switcher to check responsive layouts

---

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `cursorCanvas.outputFolder` | `null` | Video output folder to watch for frames |
| `cursorCanvas.estimatedFrameCount` | `60` | Progress bar total frame estimate |
| `cursorCanvas.portOverride` | `null` | Force a specific dev server port |
| `cursorCanvas.framePollingIntervalMs` | `1000` | Video output polling interval |
| `cursorCanvas.sceneGraphPath` | `.cursor-canvas/scene-graph.json` | Game scene graph JSON path |
| `cursorCanvas.unityWebGlPath` | `null` | Unity WebGL build output folder |
| `cursorCanvas.autoOpenPanel` | `true` | Open Canvas when a workspace loads |

---

## Development

```bash
npm run build        # compile extension + webview
npm test             # Vitest unit, component, integration tests
npm run lint         # ESLint
npm run typecheck    # TypeScript
```

---

## Project docs

Full lifecycle, architecture, and QA docs live in [`docs/`](./docs/):

- [Lifecycle roadmap](./docs/00-lifecycle-roadmap.md)
- [QA test plan](./docs/07-qa-test-plan.md)
- [Launch checklist](./docs/09-launch-and-distribution.md)

---

## License

MIT — see [LICENSE](./LICENSE).
