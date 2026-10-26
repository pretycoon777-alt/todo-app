const STORAGE_KEY = "daily-todos-v1";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const remainingCount = document.querySelector("#remaining-count");
const completedCount = document.querySelector("#completed-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const today = document.querySelector("#today");

let todos = loadTodos();

today.textContent = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "long",
}).format(new Date());

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function createTodo(text) {
  return {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    text,
    completed: false,
  };
}

function render() {
  list.replaceChildren();

  todos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " completed" : ""}`;
    item.dataset.id = todo.id;

    const checkButton = document.createElement("button");
    checkButton.type = "button";
    checkButton.className = "check-button";
    checkButton.dataset.action = "toggle";
    checkButton.setAttribute("aria-label", todo.completed ? "미완료로 변경" : "완료로 변경");
    checkButton.setAttribute("aria-pressed", String(todo.completed));
    checkButton.textContent = "✓";

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.dataset.action = "delete";
    deleteButton.setAttribute("aria-label", `“${todo.text}” 삭제`);
    deleteButton.textContent = "×";

    item.append(checkButton, text, deleteButton);
    list.append(item);
  });

  const completed = todos.filter((todo) => todo.completed).length;
  const remaining = todos.length - completed;

  completedCount.textContent = String(completed);
  remainingCount.textContent = `${remaining}개 남음`;
  emptyState.hidden = todos.length > 0;
  clearCompletedButton.hidden = completed === 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) return;

  todos.unshift(createTodo(text));
  saveTodos();
  render();
  form.reset();
  input.focus();
});

list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  const item = button?.closest(".todo-item");

  if (!button || !item) return;

  if (button.dataset.action === "toggle") {
    todos = todos.map((todo) =>
      todo.id === item.dataset.id ? { ...todo, completed: !todo.completed } : todo,
    );
  }

  if (button.dataset.action === "delete") {
    todos = todos.filter((todo) => todo.id !== item.dataset.id);
  }

  saveTodos();
  render();
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
});

render();
