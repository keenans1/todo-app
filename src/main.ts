type Filter = "all" | "active" | "done";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

let todos: Todo[] = JSON.parse(localStorage.getItem("todos") ?? "[]");
let filter: Filter = "all";
let nextId = todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;

const input = document.getElementById("new-todo") as HTMLInputElement;
const addBtn = document.getElementById("add-btn") as HTMLButtonElement;
const list = document.getElementById("todo-list") as HTMLUListElement;
const footer = document.getElementById("footer") as HTMLParagraphElement;
const filterBtns = document.querySelectorAll<HTMLButtonElement>(".filters button");

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function render() {
  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  list.innerHTML = "";

  if (visible.length === 0) {
    list.innerHTML = `<li class="empty">Nothing here yet.</li>`;
  } else {
    for (const todo of visible) {
      const li = document.createElement("li");
      li.className = `todo-item${todo.done ? " done" : ""}`;
      li.innerHTML = `
        <input type="checkbox" ${todo.done ? "checked" : ""} data-id="${todo.id}" />
        <span>${escapeHtml(todo.text)}</span>
        <button class="delete-btn" data-id="${todo.id}" title="Delete">✕</button>
      `;
      list.appendChild(li);
    }
  }

  const remaining = todos.filter((t) => !t.done).length;
  footer.textContent = `${remaining} task${remaining !== 1 ? "s" : ""} remaining`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function addTodo() {
  const text = input.value.trim();
  if (!text) return;
  todos.push({ id: nextId++, text, done: false });
  input.value = "";
  save();
  render();
}

addBtn.addEventListener("click", addTodo);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

list.addEventListener("change", (e) => {
  const target = e.target as HTMLInputElement;
  if (target.type !== "checkbox") return;
  const id = Number(target.dataset.id);
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.done = target.checked;
    save();
    render();
  }
});

list.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (!target.classList.contains("delete-btn")) return;
  const id = Number(target.dataset.id);
  todos = todos.filter((t) => t.id !== id);
  save();
  render();
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter as Filter;
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

render();
