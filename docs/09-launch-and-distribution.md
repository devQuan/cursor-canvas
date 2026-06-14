# 09 — Launch & Distribution

## Target
VS Code Marketplace — Cursor installs VS Code-compatible extensions directly.

---

## Pre-Launch Checklist

### Code
- [ ] All automated tests pass (`vitest run` + Playwright)
- [ ] Manual test matrix complete on macOS, Windows, Linux
- [ ] No `console.log` calls in production code paths
- [ ] TypeScript builds clean with zero errors (`tsc --noEmit`)
- [ ] ESLint passes with zero errors
- [ ] `package.json` `version` set to `1.0.0`
- [ ] `CHANGELOG.md` written for v1.0.0

### Extension Manifest (`package.json`)
- [ ] `name` — unique, lowercase, hyphenated
- [ ] `displayName` — "Cursor Canvas"
- [ ] `description` — clear one-line description
- [ ] `version` — `"1.0.0"`
- [ ] `publisher` — `"devQuan"`
- [ ] `engines.vscode` — minimum VS Code version specified (e.g., `"^1.85.0"`)
- [ ] `activationEvents` — `["onStartupFinished"]`
- [ ] `contributes.commands` — "Open Canvas Panel" command registered
- [ ] `contributes.configuration` — all settings declared with types and defaults
- [ ] `icon` — 128x128 PNG icon included
- [ ] `categories` — `["Other"]` or `["Visualization"]`
- [ ] `keywords` — `["cursor", "preview", "live", "canvas", "game", "video"]`
- [ ] `repository` — `"https://github.com/devQuan/cursor-canvas"`
- [ ] `license` — MIT (or your chosen license)

### Marketplace Assets
- [ ] Extension icon (128×128 PNG, looks good on dark background)
- [ ] README.md with: install instructions, usage GIF/screenshot, configuration, known limitations
- [ ] `CHANGELOG.md` with v1.0.0 release notes
- [ ] Screenshots (3–5) for Marketplace gallery

---

## Packaging

```bash
# Install vsce if not already
npm install -g @vscode/vsce

# Package
vsce package

# Output: cursor-canvas-1.0.0.vsix
```

Test the `.vsix` locally before publishing:
```bash
# In Cursor: Extensions → ... → Install from VSIX
```

---

## Publishing

```bash
# First time: login with your publisher ID
vsce login devQuan

# Publish
vsce publish
```

Or use the Marketplace web UI to upload the `.vsix` directly.

---

## Versioning (Semantic Versioning)

| Change | Version bump |
|---|---|
| New feature (new preview mode, new engine support) | Minor (1.1.0) |
| Bug fix | Patch (1.0.1) |
| Breaking change (settings key renamed, API changed) | Major (2.0.0) |

Tag every release in git:
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## Post-Launch

### Day 1–7
- Monitor Marketplace reviews and GitHub issues
- Prepare a `v1.0.1` patch if any critical bugs surface
- Respond to all GitHub issues within 48h

### First Month
- Gather feedback on which preview mode is most used
- Note any engine or framework detection misses
- Plan `v1.1.0` based on real usage data

### Ongoing
- Quarterly compatibility check against new Cursor/VS Code versions
- Update `engines.vscode` minimum version as needed
- Keep `CHANGELOG.md` current with every release

---

## README Template (for Marketplace)

```markdown
# Cursor Canvas

Live preview panel for Cursor — see your app, game, or video being built in real time.

## Features
- **App mode:** Live localhost iframe with hot reload
- **Game mode:** Canvas preview + scene object panel  
- **Video mode:** Frame-by-frame strip → finished video player
- **Auto-detection:** Knows what you're building without configuration
- **Manual override:** Lock the track when auto-detection isn't right

## Install
Search "Cursor Canvas" in the Extensions panel or install from the VS Code Marketplace.

## Usage
1. Open any project in Cursor
2. Run `Cmd+Shift+P` → "Open Canvas Panel"
3. The panel detects your project type and shows the right preview

## Configuration
| Setting | Default | Description |
|---|---|---|
| `cursorCanvas.outputFolder` | `null` | Video output folder to watch for frames |
| `cursorCanvas.estimatedFrameCount` | `60` | Used for progress bar calculation |
| `cursorCanvas.portOverride` | `null` | Force a specific dev server port |
| `cursorCanvas.framePollingIntervalMs` | `300` | How often to check for new frames |

## Supported
- **App:** Vite, Next.js, Nuxt, Remix, any localhost dev server
- **Game:** Three.js, Unity WebGL builds, generic localhost game servers
- **Video:** Any generator that writes frames as PNG/JPG to a folder
```
