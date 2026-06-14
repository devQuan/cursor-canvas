# Cursor Canvas

Live preview panel for Cursor — app, game, and video builds inside the editor.

[![Release](https://img.shields.io/github/v/release/devQuan/cursor-canvas)](https://github.com/devQuan/cursor-canvas/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

| Mode | Preview |
|------|---------|
| **App** | Localhost iframe, port detection, device frames (desktop / phone / tablet) |
| **Game** | Unity WebGL, Godot, Three.js, or generic iframe + optional scene graph |
| **Video** | Full-panel live frame preview while rendering → video player when output lands |

The panel auto-detects your project type. Override manually when needed. Canvas can auto-open when a workspace loads (`cursorCanvas.autoOpenPanel`).

## Install

**Marketplace** — search **Cursor Canvas** in Extensions (when published).

**Local VSIX:**

```bash
git clone https://github.com/devQuan/cursor-canvas.git
cd cursor-canvas
npm install
npm run reinstall
```

Then run **Developer: Reload Window** in Cursor.

## Usage

1. Open a project in Cursor
2. `Cmd+Shift+P` → **Open Canvas Panel**
3. Switch **app** / **game** / **video** tabs as needed

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `cursorCanvas.autoOpenPanel` | `true` | Open panel when workspace loads |
| `cursorCanvas.outputFolder` | `null` | Video output folder to watch |
| `cursorCanvas.portOverride` | `null` | Force dev server port |
| `cursorCanvas.framePollingIntervalMs` | `1000` | Video folder poll interval |
| `cursorCanvas.sceneGraphPath` | `.cursor-canvas/scene-graph.json` | Game scene graph path |
| `cursorCanvas.unityWebGlPath` | `null` | Unity WebGL build folder |
| `cursorCanvas.estimatedFrameCount` | `60` | Frame count hint for video mode |

## Development

```bash
npm run build      # compile
npm test           # Vitest
npm run typecheck
npm run lint
```

Contributor docs: [`docs/`](./docs/) — [development](./docs/development.md), [architecture](./docs/architecture.md), [release](./docs/release.md).

## License

MIT — see [LICENSE](./LICENSE).
