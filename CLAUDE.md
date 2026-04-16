# Todo App — Claude Instructions

## Tech Stack
- React 18 + TypeScript + Vite 4 (Node 16 — do not upgrade Vite beyond v4)
- `npm` only (not pnpm or yarn)
- TypeScript only — never create plain `.js` files

## NPM Scripts
| Command              | What it does                        |
|----------------------|-------------------------------------|
| `npm run dev`        | Dev server at http://localhost:5173 |
| `npm run build`      | `tsc` type-check then Vite build    |
| `npm test`           | Run all tests once (vitest run)     |
| `npm run test:watch` | Run tests in watch mode             |

After a feature: run `npm test`, then verify the dev server renders the change correctly.

## Architecture
```
src/
├── main.tsx              # ReactDOM.createRoot entry point
├── App.tsx               # Root component — owns filter + expandedIds state; dispatches to todosReducer
├── reducer.ts            # todosReducer function + Action union type
├── index.css             # All CSS (dark theme with CSS custom properties)
├── types.ts              # Filter, Priority, Recurrence, Subtask, Todo
├── utils.ts              # formatTime, escapeHtml, advanceDueDate, formatDueDate
├── hooks/
│   └── useTimer.ts       # Timer start/pause/resume/stop/expire
└── components/
    ├── Header.tsx
    ├── AddTodoForm.tsx    # Owns all local form state
    ├── FilterBar.tsx
    ├── TodoList.tsx       # Owns drag-and-drop local state (dragOverId)
    ├── TodoItem.tsx       # Owns inline text edit-mode local state
    └── TodoPanel.tsx      # Expansion panel: notes + subtasks; owns note edit-mode local state
tests/
├── utils.test.ts         # Unit tests: formatTime, escapeHtml, advanceDueDate
├── reducer.test.ts       # Unit tests: todosReducer actions
└── integration.test.ts   # localStorage round-trip + recurrence logic (jsdom)
```

## State Model
Global state in `App.tsx`:
| State         | Mechanism                      | Notes                                            |
|---------------|--------------------------------|--------------------------------------------------|
| `todos`       | `useReducer(todosReducer, ...)` | Reducer logic lives in `reducer.ts`, not App.tsx |
| `filter`      | `useState<Filter>`             | "all" / "active" / "done"                        |
| `expandedIds` | `useState<Set<number>>`        | Which panels are open                            |
| Timer state   | `useTimer()` hook              | activeTimerId, remainingSeconds, timerRunning    |

Local component state — do NOT move these into the reducer:
- `TodoList` — drag-and-drop (`dragOverId`)
- `TodoItem` — inline text edit mode
- `TodoPanel` — note edit mode

## Reducer Actions (`reducer.ts`)
| Action type      | Key payload fields                                      |
|------------------|---------------------------------------------------------|
| `ADD_TODO`       | `Omit<Todo, "id" \| "done">`                            |
| `TOGGLE_DONE`    | `id: number`                                            |
| `DELETE_TODO`    | `id: number`                                            |
| `EDIT_TODO`      | `id: number, text: string`                              |
| `EDIT_NOTE`      | `id: number, note: string`                              |
| `TOGGLE_SUBTASK` | `todoId: number, subtaskId: number, checked: boolean`   |
| `REORDER_TODO`   | `draggedId: number, targetId: number`                   |

`TOGGLE_DONE` auto-spawns a next recurring todo when a todo with `recurrence` is completed.

## Key Conventions
- **No context, no external state library** — prop drilling throughout
- **`expandedIds` mutations** must always return `new Set(prev)` (React immutability)
- **Todos persisted** to `localStorage` via `useEffect`; timer + expansion state reset on reload
- **`escapeHtml()`** is NOT used in JSX (JSX auto-escapes); kept in utils.ts for tests only
- **Timer expiry alert** lives in `App.tsx` (not in `useTimer`) to avoid stale closure on `todos`

## Git Workflow
```
git checkout main && git pull origin main
git checkout -b feature/<branch-name>
# make changes → npm test → verify dev server
# push and open PR: feature/<branch-name> → main
```
- Never commit directly to `main`
- Branch prefix must be `feature/` (e.g. `feature/dark-theme`)
- Repo: `keenans1/todo-app`, default branch: `main`
