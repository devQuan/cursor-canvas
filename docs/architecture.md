# Architecture

Cursor Canvas is a VS Code–compatible extension. Cursor loads it like any other extension.

## Stack

| Layer | Technology |
|-------|------------|
| Extension host | VS Code Extension API (Node.js) |
| Webview UI | React 18, TypeScript, Tailwind CSS, Zustand |
| Build | esbuild (two bundles: `dist/extension.js`, `dist/webview.js`) |
| Tests | Vitest, React Testing Library |

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Cursor / VS Code                      │
│  ┌──────────────────────┐   ┌──────────────────────┐   │
│  │   Extension Host     │   │     Webview Panel     │   │
│  │   src/extension.ts   │◄─►│   React + Zustand     │   │
│  │   src/services/*     │   │   src/webview/*       │   │
│  └──────────────────────┘   └──────────────────────┘   │
│         postMessage / onDidReceiveMessage                │
└─────────────────────────────────────────────────────────┘
```

## Extension host services

| Service | Role |
|---------|------|
| `trackResolver` / `trackDetectionService` | Classify workspace as app, game, or video |
| `portDetector` | Find localhost dev server port |
| `outputDirResolver` / `frameDetector` | Locate and parse video output frames |
| `engineDetector` / `gamePreviewService` | Unity, Godot, Three.js, generic iframe |
| `sceneGraphResolver` | Resolve nested `.cursor-canvas/scene-graph.json` |
| `videoPreviewService` | Watch output folder, emit frames and video events |
| `panelAutoOpen` | Open panel on workspace load (respects user close) |
| `messageBridge` | Typed messages between host and webview |

## Webview structure

```
App.tsx
├── ControlBar          — track tabs, refresh, settings
├── TrackView           — routes to active preview
│   ├── AppPreview      — iframe + DeviceSwitcher
│   ├── GameCanvas      — iframe / Three.js + ScenePanel
│   └── VideoPreview    — VideoStage (live) + VideoPlayer
├── SettingsPanel
└── ErrorBoundary (per mode)
```

## Message bridge

Extension → webview examples: `TRACK_CHANGED`, `PORT_DETECTED`, `SERVER_STATUS`, `FRAME_ADDED`, `VIDEO_READY`, `SCENE_UPDATED`, `SETTINGS_UPDATED`, `ERROR`.

Webview → extension examples: `PANEL_READY`, `OVERRIDE_TRACK`, `REQUEST_REFRESH`, `UPDATE_SETTINGS`, `OPEN_EXTERNAL`.

Message types live in `src/types/messages.ts`. Webview handling is in `src/webview/lib/extensionMessageHandler.ts`.

## Defaults (runtime, not in repo)

Users create these locally as needed:

- `.cursor-canvas/video-output/` — watched for PNG/JPG frames or `.mp4` / `.webm`
- `.cursor-canvas/scene-graph.json` — optional game scene dump

These paths are **not** committed to the repository.

## CSP

The webview CSP allows `localhost` / `127.0.0.1` for app iframes and game WebGL builds. CSP violations usually show in **Help → Toggle Developer Tools**.
