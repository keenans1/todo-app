import { Todo } from "../types";

interface Props {
  todo: Todo;
  onToggleSubtask: (todoId: number, subtaskId: number, checked: boolean) => void;
}

export default function TodoPanel({ todo, onToggleSubtask }: Props) {
  return (
    <div className="todo-panel">
      {todo.note && <p className="todo-note">{todo.note}</p>}
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
