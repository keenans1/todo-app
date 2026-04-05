import { useState } from "react";
import { Todo } from "../types";
import { formatTime, formatDueDate } from "../utils";
import TodoPanel from "./TodoPanel";

interface Props {
  todo: Todo;
  isActive: boolean;
  isRunning: boolean;
  remainingSeconds: number;
  isExpanded: boolean;
  otherTimerActive: boolean;
  onToggleDone: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onStartTimer: (id: number) => void;
  onPauseTimer: () => void;
  onResumeTimer: (id: number) => void;
  onStopTimer: () => void;
  onEdit: (id: number, text: string) => void;
  onToggleSubtask: (todoId: number, subtaskId: number, checked: boolean) => void;
}

export default function TodoItem({
  todo,
  isActive,
  isRunning,
  remainingSeconds,
  isExpanded,
  otherTimerActive,
  onToggleDone,
  onDelete,
  onToggleExpand,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  onEdit,
  onToggleSubtask,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const todayStr = new Date().toISOString().slice(0, 10);
  const hasPanel = !!(todo.note || (todo.subtasks && todo.subtasks.length > 0));

  const doneSubtasks = todo.subtasks?.filter((s) => s.done).length ?? 0;
  const totalSubtasks = todo.subtasks?.length ?? 0;

  return (
    <li className={`todo-item${todo.done ? " done" : ""}${isActive ? " timebox-active" : ""}`}>
      <div className="todo-row">
        {todo.priority && (
          <span
            className={`priority-dot priority-${todo.priority}`}
            title={`${todo.priority} priority`}
          />
        )}
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggleDone(todo.id)}
        />
        {editing ? (
          <input
            className="todo-edit-input"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => { onEdit(todo.id, draft); setEditing(false); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { onEdit(todo.id, draft); setEditing(false); }
              if (e.key === "Escape") { setDraft(todo.text); setEditing(false); }
            }}
          />
        ) : (
          <span
            className="todo-text"
            onClick={() => { if (!todo.done) { setDraft(todo.text); setEditing(true); } }}
            title={todo.done ? undefined : "Click to edit"}
          >
            {todo.text}
          </span>
        )}

        {todo.recurrence && (
          <span className="recur-badge" title={`Repeats ${todo.recurrence}`}>↻</span>
        )}

        {todo.dueDate && (
          <span className={`due-label${!todo.done && todo.dueDate < todayStr ? " overdue" : ""}`}>
            {formatDueDate(todo.dueDate)}
          </span>
        )}

        {totalSubtasks > 0 && (
          <span className={`subtask-count${doneSubtasks === totalSubtasks ? " all-done" : ""}`}>
            {doneSubtasks}/{totalSubtasks}
          </span>
        )}

        {hasPanel && (
          <button
            className={`expand-btn${isExpanded ? " expanded" : ""}`}
            onClick={() => onToggleExpand(todo.id)}
          >
            ›
          </button>
        )}

        {todo.duration && !todo.done && (
          isActive ? (
            <>
              <span className={`timebox-countdown${remainingSeconds < 60 ? " urgent" : ""}`}>
                {formatTime(remainingSeconds)}
              </span>
              {isRunning && (
                <button className="timebox-pause" onClick={onPauseTimer}>Pause</button>
              )}
              {!isRunning && (
                <button className="timebox-resume" onClick={() => onResumeTimer(todo.id)}>Resume</button>
              )}
              <button className="timebox-stop" onClick={onStopTimer}>Stop</button>
            </>
          ) : (
            <>
              <span className="timebox-badge">{todo.duration} min</span>
              <button
                className="timebox-start"
                disabled={otherTimerActive}
                onClick={() => onStartTimer(todo.id)}
              >
                Start
              </button>
            </>
          )
        )}

        <button className="delete-btn" onClick={() => onDelete(todo.id)} title="Delete">✕</button>
      </div>

      {isExpanded && hasPanel && (
        <TodoPanel todo={todo} onToggleSubtask={onToggleSubtask} />
      )}
    </li>
  );
}
