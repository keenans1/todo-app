import { formatTime, escapeHtml, advanceDueDate, formatDueDate } from "./utils";

type Filter = "all" | "active" | "done";
type Priority = "high" | "medium" | "low";
type Recurrence = "daily" | "weekly";

interface Subtask {
  id: number;
  text: string;
  done: boolean;
}

interface Todo {
  id: number;
  text: string;
  done: boolean;
  duration?: number;
  priority?: Priority;
  dueDate?: string;
  recurrence?: Recurrence;
  note?: string;
  subtasks?: Subtask[];
}

let todos: Todo[] = JSON.parse(localStorage.getItem("todos") ?? "[]");
let filter: Filter = "all";
let nextId = todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
let nextSubtaskId = todos.reduce((max, t) =>
  Math.max(max, ...(t.subtasks ?? []).map(s => s.id), 0), 0) + 1;

// Timer state — in-memory only, resets on page load
let activeTimerId: number | null = null;
let remainingSeconds: number = 0;
let timerInterval: ReturnType<typeof setInterval> | null = null;

// Expansion state — in-memory only
const expandedIds = new Set<number>();

// DOM refs
const input = document.getElementById("new-todo") as HTMLInputElement;
const durationInput = document.getElementById("new-duration") as HTMLInputElement;
const optionsToggle = document.getElementById("options-toggle") as HTMLButtonElement;
const inputOptions = document.getElementById("input-options") as HTMLDivElement;
const prioritySelect = document.getElementById("new-priority") as HTMLSelectElement;
const dueDateInput = document.getElementById("new-due-date") as HTMLInputElement;
const recurrenceSelect = document.getElementById("new-recurrence") as HTMLSelectElement;
const noteInput = document.getElementById("new-note") as HTMLTextAreaElement;
const addBtn = document.getElementById("add-btn") as HTMLButtonElement;
const list = document.getElementById("todo-list") as HTMLUListElement;
const footer = document.getElementById("footer") as HTMLParagraphElement;
const filterBtns = document.querySelectorAll<HTMLButtonElement>(".filters button");

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
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
    if (remainingSeconds < 60) el.classList.add("urgent");
  }
}

function render() {
  const todayStr = new Date().toISOString().slice(0, 10);

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
      const isExpanded = expandedIds.has(todo.id);
      const hasPanel = !!(todo.note || (todo.subtasks && todo.subtasks.length > 0));

      // Priority dot
      const priorityDot = todo.priority
        ? `<span class="priority-dot priority-${todo.priority}" title="${todo.priority} priority"></span>`
        : "";

      // Due date label
      let dueLabel = "";
      if (todo.dueDate) {
        const isOverdue = !todo.done && todo.dueDate < todayStr;
        dueLabel = `<span class="due-label${isOverdue ? " overdue" : ""}">${formatDueDate(todo.dueDate)}</span>`;
      }

      // Recurrence badge
      const recurBadge = todo.recurrence
        ? `<span class="recur-badge" title="Repeats ${todo.recurrence}">↻</span>`
        : "";

      // Subtask count
      let subtaskCount = "";
      if (todo.subtasks && todo.subtasks.length > 0) {
        const done = todo.subtasks.filter(s => s.done).length;
        const total = todo.subtasks.length;
        const allDone = done === total;
        subtaskCount = `<span class="subtask-count${allDone ? " all-done" : ""}">${done}/${total}</span>`;
      }

      // Expand button
      const expandBtn = hasPanel
        ? `<button class="expand-btn${isExpanded ? " expanded" : ""}" data-id="${todo.id}">›</button>`
        : "";

      // Timer zone
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

      // Expansion panel
      let panel = "";
      if (isExpanded && hasPanel) {
        const noteHtml = todo.note
          ? `<p class="todo-note">${escapeHtml(todo.note)}</p>`
          : "";
        const subtasksHtml = todo.subtasks && todo.subtasks.length > 0
          ? `<ul class="subtask-list">${todo.subtasks.map(s => `
              <li>
                <input type="checkbox" class="subtask-cb" ${s.done ? "checked" : ""}
                  data-todo-id="${todo.id}" data-subtask-id="${s.id}" />
                <span class="${s.done ? "subtask-done" : ""}">${escapeHtml(s.text)}</span>
              </li>`).join("")}
            </ul>`
          : "";
        panel = `<div class="todo-panel">${noteHtml}${subtasksHtml}</div>`;
      }

      const li = document.createElement("li");
      li.className = `todo-item${todo.done ? " done" : ""}${isActive ? " timebox-active" : ""}`;
      li.innerHTML = `
        <div class="todo-row">
          ${priorityDot}
          <input type="checkbox" ${todo.done ? "checked" : ""} data-id="${todo.id}" />
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          ${recurBadge}
          ${dueLabel}
          ${subtaskCount}
          ${expandBtn}
          ${timerZone}
          <button class="delete-btn" data-id="${todo.id}" title="Delete">✕</button>
        </div>
        ${panel}
      `;
      list.appendChild(li);
    }
  }

  const remaining = todos.filter((t) => !t.done).length;
  footer.textContent = `${remaining} task${remaining !== 1 ? "s" : ""} remaining`;
}

