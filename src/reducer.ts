import { Todo, Subtask } from "./types";
import { advanceDueDate } from "./utils";

export type Action =
  | { type: "ADD_TODO"; payload: Omit<Todo, "id" | "done"> }
  | { type: "TOGGLE_DONE"; id: number }
  | { type: "DELETE_TODO"; id: number }
  | { type: "TOGGLE_SUBTASK"; todoId: number; subtaskId: number; checked: boolean }
  | { type: "EDIT_TODO"; id: number; text: string }
  | { type: "REORDER_TODO"; draggedId: number; targetId: number };

export function nextId(todos: Todo[]): number {
  return Math.max(0, ...todos.map((t) => t.id)) + 1;
}

function nextSubtaskId(todos: Todo[]): number {
  return (
    Math.max(0, ...todos.flatMap((t) => (t.subtasks ?? []).map((s) => s.id))) + 1
  );
}

export function todosReducer(todos: Todo[], action: Action): Todo[] {
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

    case "EDIT_TODO": {
      const trimmed = action.text.trim();
      if (!trimmed) return todos;
      return todos.map((t) => t.id === action.id ? { ...t, text: trimmed } : t);
    }

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

    case "REORDER_TODO": {
      const { draggedId, targetId } = action;
      if (draggedId === targetId) return todos;
      const from = todos.findIndex((t) => t.id === draggedId);
      const to = todos.findIndex((t) => t.id === targetId);
      if (from === -1 || to === -1) return todos;
      const result = [...todos];
      const [moved] = result.splice(from, 1);
      result.splice(to, 0, moved);
      return result;
    }

    default:
      return todos;
  }
}
