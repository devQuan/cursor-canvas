# 03 — UX/UI Design Plan

## Design Philosophy
The panel should feel like a native Cursor surface — dark, minimal, zero friction. No splash screens, no onboarding modals. Open it and it works. The preview content is always the hero; chrome is secondary.

---

## Panel Layout

```
┌─────────────────────────────────────┐
│  CONTROL BAR                        │
│  [APP] [GAME] [VIDEO]  ◉ Auto: App  │
│  [↺ Refresh] [⛶ Fullscreen] [⚙]   │
├─────────────────────────────────────┤
│                                     │
│         PREVIEW AREA                │
│    (changes per active track)       │
│                                     │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

---

## Control Bar
- Always visible at the top
- Height: 40px
- Three track buttons (App / Game / Video) — segmented control style
- Active track badge: "◉ Auto: App" or "◉ Manual: Game" — indicates detection mode
- Right side: Refresh, Fullscreen, Settings icons
- Font: system UI monospace for badge, sans-serif for buttons

---

## App Mode Layout

```
┌─────────────────────────────────────┐
│  CONTROL BAR                        │
├─────────────────────────────────────┤
│  Port: 3000 ▼    [Open in Browser]  │
├─────────────────────────────────────┤
│                                     │
│         iframe                      │
│      (live localhost)               │
│                                     │
└─────────────────────────────────────┘
```

States:
- **Loading:** Spinner + "Starting dev server…"
- **Ready:** iframe fills preview area
- **Error:** "No server found on port 3000. Is your dev server running?" + retry button
- **Empty:** "Open a web project and start your dev server"

---

## Game Mode Layout (Split — default)

```
┌─────────────────────────────────────┐
│  CONTROL BAR                        │
├──────────────────────┬──────────────┤
│                      │  SCENE PANEL │
│   CANVAS AREA        │  ──────────  │
│   (Three.js or       │  ◆ Camera    │
│    engine iframe)    │  ◆ Mesh_001  │
│                      │  ◆ Light_01  │
│                      │  ◆ Player    │
├──────────────────────┴──────────────┤
│  [Canvas Only] [Split] [Scene Only] │
└─────────────────────────────────────┘
```

States:
- **Canvas loading:** "Waiting for game output…" with pulsing border
- **Scene empty:** "No scene objects detected yet"
- **Error:** "Engine not detected. Check your workspace."

---

## Video Mode Layout

**Stage 1 — Generating (frame strip)**

```
┌─────────────────────────────────────┐
│  CONTROL BAR                        │
├─────────────────────────────────────┤
│  Generating… ████████░░░░ 24/60 fr  │
├─────────────────────────────────────┤
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐   │
│  │f1│ │f2│ │f3│ │f4│ │f5│ │f6│ …  │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘   │
│   0s  0.4s  0.8s  1.2s  1.6s  2s  │
└─────────────────────────────────────┘
```

**Stage 2 — Complete (video player)**

```
┌─────────────────────────────────────┐
│  CONTROL BAR                        │
├─────────────────────────────────────┤
│                                     │
│      ┌─────────────────────┐        │
│      │                     │        │
│      │   <video> player    │        │
│      │                     │        │
│      │  ▶ ──────── 0:24   │        │
│      └─────────────────────┘        │
│                                     │
│  [Show Frames] [Open File]          │
└─────────────────────────────────────┘
```

States:
- **Empty:** "Configure your video output folder in settings, then start generating."
- **Generating:** Frame strip, progress bar
- **Complete:** Player with controls, "Show Frames" toggle to go back to strip
- **Error:** "Output folder not found or no frames detected."

---

## Design System

### Colors (CSS variables, dark theme)
```css
--canvas-bg: #1a1a1a;
--panel-bg: #111111;
--control-bar-bg: #1e1e1e;
--border: #2a2a2a;
--text-primary: #e8e8e8;
--text-secondary: #888888;
--accent: #7c6af7;          /* track buttons active state */
--accent-soft: #2d2952;     /* active button bg */
--success: #3ecf6e;
--error: #f87171;
--badge-auto: #3ecf6e;
--badge-manual: #f59e0b;
```

### Typography
```css
--font-ui: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "Fira Code", "JetBrains Mono", monospace;
--text-sm: 12px;
--text-base: 13px;
--text-lg: 14px;
```

### Spacing
- Control bar padding: 8px 12px
- Panel internal padding: 0 (preview fills edge to edge)
- Scene list item height: 28px
- Frame thumbnail: 72px × 48px

---

## Component List

| Component | Description |
|---|---|
| `ControlBar` | Top bar with track switcher, badge, action buttons |
| `TrackBadge` | Shows current track and detection mode |
| `AppPreview` | iframe wrapper with port UI and states |
| `GameCanvas` | Canvas area: Three.js embed or engine iframe |
| `ScenePanel` | List of active scene objects with type badges |
| `FrameStrip` | Horizontal scrollable thumbnail row |
| `ProgressBar` | Frame count / estimated total |
| `VideoPlayer` | HTML5 video with controls |
| `EmptyState` | Shared empty state component, takes message prop |
| `ErrorBoundary` | Wraps each preview mode, catches render errors |
| `SettingsPanel` | Slide-in panel for configuration |
