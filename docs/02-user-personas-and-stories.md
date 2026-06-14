# 02 — User Personas & Stories

## Persona 1 — The Solo Builder
**Who:** A founder or indie creator building across app, game, and video tracks simultaneously. Uses Cursor + AI heavily. Switches between project types throughout the week.

**Pain:** Has to alt-tab constantly to see if what Cursor just built is actually working. Loses the "flow" of building when the feedback loop is slow.

**Needs:** A single panel that tells them "yes, it's working" without leaving the editor.

---

## Persona 2 — The Game Dev
**Who:** An indie game developer building a browser-based or desktop game in Three.js, Unity, or a similar engine. Iterates fast on mechanics and scene layout.

**Pain:** Has to switch to a browser tab or game engine window to see scene changes. Scene graph is invisible from inside the editor.

**Needs:** A live canvas showing the game running, plus a scene list showing what objects are active — all without leaving Cursor.

---

## Persona 3 — The AI Video Creator
**Who:** A creator using AI video generation tools (Higgsfield, Seedance, etc.) and building the pipeline code inside Cursor. Triggers generation jobs from the terminal or a script.

**Pain:** Has to watch a separate folder or tool to see if frames are landing. Doesn't know if the generation is working until it's done.

**Needs:** A frame strip that updates as each frame hits the output folder, transitioning to a video player the moment the full file is ready.

---

## User Stories

### Track Detection
- As a builder, I want the panel to automatically know I'm working on a web app so I don't have to configure anything.
- As a builder, I want to override the auto-detected track so I can force Game mode even in an ambiguous project.
- As a builder, I want my manual override to persist so I don't have to re-select my track every time I reopen the panel.

### App Preview
- As a web developer, I want to see my running app inside the Cursor panel so I don't have to switch to a browser tab.
- As a web developer, I want the iframe to hot-reload automatically when I save a file so I can see changes immediately.
- As a web developer, I want the panel to show a loading state while the dev server is starting so I know it's working.
- As a web developer, I want to open the preview in a full browser tab when I need more space.

### Game Preview
- As a game developer, I want to see my Three.js game canvas running inside the panel so I can watch mechanics play out while I edit code.
- As a game developer, I want to see a list of active scene objects in a side panel so I can verify the scene graph is correct.
- As a Unity developer, I want to see my Unity WebGL build running in the panel so I can preview builds without leaving Cursor.
- As a game developer, I want to switch between canvas-only and split (canvas + scene list) views.

### Video Preview
- As a video creator, I want to see frames appear in a strip as they land on disk so I know the generation is progressing.
- As a video creator, I want a progress bar showing how many frames have rendered so I can estimate completion.
- As a video creator, I want the panel to automatically switch to a video player when the final output file appears so I can watch the finished video immediately.
- As a video creator, I want to configure the output folder path so the panel watches the right directory.

### General
- As a builder, I want the panel to open with a keyboard shortcut so I can access it instantly.
- As a builder, I want the panel to maintain a dark theme that matches Cursor so it feels native.
- As a builder, I want the panel to never fully crash — even if one preview mode fails, the rest of the panel stays up.
