# Todo App

A fast, keyboard-friendly task manager built with React 18 and TypeScript. All data is saved to your browser — no account or server needed.

---

## Features

### Adding tasks
- Type a task name and press **Enter** or click **+** to add
- Optionally enter a duration (in minutes) to enable timeboxing
- Click **⋯** to expand additional options:
  - **Priority** — high / medium / low (shown as a color-coded dot)
  - **Due date** — overdue tasks are highlighted in red
  - **Recurrence** — daily or weekly; completing a recurring task automatically creates the next occurrence
  - **Notes / Subtasks** — freeform note, or prefix lines with `-` to create subtasks

### Managing tasks
- **Check the checkbox** to mark a task done
- **Click the title** to edit it inline
- **Drag the ⠿ handle** to reorder tasks
- **Click ›** to expand a task and edit its note or check off subtasks
- **Click ✕** to delete

### Timeboxing
When a task has a duration set:
1. Click **Start** to begin the countdown timer
2. Use **Pause / Resume** to control it
3. **Stop** ends the timer early
4. An alert fires when time runs out

### Filtering
Use the **All / Active / Done** tabs to filter the list.

---

## Getting started

**Requirements:** Node 16+, npm

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
# → http://localhost:5173
```

```bash
# Type-check and build for production
npm run build

# Run tests
npm test
```

---

## Project structure

```
src/
├── main.tsx              # App entry point
├── App.tsx               # Root component — owns all state
├── index.css             # All styles (dark theme, CSS custom properties)
├── types.ts              # Todo, Subtask, Filter, Priority, Recurrence
├── reducer.ts            # Pure reducer for all todo state changes
├── utils.ts              # formatTime, formatDueDate, advanceDueDate
├── hooks/
│   └── useTimer.ts       # Timer logic (start / pause / resume / stop / expire)
└── components/
    ├── Header.tsx         # App title
    ├── AddTodoForm.tsx    # New task form with expandable options
    ├── FilterBar.tsx      # All / Active / Done tabs
    ├── TodoList.tsx       # Renders the list, owns drag state
    ├── TodoItem.tsx       # Individual task row with all controls
    └── TodoPanel.tsx      # Expanded panel: editable note + subtasks
```

### State management

- All todo state lives in `App.tsx` via `useReducer` — the reducer is in `reducer.ts` as a pure function (no React imports) so it can be unit tested directly
- `filter` and `expandedIds` are plain `useState` in `App.tsx`
- State is passed down via props (no Context)
- Todos are persisted to `localStorage` on every change
- Timer and expanded panel state reset on page reload

---

## Tech stack

| Tool | Version | Purpose |
|---|---|---|
| React | 18 | UI |
| TypeScript | 5 | Type safety |
| Vite | 4 | Dev server + bundler |
| Vitest | 0.34 | Unit tests |

> **Note:** Do not upgrade Vite beyond v4 — the project targets Node 16.
