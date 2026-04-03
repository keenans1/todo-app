type Filter = "all" | "active" | "done";

interface Todo {
  id: number;
  text: string;
  done: boolean;
  duration?: number; // minutes, persisted to localStorage
}

let todos: Todo[] = JSON.parse(localStorage.getItem("todos") ?? "[]");
let filter: Filter = "all";
let nextId = todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;

// Timer state — in-memory only, resets on page load
let activeTimerId: number | null = null;
let remainingSeconds: number = 0;
let timerInterval: ReturnType<typeof setInterval> | null = null;

const input = document.getElementById("new-todo") as HTMLInputElement;
const durationInput = document.getElementById("new-duration") as HTMLInputElement;
const addBtn = document.getElementById("add-btn") as HTMLButtonElement;
const list = document.getElementById("todo-list") as HTMLUListElement;
const footer = document.getElementById("footer") as HTMLParagraphElement;
const filterBtns = document.querySelectorAll<HTMLButtonElement>(".filters button");

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function clearTimerState() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  activeTimerId = null;
  remainingSeconds = 0;
}

function startTimer(id: number) {
  const todo = todos.find((t) => t.id === id);
  if (!todo || !todo.duration) return;
  if (remainingSeconds === 0) {
    remainingSeconds = todo.duration * 60;
  }
  activeTimerId = id;
  timerInterval = setInterval(tick, 1000);
  render();
}

function pauseTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  render();
}

function stopTimer() {
  clearTimerState();
  render();
}

function expireTimer() {
  const todo = todos.find((t) => t.id === activeTimerId);
  const text = todo ? todo.text : "task";
  stopTimer();
  window.alert(`Time's up! "${text}" timebox has ended.`);
}

function tick() {
  remainingSeconds -= 1;
  if (remainingSeconds <= 0) {
    expireTimer();
    return;
  }
  const el = document.querySelector<HTMLElement>(`[data-countdown="${activeTimerId}"]`);
  if (el) {
    el.textContent = formatTime(remainingSeconds);
    if (remainingSeconds < 60) {
      el.classList.add("urgent");
    }
  }
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
      const isActive = todo.id === activeTimerId;
      const isRunning = isActive && timerInterval !== null;
      const isPaused = isActive && timerInterval === null;

      let timerZone = "";
      if (todo.duration && !todo.done) {
        const otherTimerActive = activeTimerId !== null && !isActive;

        if (isActive) {
          timerZone = `
            <span class="timebox-countdown${remainingSeconds < 60 ? " urgent" : ""}" data-countdown="${todo.id}">${formatTime(remainingSeconds)}</span>
            ${isRunning ? `<button class="timebox-pause" data-id="${todo.id}">Pause</button>` : ""}
            ${isPaused ? `<button class="timebox-resume" data-id="${todo.id}">Resume</button>` : ""}
            <button class="timebox-stop" data-id="${todo.id}">Stop</button>
          `;
        } else {
          timerZone = `
            <span class="timebox-badge">${todo.duration} min</span>
            <button class="timebox-start" data-id="${todo.id}" ${otherTimerActive ? "disabled" : ""}>Start</button>
          `;
        }
      }

      const li = document.createElement("li");
      li.className = `todo-item${todo.done ? " done" : ""}${isActive ? " timebox-active" : ""}`;
      li.innerHTML = `
        <input type="checkbox" ${todo.done ? "checked" : ""} data-id="${todo.id}" />
        <span>${escapeHtml(todo.text)}</span>
        ${timerZone}
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
  const rawDuration = parseInt(durationInput.value, 10);
  const duration = rawDuration > 0 ? rawDuration : undefined;
  todos.push({ id: nextId++, text, done: false, duration });
  input.value = "";
  durationInput.value = "";
  save();
  render();
}

addBtn.addEventListener("click", addTodo);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});
durationInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

list.addEventListener("change", (e) => {
  const target = e.target as HTMLInputElement;
  if (target.type !== "checkbox") return;
  const id = Number(target.dataset.id);
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.done = target.checked;
    if (todo.done && activeTimerId === id) {
      clearTimerState();
    }
    save();
    render();
  }
});

list.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const id = Number(target.dataset.id);

  if (target.classList.contains("timebox-start")) {
    remainingSeconds = 0;
    startTimer(id);
  } else if (target.classList.contains("timebox-pause")) {
    pauseTimer();
  } else if (target.classList.contains("timebox-resume")) {
    startTimer(id);
  } else if (target.classList.contains("timebox-stop")) {
    stopTimer();
  } else if (target.classList.contains("delete-btn")) {
    if (activeTimerId === id) {
      clearTimerState();
    }
    todos = todos.filter((t) => t.id !== id);
    save();
    render();
  }
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
