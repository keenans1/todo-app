# Todo App — Claude Instructions

## Stack
- Vanilla TypeScript + Vite 4 (Node 16 — do not upgrade Vite beyond v4)
- No framework, no component library
- `npm` only (not pnpm or yarn)

## Dev server
```
npm run dev   # http://localhost:5173
```

## Architecture
- `src/main.ts` — all app logic (state, rendering, event handlers)
- `index.html` — all CSS lives here in a `<style>` block; also contains the HTML shell

## Key conventions
- All state is module-level variables in `main.ts`
- `render()` does a full DOM rebuild of `#todo-list` on every state change
- Exception: `tick()` updates the countdown element directly to avoid re-rendering every second
- Todos are persisted to `localStorage`; timer state is in-memory only (resets on reload)
- Event delegation is used on `#todo-list` — no per-item listeners
- `escapeHtml()` must be used for all user-supplied text injected into innerHTML

## GitHub
- Repo: keenans1/todo-app
- Main branch: `main`
- Feature branches must be prefixed with `feature/` (e.g. `feature/dark-theme`)
