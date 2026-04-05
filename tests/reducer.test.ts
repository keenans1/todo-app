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