function addTodo() {
  const text = input.value.trim();
  if (!text) return;

  const rawDuration = parseInt(durationInput.value, 10);
  const duration = rawDuration > 0 ? rawDuration : undefined;
  const priority = (prioritySelect.value as Priority) || undefined;
  const dueDate = dueDateInput.value || undefined;
  const recurrence = (recurrenceSelect.value as Recurrence) || undefined;
  const note = noteInput.value.trim() || undefined;

  todos.push({ id: nextId++, text, done: false, duration, priority, dueDate, recurrence, note });

  input.value = "";
  durationInput.value = "";
  prioritySelect.value = "";
  dueDateInput.value = "";
  recurrenceSelect.value = "";
  noteInput.value = "";

  save();
  render();
}

// Options toggle
optionsToggle.addEventListener("click", () => {
  inputOptions.hidden = !inputOptions.hidden;
  optionsToggle.classList.toggle("active", !inputOptions.hidden);
});

addBtn.addEventListener("click", addTodo);
input.addEventListener("keydown", (e) => { if (e.key === "Enter") addTodo(); });
durationInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addTodo(); });

list.addEventListener("change", (e) => {
  const target = e.target as HTMLInputElement;
  if (target.type !== "checkbox") return;

  // Subtask checkbox
  if (target.classList.contains("subtask-cb")) {
    const todoId = Number(target.dataset.todoId);
    const subtaskId = Number(target.dataset.subtaskId);
    const todo = todos.find(t => t.id === todoId);
    if (todo?.subtasks) {
      const sub = todo.subtasks.find(s => s.id === subtaskId);
      if (sub) {
        sub.done = target.checked;
        save();
        render();
      }
    }
    return;
  }

  // Todo checkbox
  const id = Number(target.dataset.id);
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.done = target.checked;

    if (todo.done && activeTimerId === id) {
      clearTimerState();
    }

    if (todo.done && todo.recurrence) {
      todos.push({
        id: nextId++,
        text: todo.text,
        done: false,
        duration: todo.duration,
        priority: todo.priority,
        dueDate: todo.dueDate ? advanceDueDate(todo.dueDate, todo.recurrence) : undefined,
        recurrence: todo.recurrence,
        note: todo.note,
        subtasks: todo.subtasks?.map(s => ({ ...s, id: nextSubtaskId++, done: false })),
      });
    }

    save();
    render();
  }
});

list.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const id = Number(target.dataset.id);

  if (target.classList.contains("expand-btn")) {
    expandedIds.has(id) ? expandedIds.delete(id) : expandedIds.add(id);
    render();
  } else if (target.classList.contains("timebox-start")) {
    remainingSeconds = 0;
    startTimer(id);
  } else if (target.classList.contains("timebox-pause")) {
    pauseTimer();
  } else if (target.classList.contains("timebox-resume")) {
    startTimer(id);
  } else if (target.classList.contains("timebox-stop")) {
    stopTimer();
  } else if (target.classList.contains("delete-btn")) {
    if (activeTimerId === id) clearTimerState();
    expandedIds.delete(id);
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
