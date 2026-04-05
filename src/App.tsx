import { useReducer, useState, useEffect } from "react";
import { Todo, Filter } from "./types";
import { todosReducer } from "./reducer";
import { useTimer } from "./hooks/useTimer";
import Header from "./components/Header";
import AddTodoForm from "./components/AddTodoForm";
import FilterBar from "./components/FilterBar";
import TodoList from "./components/TodoList";

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
        onEdit={(id, text) => dispatch({ type: "EDIT_TODO", id, text })}
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
