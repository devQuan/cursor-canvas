# 05 — API & Event Documentation

## Overview
Cursor Canvas has no external API. The internal communication contract is between the **Extension Host** (Node.js) and the **Webview** (React) via VS Code's `postMessage` / `onDidReceiveMessage` bridge. This document defines every message type, its shape, direction, and when it fires.

---

## Message Direction

```
Extension Host  ──────►  Webview     (panel.webview.postMessage)
Webview         ──────►  Extension   (panel.webview.onDidReceiveMessage)
```

---

## Extension → Webview Messages

### `TRACK_CHANGED`
Fires when auto-detection resolves a new track or manual override is confirmed.
```typescript
{
  type: 'TRACK_CHANGED'
  track: 'app' | 'game' | 'video'
  mode: 'auto' | 'manual'
  confidence?: 'high' | 'low'   // low = prompt user to confirm
}
```

### `PORT_DETECTED`
Fires when the port detector finds an active dev server.
```typescript
{
  type: 'PORT_DETECTED'
  port: number
  source: 'config' | 'scan'   // where it was found
}
```

### `SERVER_STATUS`
Fires on health check results (every 2s while in App mode).
```typescript
{
  type: 'SERVER_STATUS'
  status: 'starting' | 'ready' | 'unreachable'
  port: number
}
```

### `FRAME_ADDED`
Fires each time a new frame file is detected in the video output folder.
```typescript
{
  type: 'FRAME_ADDED'
  frameIndex: number        // 0-based
  framePath: string         // vscode-resource: URI for the webview to load
  timestamp: number         // derived from frameIndex and estimated FPS
}
```

### `VIDEO_READY`
Fires when a final video file (.mp4 / .webm) is detected in the output folder.
```typescript
{
  type: 'VIDEO_READY'
  videoPath: string         // vscode-resource: URI
  frameCount: number        // total frames captured
}
```

### `SCENE_UPDATED`
Fires when the game scene graph JSON file changes (Game mode).
```typescript
{
  type: 'SCENE_UPDATED'
  objects: SceneObject[]
  engine: 'threejs' | 'unity-webgl' | 'generic-iframe'
}

interface SceneObject {
  id: string
  name: string
  type: 'mesh' | 'camera' | 'light' | 'group' | 'unknown'
  visible: boolean
  children?: string[]   // child object ids
}
```

### `ENGINE_DETECTED`
Fires when the engine detector classifies the game project.
```typescript
{
  type: 'ENGINE_DETECTED'
  engine: 'threejs' | 'unity-webgl' | 'generic-iframe'
  port?: number   // for generic-iframe mode
}
```

### `SETTINGS_UPDATED`
Fires when the user saves settings (propagates from extension host to webview).
```typescript
{
  type: 'SETTINGS_UPDATED'
  settings: CanvasSettings
}

interface CanvasSettings {
  outputFolder: string | null
  estimatedFrameCount: number
  portOverride: number | null
  framePollingIntervalMs: number
}
```

### `ERROR`
Fires when a background service encounters an error.
```typescript
{
  type: 'ERROR'
  service: 'trackResolver' | 'portDetector' | 'fileWatcher' | 'engineDetector'
  message: string
  recoverable: boolean
}
```

---

## Webview → Extension Messages

### `OVERRIDE_TRACK`
User clicks a manual track button in the control bar.
```typescript
{
  type: 'OVERRIDE_TRACK'
  track: 'app' | 'game' | 'video'
}
```

### `RESET_TO_AUTO`
User clears the manual override (returns to auto-detection).
```typescript
{
  type: 'RESET_TO_AUTO'
}
```

### `REQUEST_REFRESH`
User clicks the refresh button. Extension re-runs detection and re-pings the server.
```typescript
{
  type: 'REQUEST_REFRESH'
}
```

### `SAVE_SETTINGS`
User saves settings from the settings panel.
```typescript
{
  type: 'SAVE_SETTINGS'
  settings: CanvasSettings
}
```

### `PANEL_READY`
Webview fires this once React has mounted. Extension begins sending state.
```typescript
{
  type: 'PANEL_READY'
}
```

---

## Resource URI Convention
File paths sent from the extension host to the webview must be converted to `vscode-resource:` URIs so the webview CSP allows loading them:

```typescript
// Extension host side
const frameUri = panel.webview.asWebviewUri(
  vscode.Uri.file(framePath)
)
// Send frameUri.toString() in the message — the webview uses it directly in <img src>
```

---

## Event Timing

| Event | Trigger | Frequency |
|---|---|---|
| `TRACK_CHANGED` | Workspace open, file added/removed | On change (debounced 300ms) |
| `PORT_DETECTED` | App mode activated, refresh requested | Once per activation |
| `SERVER_STATUS` | App mode active | Every 2000ms |
| `FRAME_ADDED` | New frame file in output folder | Per frame (debounced 300ms) |
| `VIDEO_READY` | .mp4/.webm file detected | Once per generation |
| `SCENE_UPDATED` | scene graph JSON file changes | On change (debounced 300ms) |
| `ENGINE_DETECTED` | Game mode activated | Once per activation |
| `ERROR` | Any service failure | On failure |
