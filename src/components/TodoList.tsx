import { useState } from "react";
import { Todo, Filter, Goal } from "../types";
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
  onReorder: (draggedId: number, targetId: number) => void;
  onEdit: (id: number, text: string) => void;
  onEditNote: (id: number, note: string) => void;
  onToggleSubtask: (todoId: number, subtaskId: number, checked: boolean) => void;
  onSetGoalLink: (id: number, goalId: number | undefined) => void;
  goals: Goal[];
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
  onReorder,
  onEdit,
  onEditNote,
  onToggleSubtask,
  onSetGoalLink,
  goals,
}: Props) {
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

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
              isDragging={draggedId === todo.id}
              isDragOver={overId === todo.id && draggedId !== todo.id}
              onToggleDone={onToggleDone}
              onDelete={onDelete}
              onToggleExpand={onToggleExpand}
              onStartTimer={onStartTimer}
              onPauseTimer={onPauseTimer}
              onResumeTimer={onResumeTimer}
              onStopTimer={onStopTimer}
              onEdit={onEdit}
              onEditNote={onEditNote}
              onToggleSubtask={onToggleSubtask}
              onSetGoalLink={onSetGoalLink}
              goals={goals}
              onDragStart={() => setDraggedId(todo.id)}
              onDragOver={(e) => { e.preventDefault(); setOverId(todo.id); }}
              onDrop={() => {
                if (draggedId !== null && draggedId !== todo.id) {
                  onReorder(draggedId, todo.id);
                }
                setDraggedId(null);
                setOverId(null);
              }}
              onDragEnd={() => { setDraggedId(null); setOverId(null); }}
            />
          );
        })
      )}
    </ul>
  );
}
