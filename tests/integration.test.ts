import { advanceDueDate } from "../src/utils";

describe("localStorage todo round-trip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves a todo array", () => {
    const todos = [{ id: 1, text: "write tests", done: false }];
    localStorage.setItem("todos", JSON.stringify(todos));
    const retrieved = JSON.parse(localStorage.getItem("todos") ?? "[]");
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].text).toBe("write tests");
  });

  it("returns empty array when nothing is stored", () => {
    const result = JSON.parse(localStorage.getItem("todos") ?? "[]");
    expect(result).toEqual([]);
  });

  it("persists the done state of a todo", () => {
    const todos = [{ id: 1, text: "finish feature", done: true }];
    localStorage.setItem("todos", JSON.stringify(todos));
    const retrieved = JSON.parse(localStorage.getItem("todos") ?? "[]");
    expect(retrieved[0].done).toBe(true);
  });

  it("persists the duration field", () => {
    const todos = [{ id: 1, text: "deep work", done: false, duration: 25 }];
    localStorage.setItem("todos", JSON.stringify(todos));
    const retrieved = JSON.parse(localStorage.getItem("todos") ?? "[]");
    expect(retrieved[0].duration).toBe(25);
  });

  it("stores multiple todos and preserves order", () => {
    const todos = [
      { id: 1, text: "first", done: false },
      { id: 2, text: "second", done: true },
      { id: 3, text: "third", done: false },
    ];
    localStorage.setItem("todos", JSON.stringify(todos));
    const retrieved = JSON.parse(localStorage.getItem("todos") ?? "[]");
    expect(retrieved).toHaveLength(3);
    expect(retrieved[1].text).toBe("second");
  });
});

describe("localStorage todo round-trip with new fields", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists and retrieves priority", () => {
    const todos = [{ id: 1, text: "urgent", done: false, priority: "high" }];
    localStorage.setItem("todos", JSON.stringify(todos));
    const retrieved = JSON.parse(localStorage.getItem("todos") ?? "[]");
    expect(retrieved[0].priority).toBe("high");
  });

  it("persists and retrieves dueDate", () => {
    const todos = [{ id: 1, text: "deadline", done: false, dueDate: "2026-04-10" }];
    localStorage.setItem("todos", JSON.stringify(todos));
    const retrieved = JSON.parse(localStorage.getItem("todos") ?? "[]");
    expect(retrieved[0].dueDate).toBe("2026-04-10");
  });

  it("persists and retrieves recurrence", () => {
    const todos = [{ id: 1, text: "standup", done: false, recurrence: "daily" }];
    localStorage.setItem("todos", JSON.stringify(todos));
    const retrieved = JSON.parse(localStorage.getItem("todos") ?? "[]");
    expect(retrieved[0].recurrence).toBe("daily");
  });

  it("persists and retrieves subtasks", () => {
    const todos = [{
      id: 1, text: "project", done: false,
      subtasks: [
        { id: 1, text: "step 1", done: false },
        { id: 2, text: "step 2", done: true },
      ],
    }];
    localStorage.setItem("todos", JSON.stringify(todos));
    const retrieved = JSON.parse(localStorage.getItem("todos") ?? "[]");
    expect(retrieved[0].subtasks).toHaveLength(2);
    expect(retrieved[0].subtasks[1].done).toBe(true);
  });

  it("persists and retrieves a note", () => {
    const todos = [{ id: 1, text: "research", done: false, note: "check the docs" }];
    localStorage.setItem("todos", JSON.stringify(todos));
    const retrieved = JSON.parse(localStorage.getItem("todos") ?? "[]");
    expect(retrieved[0].note).toBe("check the docs");
  });

  it("treats missing new fields as undefined (backwards compat)", () => {
    const todos = [{ id: 1, text: "old task", done: false }];
    localStorage.setItem("todos", JSON.stringify(todos));
    const retrieved = JSON.parse(localStorage.getItem("todos") ?? "[]");
    expect(retrieved[0].priority).toBeUndefined();
    expect(retrieved[0].dueDate).toBeUndefined();
    expect(retrieved[0].recurrence).toBeUndefined();
    expect(retrieved[0].subtasks).toBeUndefined();
    expect(retrieved[0].note).toBeUndefined();
  });
});

describe("recurring task auto-creation logic", () => {
  it("produces a copy with done: false and advanced dueDate for daily recurrence", () => {
    const original = {
      id: 1, text: "standup", done: true,
      recurrence: "daily" as const, dueDate: "2026-04-04",
    };
    const copy = {
      id: 2,
      text: original.text,
      done: false,
      recurrence: original.recurrence,
      dueDate: advanceDueDate(original.dueDate, original.recurrence),
    };
    expect(copy.done).toBe(false);
    expect(copy.dueDate).toBe("2026-04-05");
    expect(copy.text).toBe("standup");
  });

  it("produces a copy with done: false and advanced dueDate for weekly recurrence", () => {
    const original = {
      id: 1, text: "weekly review", done: true,
      recurrence: "weekly" as const, dueDate: "2026-04-04",
    };
    const copy = {
      id: 2,
      text: original.text,
      done: false,
      recurrence: original.recurrence,
      dueDate: advanceDueDate(original.dueDate, original.recurrence),
    };
    expect(copy.done).toBe(false);
    expect(copy.dueDate).toBe("2026-04-11");
  });
});
