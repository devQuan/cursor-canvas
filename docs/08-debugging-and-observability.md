# 08 — Debugging & Observability

## The Core Rule
**Reproduce before you fix.** If you can't reproduce it, you don't understand it. If you don't understand it, your fix is a guess.

---

## Where Bugs Live in This Extension

### 1. The Message Bridge
The `postMessage` / `onDidReceiveMessage` channel is the most failure-prone layer. Messages can be:
- Sent before the webview is ready (race condition on panel open)
- Silently dropped if the webview is hidden (Cursor moves it to background)
- Malformed if a type doesn't match the union

**Defense:**
- Webview sends `PANEL_READY` on mount before extension sends any state
- Extension queues messages until `PANEL_READY` is received
- All messages logged in dev mode on both sides

### 2. CSP Violations in the Webview
The webview Content Security Policy silently blocks resources. An iframe that doesn't load, a frame image that doesn't appear — CSP is the first suspect.

**Defense:**
- Open Cursor DevTools (`Help → Toggle Developer Tools`) during development
- CSP violations appear in the Console tab
- Test the CSP config in Phase 3, not at launch

### 3. File Watcher Double-Fire
`chokidar` fires multiple events per save on some editors and OS file systems (especially on Windows). Un-debounced, this causes duplicate frames, duplicate track changes, etc.

**Defense:**
- All watcher callbacks debounced 300ms minimum
- Test with rapid file saves (hold Cmd+S) in development

### 4. Extension Host vs. Webview Context Confusion
`vscode` APIs are only available in the extension host. React components are only in the webview. Mixing them causes cryptic "vscode is not defined" errors.

**Defense:**
- Services that use `vscode` APIs live exclusively in `src/services/`
- Components in `src/webview/` never import from `vscode`
- ESLint rule added to prevent `vscode` imports in the webview bundle

---

## Dev Mode Logging

Enable verbose logging during development:

```typescript
// src/services/logger.ts
const isDev = process.env.NODE_ENV === 'development'

export const log = {
  bridge: (direction: '→' | '←', msg: PanelMessage) => {
    if (isDev) console.log(`[Bridge ${direction}]`, JSON.stringify(msg))
  },
  watcher: (event: string, path: string) => {
    if (isDev) console.log(`[Watcher] ${event}: ${path}`)
  },
  error: (service: string, err: unknown) => {
    console.error(`[${service}]`, err)
  },
}
```

Webview side:
```typescript
// In the message listener
window.addEventListener('message', (event) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Canvas] message received:', event.data)
  }
  // ... handle
})
```

---

## Error Boundaries

Every preview mode is wrapped in an `ErrorBoundary`. If `AppPreview` throws, the panel shows the error fallback for that mode only — `GamePreview` and `VideoPreview` are unaffected.

```tsx
// ErrorBoundary shows this on catch:
<div className="error-state">
  <span>Preview error</span>
  <code>{error.message}</code>
  <button onClick={reset}>Retry</button>
</div>
```

---

## Common Errors & Fixes

| Symptom | Likely Cause | Fix |
|---|---|---|
| Iframe shows blank white | CSP blocking localhost | Check CSP `frame-src` allows `http://localhost:*` |
| Frame images don't load | Missing `vscode-resource:` URI conversion | Use `panel.webview.asWebviewUri()` on all file paths |
| Track badge doesn't update | Message sent before `PANEL_READY` | Verify message queueing logic in extension host |
| Double frame entries in strip | Watcher debounce too short | Increase to 500ms, check OS-specific watcher behavior |
| `vscode is not defined` in webview | vscode API imported in webview code | Move to extension host, bridge via messages |
| Panel blank after Cursor restart | Extension not re-activating | Check `activationEvents` in `package.json` |
| Settings not persisting | Wrong configuration key | Verify `vscode.workspace.getConfiguration('cursorCanvas')` key names |

---

## Debugging Checklist (use when stuck)

1. Open Cursor DevTools (`Help → Toggle Developer Tools`)
2. Check Console for CSP violations, JS errors, unhandled promise rejections
3. Enable dev mode logging and watch the bridge messages
4. Verify the extension is activated (`Extension Host` visible in Output panel)
5. Check `chokidar` is watching the right path (log watcher root on init)
6. Check `process.env.NODE_ENV` is set correctly in both bundles
7. Try a fresh Cursor window (rules out cached state)
8. Try a different OS if the bug is platform-specific

---

## Bug Report Format
When filing a bug (GitHub Issue or internal):

```
**Summary:** One line description

**Steps to Reproduce:**
1. Open workspace with [type]
2. Do X
3. Observe Y

**Expected:** What should happen
**Actual:** What did happen

**Environment:**
- OS:
- Cursor version:
- Extension version:
- Project type (app/game/video):

**Logs:** (paste from Cursor DevTools Console)
```
