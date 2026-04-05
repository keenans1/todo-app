import { Todo, Filter } from "../types";
import TodoItem from "./TodoItem";

interface Props {
  todos: Todo[];
  filter: Filter;
  activeTimerId: number | null;
  timerRunning: boolean;
  remainingSeconds: number;
  expandedIds: Set<number>;
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onStartTimer: (id: number) => void;
  onPauseTimer: () => void;
  onResumeTimer: (id: number) => void;
  onStopTimer: () => void;
  onToggleSubtask: (todoId: number, subtaskId: number, checked: boolean) => void;
}

export default function TodoList({
  todos,
  filter,
  activeTimerId,
  timerRunning,
  remainingSeconds,
  expandedIds,
  onToggleDone,
  onDelete,
  onToggleExpand,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  onToggleSubtask,
}: Props) {
  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  return (
    <ul className="todo-list">
      {visible.length === 0 ? (
        <li className="empty">Nothing here yet.</li>
      ) : (
        visible.map((todo) => {
          const isActive = todo.id === activeTimerId;
          const otherTimerActive = activeTimerId !== null && !isActive;
          return (
            <TodoItem
              key={todo.id}
              todo={todo}
              isActive={isActive}
              isRunning={isActive && timerRunning}
              remainingSeconds={isActive ? remainingSeconds : 0}
              isExpanded={expandedIds.has(todo.id)}
              otherTimerActive={otherTimerActive}
              onToggleDone={onToggleDone}
              onDelete={onDelete}
              onToggleExpand={onToggleExpand}
              onStartTimer={onStartTimer}
              onPauseTimer={onPauseTimer}
              onResumeTimer={onResumeTimer}
              onStopTimer={onStopTimer}
              onToggleSubtask={onToggleSubtask}
            />
          );
        })
      )}
    </ul>
  );
}
