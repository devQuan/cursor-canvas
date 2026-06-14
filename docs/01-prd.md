# 01 — Product Requirements Document (PRD)

## Product Name
Cursor Canvas

## One-Line Description
An embedded Cursor extension panel that renders a live preview of whatever you're building — apps, games, or videos — without leaving the editor.

## Problem
When building with AI in Cursor, the feedback loop is broken. You write a prompt, Cursor generates code, and you have to manually switch to a browser, game engine, or video tool to see if it worked. For video generation specifically, there's no way to watch frames land in real time without a separate tool open. The context switch kills flow and buries the joy of watching something get built.

## Solution
A persistent panel inside Cursor that auto-detects what you're working on and shows you the live output — a running web app, a game canvas with its scene graph, or a frame-by-frame video strip that transitions to a player when generation finishes.

---

## Target Users

**Primary:** Solo builders using Cursor + AI to build across multiple project types (apps, games, AI-generated video). They ship fast and want feedback without context switching.

**Secondary:** Small teams using Cursor where a shared preview panel reduces the need for constant "does it work?" communication.

---

## Core Features (MVP)

### 1. Three Preview Modes
| Mode | What it shows |
|---|---|
| App | Live localhost iframe of the running web app |
| Game | Canvas renderer (Three.js or engine iframe) + scene/asset panel |
| Video | Frame-by-frame strip during generation → finished player on completion |

### 2. Auto-Detection
Panel reads workspace files and classifies the active project as App, Game, or Video. Fires on workspace open and on file change. Result shows as a badge in the control bar.

### 3. Manual Override
Three buttons in the control bar let you lock the track regardless of auto-detection. Choice persists per workspace.

### 4. Control Bar
Persistent top bar with: track badge, override buttons, refresh, fullscreen toggle, settings icon.

### 5. Settings
- Video output folder path
- Estimated frame count (for progress bar)
- Dev server port override
- Frame polling interval

---

## Out of Scope (v1)

- Remote server previews (only localhost)
- Audio preview in video mode
- Multi-project tabs in the panel
- Mobile app device emulation (future)
- Collaborative / shared preview sessions (future)

---

## Success Metrics

| Metric | Target |
|---|---|
| Panel opens without error | 100% of the time |
| Auto-detection accuracy | Correct track ≥ 90% of time |
| App iframe hot-reload latency | < 500ms after file save |
| Frame strip update latency | < 1s after frame file lands on disk |
| Zero panel crashes during a 2hr build session | Pass |
| Marketplace install → working panel in < 2 minutes | Pass |

---

## MVP Scope

**In for v1.0:**
- Extension shell + webview panel
- Auto-detection (App / Game / Video)
- Manual override + persistence
- App preview (iframe + port detection)
- Game preview (Three.js canvas + scene panel + Unity WebGL iframe)
- Video preview (frame strip + progress + player)
- Dark theme
- Basic settings

**Deferred post-v1:**
- Audio waveform preview in video mode
- Mobile emulation frame in app mode
- Real-time scene graph editing from the panel
- Multi-root workspace support

---

## Constraints

- Must work inside Cursor (built on VS Code engine — standard VS Code Extension API applies)
- Webview CSP limits what can be loaded — localhost must be explicitly allowed
- Extension must not slow down Cursor's main thread — all file watching runs in the extension host process, not the webview
- Panel must survive Cursor window reloads without losing state
