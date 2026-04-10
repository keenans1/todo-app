import { useState } from "react";
import { Goal, Todo } from "../types";
import { formatDueDate } from "../utils";

interface Props {
  goal: Goal;
  todos: Todo[];
  onEdit: (id: number, title: string, dueDate?: string, notes?: string) => void;
  onDelete: (id: number) => void;
}

export default function GoalItem({ goal, todos, onEdit, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(goal.title);
  const [dateDraft, setDateDraft] = useState(goal.dueDate ?? "");
  const [notesDraft, setNotesDraft] = useState(goal.notes ?? "");

  const linked = todos.filter((t) => t.goalId === goal.id);
  const done = linked.filter((t) => t.done).length;
  const total = linked.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const isOverdue =
    goal.dueDate && new Date(goal.dueDate + "T00:00:00") < new Date(new Date().toDateString());

  function handleSave() {
    const trimmed = titleDraft.trim();
    if (!trimmed) return;
    onEdit(goal.id, trimmed, dateDraft || undefined, notesDraft.trim() || undefined);
    setEditing(false);
  }

  function handleCancel() {
    setTitleDraft(goal.title);
    setDateDraft(goal.dueDate ?? "");
    setNotesDraft(goal.notes ?? "");
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="goal-item">
        <div className="goal-edit-row">
          <input
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
            autoFocus
            placeholder="Goal title"
          />
          <input
            type="date"
            value={dateDraft}
            onChange={(e) => setDateDraft(e.target.value)}
          />
        </div>
        <textarea
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          style={{ width: "100%", resize: "vertical", boxSizing: "border-box" }}
        />
        <div className="goal-form-actions">
          <button className="goal-save-btn" onClick={handleSave}>Save</button>
          <button className="goal-cancel-btn" onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="goal-item">
      <div className="goal-item-row">
        <span className="goal-title" onClick={() => setEditing(true)} title="Click to edit">
          {goal.title}
        </span>
        {goal.dueDate && (
          <span className={`goal-due${isOverdue ? " overdue" : ""}`}>
            {formatDueDate(goal.dueDate)}
          </span>
        )}
        <button
          className="goal-delete-btn"
          onClick={() => onDelete(goal.id)}
          title="Delete goal"
        >
          ✕
        </button>
      </div>
      <div className="goal-progress-track">
        <div
          className={`goal-progress-fill${pct === 100 ? " goal-progress-fill--complete" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="goal-progress-label">
        {total === 0 ? "No tasks linked" : `${done}/${total} tasks · ${pct}%`}
      </span>
      {goal.notes && (
        <p className="goal-notes">{goal.notes}</p>
      )}
    </div>
  );
}
