import { useState } from "react";
import { Goal, Todo } from "../types";
import GoalItem from "./GoalItem";

interface Props {
  goals: Goal[];
  todos: Todo[];
  onAddGoal: (payload: Omit<Goal, "id">) => void;
  onEditGoal: (id: number, title: string, dueDate?: string, notes?: string) => void;
  onDeleteGoal: (id: number) => void;
}

export default function GoalsSection({ goals, todos, onAddGoal, onEditGoal, onDeleteGoal }: Props) {
  const [addingNew, setAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newNotes, setNewNotes] = useState("");

  function handleAdd() {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    onAddGoal({ title: trimmed, dueDate: newDate || undefined, notes: newNotes.trim() || undefined });
    setNewTitle("");
    setNewDate("");
    setNewNotes("");
    setAddingNew(false);
  }

  function handleCancel() {
    setNewTitle("");
    setNewDate("");
    setNewNotes("");
    setAddingNew(false);
  }

  return (
    <section className="goals-section">
      <div className="goals-header">
        <span className="goals-heading">Goals</span>
        {!addingNew && (
          <button className="goal-add-trigger" onClick={() => setAddingNew(true)}>
            + Add goal
          </button>
        )}
      </div>

      {addingNew && (
        <div className="goal-add-form">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") handleCancel();
            }}
            placeholder="Goal title"
            autoFocus
            style={{ flex: 1, minWidth: 140 }}
          />
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <textarea
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={2}
            style={{ width: "100%", resize: "vertical", boxSizing: "border-box" }}
          />
          <div className="goal-form-actions">
            <button className="goal-save-btn" onClick={handleAdd}>Save</button>
            <button className="goal-cancel-btn" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

      {goals.map((goal) => (
        <GoalItem
          key={goal.id}
          goal={goal}
          todos={todos}
          onEdit={onEditGoal}
          onDelete={onDeleteGoal}
        />
      ))}
    </section>
  );
}
