import { useReducer, useState, useEffect } from "react";
import { Todo, Filter, Subtask } from "./types";
import { advanceDueDate } from "./utils";
import { useTimer } from "./hooks/useTimer";
import Header from "./components/Header";
import AddTodoForm from "./components/AddTodoForm";
import FilterBar from "./components/FilterBar";
import TodoList from "./components/TodoList";

// ── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD_TODO"; payload: Omit<Todo, "id" | "done"> }
  | { type: "TOGGLE_DONE"; id: number }
  | { type: "DELETE_TODO"; id: number }
  | { type: "TOGGLE_SUBTASK"; todoId: number; subtaskId: number; checked: boolean };

function nextId(todos: Todo[]): number {
  return Math.max(0, ...todos.map((t) => t.id)) + 1;
}

function nextSubtaskId(todos: Todo[]): number {
  return (
    Math.max(
      0,
      ...todos.flatMap((t) => (t.subtasks ?? []).map((s) => s.id))
    ) + 1
  );
}

function todosReducer(todos: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "ADD_TODO": {
      const id = nextId(todos);
      return [...todos, { id, done: false, ...action.payload }];
    }

    case "TOGGLE_DONE": {
      const todo = todos.find((t) => t.id === action.id);
      if (!todo) return todos;

      const updated = todos.map((t) =>
        t.id === action.id ? { ...t, done: !t.done } : t
      );

      // Auto-recreate recurring todo when completed
      if (!todo.done && todo.recurrence) {
        const newTodo: Todo = {
          id: nextId(updated),
          text: todo.text,
          done: false,
          duration: todo.duration,
          priority: todo.priority,
          dueDate: todo.dueDate ? advanceDueDate(todo.dueDate, todo.recurrence) : undefined,
          recurrence: todo.recurrence,
          note: todo.note,
          subtasks: todo.subtasks?.map((s, i) => ({
            ...s,
            id: nextSubtaskId(updated) + i,
            done: false,
          })) as Subtask[] | undefined,
        };
        return [...updated, newTodo];
      }

      return updated;
    }

    case "DELETE_TODO":
      return todos.filter((t) => t.id !== action.id);

    case "TOGGLE_SUBTASK":
      return todos.map((t) => {
        if (t.id !== action.todoId) return t;
        return {
          ...t,
          subtasks: t.subtasks?.map((s) =>
            s.id === action.subtaskId ? { ...s, done: action.checked } : s
          ),
        };
      });

    default:
      return todos;
  }
}

// ── App ───────────────────────────────────────────────────────────────────────

function loadTodos(): Todo[] {
  try {
    return JSON.parse(localStorage.getItem("todos") ?? "[]");
  } catch {
    return [];
  }
}

export default function App() {
  const [todos, dispatch] = useReducer(todosReducer, undefined, loadTodos);
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const {
    activeTimerId,
    remainingSeconds,
    timerRunning,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    clearTimerForId,
  } = useTimer();

  // Persist todos to localStorage
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Alert when timer expires
  useEffect(() => {
    if (remainingSeconds === 0 && activeTimerId !== null && !timerRunning) {
      const todo = todos.find((t) => t.id === activeTimerId);
      window.alert(`Time's up! "${todo?.text ?? "task"}" timebox has ended.`);
      clearTimerForId(activeTimerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, timerRunning]);

  function handleToggleExpand(id: number) {
    setExpandedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function handleToggleDone(id: number) {
    if (activeTimerId === id) clearTimerForId(id);
    dispatch({ type: "TOGGLE_DONE", id });
  }

  function handleDelete(id: number) {
    if (activeTimerId === id) clearTimerForId(id);
    setExpandedIds((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
    dispatch({ type: "DELETE_TODO", id });
  }

  function handleStartTimer(id: number) {
    const todo = todos.find((t) => t.id === id);
    if (!todo?.duration) return;
    startTimer(id, todo.duration);
  }

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <div className="app">
      <Header />
      <AddTodoForm onAdd={(payload) => dispatch({ type: "ADD_TODO", payload })} />
      <FilterBar filter={filter} onChange={setFilter} />
      <TodoList
        todos={todos}
        filter={filter}
        activeTimerId={activeTimerId}
        timerRunning={timerRunning}
        remainingSeconds={remainingSeconds}
        expandedIds={expandedIds}
        onToggleDone={handleToggleDone}
        onDelete={handleDelete}
        onToggleExpand={handleToggleExpand}
        onStartTimer={handleStartTimer}
        onPauseTimer={pauseTimer}
        onResumeTimer={() => resumeTimer()}
        onStopTimer={stopTimer}
        onToggleSubtask={(todoId, subtaskId, checked) =>
          dispatch({ type: "TOGGLE_SUBTASK", todoId, subtaskId, checked })
        }
      />
      <p className="footer">
        {remaining} task{remaining !== 1 ? "s" : ""} remaining
      </p>
    </div>
  );
}
