import { todosReducer } from "../src/reducer";
import { Todo } from "../src/types";

const base: Todo[] = [
  { id: 1, text: "buy milk", done: false },
  { id: 2, text: "write tests", done: false },
];

describe("EDIT_TODO", () => {
  it("updates the text of the matching todo", () => {
    const result = todosReducer(base, { type: "EDIT_TODO", id: 1, text: "buy oat milk" });
    expect(result.find(t => t.id === 1)?.text).toBe("buy oat milk");
  });

  it("trims whitespace from the new text", () => {
    const result = todosReducer(base, { type: "EDIT_TODO", id: 1, text: "  trimmed  " });
    expect(result.find(t => t.id === 1)?.text).toBe("trimmed");
  });

  it("discards the edit when the new text is empty", () => {
    const result = todosReducer(base, { type: "EDIT_TODO", id: 1, text: "" });
    expect(result.find(t => t.id === 1)?.text).toBe("buy milk");
  });

  it("discards the edit when the new text is whitespace only", () => {
    const result = todosReducer(base, { type: "EDIT_TODO", id: 1, text: "   " });
    expect(result.find(t => t.id === 1)?.text).toBe("buy milk");
  });

  it("leaves other todos unchanged", () => {
    const result = todosReducer(base, { type: "EDIT_TODO", id: 1, text: "buy oat milk" });
    expect(result.find(t => t.id === 2)?.text).toBe("write tests");
  });

  it("returns todos unchanged when the id does not exist", () => {
    const result = todosReducer(base, { type: "EDIT_TODO", id: 99, text: "ghost" });
    expect(result).toEqual(base);
  });

  it("preserves all other fields on the edited todo", () => {
    const withExtras: Todo[] = [
      { id: 1, text: "old", done: false, priority: "high", duration: 30, dueDate: "2026-05-01" },
    ];
    const result = todosReducer(withExtras, { type: "EDIT_TODO", id: 1, text: "new" });
    const edited = result.find(t => t.id === 1)!;
    expect(edited.text).toBe("new");
    expect(edited.priority).toBe("high");
    expect(edited.duration).toBe(30);
    expect(edited.dueDate).toBe("2026-05-01");
    expect(edited.done).toBe(false);
  });
});

const list: Todo[] = [
  { id: 1, text: "alpha", done: false },
  { id: 2, text: "beta",  done: false },
  { id: 3, text: "gamma", done: false },
];

describe("REORDER_TODO", () => {
  it("moves an item earlier in the list", () => {
    const result = todosReducer(list, { type: "REORDER_TODO", draggedId: 3, targetId: 1 });
    expect(result.map(t => t.id)).toEqual([3, 1, 2]);
  });

  it("moves an item later in the list", () => {
    const result = todosReducer(list, { type: "REORDER_TODO", draggedId: 1, targetId: 3 });
    expect(result.map(t => t.id)).toEqual([2, 3, 1]);
  });

  it("is a no-op when dragged and target are the same", () => {
    const result = todosReducer(list, { type: "REORDER_TODO", draggedId: 2, targetId: 2 });
    expect(result).toEqual(list);
  });

  it("is a no-op when draggedId does not exist", () => {
    const result = todosReducer(list, { type: "REORDER_TODO", draggedId: 99, targetId: 1 });
    expect(result).toEqual(list);
  });

  it("is a no-op when targetId does not exist", () => {
    const result = todosReducer(list, { type: "REORDER_TODO", draggedId: 1, targetId: 99 });
    expect(result).toEqual(list);
  });

  it("preserves all fields on reordered todos", () => {
    const withExtras: Todo[] = [
      { id: 1, text: "a", done: false, priority: "high" },
      { id: 2, text: "b", done: true,  priority: "low"  },
    ];
    const result = todosReducer(withExtras, { type: "REORDER_TODO", draggedId: 2, targetId: 1 });
    expect(result[0]).toEqual({ id: 2, text: "b", done: true, priority: "low" });
    expect(result[1]).toEqual({ id: 1, text: "a", done: false, priority: "high" });
  });
});

describe("EDIT_NOTE", () => {
  it("sets the note on a todo", () => {
    const result = todosReducer(base, { type: "EDIT_NOTE", id: 1, note: "pick up 2 litres" });
    expect(result.find(t => t.id === 1)?.note).toBe("pick up 2 litres");
  });

  it("trims whitespace from the note", () => {
    const result = todosReducer(base, { type: "EDIT_NOTE", id: 1, note: "  trimmed  " });
    expect(result.find(t => t.id === 1)?.note).toBe("trimmed");
  });

  it("removes the note when saved as empty string", () => {
    const withNote: Todo[] = [{ id: 1, text: "buy milk", done: false, note: "existing" }];
    const result = todosReducer(withNote, { type: "EDIT_NOTE", id: 1, note: "" });
    expect(result.find(t => t.id === 1)?.note).toBeUndefined();
  });

  it("removes the note when saved as whitespace only", () => {
    const withNote: Todo[] = [{ id: 1, text: "buy milk", done: false, note: "existing" }];
    const result = todosReducer(withNote, { type: "EDIT_NOTE", id: 1, note: "   " });
    expect(result.find(t => t.id === 1)?.note).toBeUndefined();
  });

  it("leaves other todos unchanged", () => {
    const result = todosReducer(base, { type: "EDIT_NOTE", id: 1, note: "a note" });
    expect(result.find(t => t.id === 2)?.note).toBeUndefined();
  });

  it("is a no-op for unknown id", () => {
    const result = todosReducer(base, { type: "EDIT_NOTE", id: 99, note: "ghost" });
    expect(result).toEqual(base);
  });
});
