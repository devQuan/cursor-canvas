# 06 — Coding Standards

## Language
TypeScript strict mode everywhere. No `any`. No implicit returns. `tsconfig.json` with `"strict": true`.

---

## File Naming
| Type | Convention | Example |
|---|---|---|
| React components | PascalCase `.tsx` | `FrameStrip.tsx` |
| Services (extension host) | camelCase `.ts` | `trackResolver.ts` |
| Stores | camelCase `.ts` | `canvasStore.ts` |
| Tests | same name + `.test.ts(x)` | `FrameStrip.test.tsx` |
| E2E tests | kebab-case `.spec.ts` | `app-preview.spec.ts` |
| Styles | `globals.css` only — Tailwind utilities in JSX |

---

## Component Rules

- One component per file
- Props interface defined above the component, named `[ComponentName]Props`
- No prop drilling beyond 2 levels — use Zustand store
- Every component wrapped in `React.memo` unless it needs frequent re-renders
- Every component that touches user-facing state has an error boundary above it

```typescript
// Good
interface FrameStripProps {
  frames: Frame[]
  onFrameClick: (index: number) => void
}

const FrameStrip = React.memo(({ frames, onFrameClick }: FrameStripProps) => {
  // ...
})

export default FrameStrip
```

---

## State Rules

- All shared state lives in the Zustand store (`canvasStore.ts`)
- Local UI state (hover, focus, open/closed) uses `useState`
- No `useEffect` for derived state — use Zustand selectors or `useMemo`
- Store actions are defined inside the store, not in components

---

## Extension Host Rules

- All VS Code API calls are wrapped in `try/catch`
- Disposables are pushed to `context.subscriptions` — no manual `.dispose()` calls
- All file system operations use `vscode.workspace.fs` (not `fs` directly) unless in Node.js-only services
- Services are classes with a single `dispose()` method that cleans up watchers and intervals

---

## Message Bridge Rules

- Every message type is defined in `src/types/messages.ts` — no inline type definitions
- Every `postMessage` call logs the message in dev mode (`process.env.NODE_ENV === 'development'`)
- Every `onDidReceiveMessage` handler has a `default` case that logs unknown message types

---

## Naming Conventions
| Thing | Convention |
|---|---|
| Types / Interfaces | PascalCase |
| Enums | PascalCase |
| Constants | SCREAMING_SNAKE_CASE |
| Functions / methods | camelCase |
| CSS classes | Tailwind utilities only — no custom class names except in `globals.css` |
| Event handlers | `handle[Event]` prefix (e.g., `handleFrameClick`) |
| Boolean props/vars | `is`, `has`, `should` prefix (e.g., `isLoading`, `hasError`) |

---

## Branch Strategy
```
main          — production-ready, tagged releases only
dev           — integration branch, all features merge here first
feat/[name]   — feature branches
fix/[name]    — bug fix branches
chore/[name]  — tooling, docs, config
```

Merge order: `feat/* → dev → main`
Never commit directly to `main`.

---

## Commit Convention (Conventional Commits)
```
feat: add frame strip thumbnail component
fix: debounce file watcher to prevent double-fire
chore: update esbuild config for webview bundle
docs: add event timing table to API doc
test: add unit tests for port detector
refactor: extract engine detection logic into service
```

---

## Pre-commit Hooks (lint-staged + husky)
Runs on every commit:
1. ESLint — must pass with zero errors
2. Prettier — auto-formats staged files
3. TypeScript check — `tsc --noEmit`
4. Unit tests — `vitest run` (fast, no E2E)

---

## Code Review Checklist
Before merging any PR into `dev`:
- [ ] TypeScript: no `any`, no type assertions without comment explaining why
- [ ] No `console.log` in production paths (use the dev-mode logger)
- [ ] All new components have at least a smoke test
- [ ] All new services have unit tests
- [ ] New message types added to `src/types/messages.ts`
- [ ] No magic numbers — constants defined and named
- [ ] Error cases handled (try/catch, error state UI)
