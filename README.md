# Cursor Canvas — Docs Index

**GitHub:** https://github.com/devQuan/cursor-canvas
**Publisher:** devQuan

An embedded Cursor extension panel that auto-detects your active build track (App / Game / Video) and renders a live preview of what's being built in real time. Manual override always available.

---

## Build Order

Read and act on these documents in number order. Each one unlocks the next.

| # | File | What it covers |
|---|------|----------------|
| 00 | [Lifecycle Roadmap](./00-lifecycle-roadmap.md) | Full 8-phase build plan, layer order, QA baked in |
| 01 | [PRD](./01-prd.md) | What it is, who it's for, success metrics, MVP scope |
| 02 | [User Personas & Stories](./02-user-personas-and-stories.md) | Who uses this and what they need |
| 03 | [UX/UI Design Plan](./03-ux-ui-design-plan.md) | Panel layout, component breakdown, design system |
| 04 | [Software Architecture](./04-software-architecture-sad.md) | Full stack, data flow, extension API, build layers |
| 05 | [API & Event Documentation](./05-api-and-events.md) | Internal event contracts, message bus, panel API |
| 06 | [Coding Standards](./06-coding-standards.md) | Style guide, naming, branch/commit conventions |
| 07 | [QA & Test Plan](./07-qa-test-plan.md) | Test cases, manual/automated strategy |
| 08 | [Debugging & Observability](./08-debugging-and-observability.md) | Error handling, logging, triage process |
| 09 | [Launch & Distribution](./09-launch-and-distribution.md) | VS Code Marketplace checklist, versioning, release |
| 10 | [Privacy Policy](./10-privacy-policy.md) | Required for Marketplace listing |
| 11 | [Terms of Service](./11-terms-of-service.md) | Legal terms for end users |

---

## Non-Negotiable Core

If you trim the set, keep these:
- `00` — Lifecycle Roadmap
- `01` — PRD
- `04` — Software Architecture
- `07` — QA & Test Plan
- `08` — Debugging & Observability

---

## Tech Stack at a Glance

| Layer | Technology |
|---|---|
| Extension runtime | VS Code Extension API (Cursor compatible) |
| Panel UI | React 18 + TypeScript + Tailwind CSS |
| State management | Zustand |
| File watching | chokidar |
| App preview | iframe + localhost port detector |
| Game preview | Three.js canvas embed + scene panel |
| Video preview | Polling output dir + HTML5 video player |
| Build tool | esbuild (fast, extension-friendly) |
| Testing | Vitest + React Testing Library + Playwright |
| Linting | ESLint + Prettier |
