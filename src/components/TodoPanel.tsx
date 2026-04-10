import { useState } from "react";
import { Todo, Goal } from "../types";

interface Props {
  todo: Todo;
  goals: Goal[];
  onEditNote: (id: number, note: string) => void;
  onToggleSubtask: (todoId: number, subtaskId: number, checked: boolean) => void;
  onSetGoalLink: (id: number, goalId: number | undefined) => void;
}

export default function TodoPanel({ todo, goals, onEditNote, onToggleSubtask, onSetGoalLink }: Props) {
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(todo.note ?? "");

  function saveNote() {
    onEditNote(todo.id, noteDraft);
    setEditingNote(false);
  }

  function cancelNote() {
    setNoteDraft(todo.note ?? "");
    setEditingNote(false);
  }

  return (
    <div className="todo-panel">
      {goals.length > 0 && (
        <select
          className="todo-goal-select"
          value={todo.goalId ?? ""}
          onChange={(e) => onSetGoalLink(todo.id, e.target.value === "" ? undefined : Number(e.target.value))}
        >
          <option value="">No goal</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>{g.title}</option>
          ))}
        </select>
      )}
      {editingNote ? (
        <textarea
          className="note-edit-input"
          value={noteDraft}
          autoFocus
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={saveNote}
          onKeyDown={(e) => {
            if (e.key === "Escape") { e.preventDefault(); cancelNote(); }
          }}
        />
      ) : (
        <p
          className={`todo-note${todo.note ? "" : " todo-note-empty"}`}
          onClick={() => { setNoteDraft(todo.note ?? ""); setEditingNote(true); }}
          title="Click to edit note"
        >
          {todo.note ?? "Add a note…"}
        </p>
      )}

      {todo.subtasks && todo.subtasks.length > 0 && (
        <ul className="subtask-list">
          {todo.subtasks.map((s) => (
            <li key={s.id}>
              <input
                type="checkbox"
                checked={s.done}
                onChange={(e) => onToggleSubtask(todo.id, s.id, e.target.checked)}
              />
              <span className={s.done ? "subtask-done" : ""}>{s.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
