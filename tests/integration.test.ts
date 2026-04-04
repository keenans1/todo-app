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
