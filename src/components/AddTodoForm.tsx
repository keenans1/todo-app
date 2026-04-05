import { useState } from "react";
import { Todo, Priority, Recurrence } from "../types";

interface Props {
  onAdd: (todo: Omit<Todo, "id" | "done">) => void;
}

export default function AddTodoForm({ onAdd }: Props) {
  const [text, setText] = useState("");
  const [duration, setDuration] = useState("");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [priority, setPriority] = useState<Priority | "">("");
  const [dueDate, setDueDate] = useState("");
  const [recurrence, setRecurrence] = useState<Recurrence | "">("");
  const [note, setNote] = useState("");

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;

    const rawDuration = parseInt(duration, 10);
    onAdd({
      text: trimmed,
      duration: rawDuration > 0 ? rawDuration : undefined,
      priority: (priority as Priority) || undefined,
      dueDate: dueDate || undefined,
      recurrence: (recurrence as Recurrence) || undefined,
      note: note.trim() || undefined,
    });

    setText("");
    setDuration("");
    setPriority("");
    setDueDate("");
    setRecurrence("");
    setNote("");
  }

  return (
    <>
      <div className={`input-row${optionsOpen ? " options-open" : ""}`}>
        <input
          className="new-todo-input"
          type="text"
          placeholder="Add a task…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        />
        <div className="divider" />
        <input
          className="new-duration-input"
          type="number"
          placeholder="min"
          min={1}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
        />
        <button
          className={`options-toggle${optionsOpen ? " active" : ""}`}
          onClick={() => setOptionsOpen((o) => !o)}
          title="More options"
        >
          ⋯
        </button>
        <button className="add-btn" onClick={submit}>+</button>
      </div>

      {optionsOpen && (
        <div className="input-options">
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority | "")}>
            <option value="">Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence | "")}>
            <option value="">Recurrence</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <textarea
            placeholder="Notes or subtasks (one per line, prefix with - for subtasks)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      )}
    </>
  );
}
