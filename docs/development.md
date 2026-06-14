# Development

## Setup

```bash
git clone https://github.com/devQuan/cursor-canvas.git
cd cursor-canvas
npm install
npm run build
```

Run the extension in development:

```bash
npm run dev:host
```

Or install a local VSIX:

```bash
npm run reinstall
# Developer: Reload Window
```

## Commands

| Script | Purpose |
|--------|---------|
| `npm run build` | Compile extension + webview |
| `npm test` | Vitest (unit, component, integration) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Test layout

```
tests/
├── unit/           — services, resolvers, detectors
├── components/     — React components (jsdom)
├── integration/    — message handler wiring
└── e2e/            — reserved for Playwright (future)
```

Tests use temporary workspaces (`tests/helpers/tempWorkspace.ts`), not committed fixture folders.

## Coding conventions

- TypeScript strict mode; avoid `any`
- Components: PascalCase `.tsx`, one per file
- Services: camelCase `.ts` under `src/services/`
- State: Zustand store (`canvasStore.ts`), not deep prop drilling
- Styling: Tailwind utilities; shared tokens in `globals.css`

## Debugging tips

1. **Message bridge** — Webview sends `PANEL_READY` before the host pushes state. Race bugs often show as empty panel on first open.
2. **CSP** — If iframe or frame images fail silently, check DevTools console in Cursor.
3. **File watchers** — Rapid saves can double-fire; services debounce (~300ms).
4. **Context split** — `vscode.*` APIs only in the extension host, never in webview React code.

## Pre-release checklist

- [ ] `npm test` passes
- [ ] `npm run typecheck` and `npm run lint` clean
- [ ] Manual smoke: App iframe, Game preview, Video live stage + player
- [ ] `CHANGELOG.md` updated
- [ ] Version bumped in `package.json`

See [release.md](./release.md) for tagging and Marketplace steps.
