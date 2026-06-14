# Changelog

All notable changes to Cursor Canvas are documented here.

## [1.0.0] — 2026-06-14

First public release.

### Features

- **Embedded Canvas panel** — Open from Command Palette (`Open Canvas Panel`) inside Cursor
- **Auto-detection** — Classifies workspace as App, Game, or Video track from project files
- **Manual override** — Lock track per workspace; persists across panel reopen
- **App preview** — Live localhost iframe with port detection, refresh, and open-in-browser
- **Device switcher** — Preview in desktop, iPhone, Android, iPad portrait, and iPad landscape frames
- **Game preview** — Unity WebGL, Godot Web, local game servers, and optional scene graph panel
- **Auto-open panel** — Canvas opens beside the editor when a workspace loads (disable in settings)
- **Video preview** — Single live full-panel preview while rendering, then HTML5 player when output video is detected
- **Settings panel** — Output folder, port override, scene graph path, frame count, polling interval
- **Dark theme** — Consistent panel styling with purple accent and per-mode error boundaries

### Supported

- **App:** Vite, Next.js, and any localhost dev server on common ports
- **Game:** Unity, Godot, web game libraries (Three.js, Phaser, etc.), and localhost game servers
- **Video:** PNG/JPG frame sequences and `.mp4` / `.webm` output in a watched folder

[1.0.0]: https://github.com/devQuan/cursor-canvas/releases/tag/v1.0.0
