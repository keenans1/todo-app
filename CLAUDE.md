# Todo App — Claude Instructions

## Stack
- React 18 + TypeScript + Vite 4 (Node 16 — do not upgrade Vite beyond v4)
- `npm` only (not pnpm or yarn)

## Dev server
```
npm run dev   # http://localhost:5173
```

## Architecture
```
src/
├── main.tsx              # ReactDOM.createRoot entry point
├── App.tsx               # Root component — owns all state via useReducer + useTimer
├── index.css             # All CSS (dark theme with CSS custom properties)
├── types.ts              # Filter, Priority, Recurrence, Subtask, Todo
├── utils.ts              # formatTime, escapeHtml, advanceDueDate, formatDueDate
├── hooks/
│   └── useTimer.ts       # Timer start/pause/resume/stop/expire
└── components/
    ├── Header.tsx
    ├── AddTodoForm.tsx    # Owns all local form state
    ├── FilterBar.tsx
    ├── TodoList.tsx
    ├── TodoItem.tsx
    └── TodoPanel.tsx      # Expansion panel: notes + subtasks
```

## Key conventions
- `useReducer` in `App.tsx` for todo state; prop drilling — no context
- `useState` for `filter` and `expandedIds` (Set<number>) in `App.tsx`
- `expandedIds` must create a new Set on every mutation (React immutability)
- Todos persisted to `localStorage` via `useEffect`; timer + expansion state reset on reload
- `escapeHtml()` is NOT used in JSX (JSX auto-escapes); kept in utils.ts for tests only
- Timer expiry alert lives in `App.tsx` (not the hook) to avoid stale closure on `todos`

## GitHub
- Repo: keenans1/todo-app
- Main branch: `main`
- Feature branches must be prefixed with `feature/` (e.g. `feature/dark-theme`)
