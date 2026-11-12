import { getFromStorage, saveToStorage } from "./storage.js";

const STORAGE_KEY = "todos";
const FILTER_KEY = "filter";
const VALID_FILTERS = ["all", "active", "completed"];

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const itemsLeft = document.getElementById("items-left");
const clearCompleted = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter");

// ---------- 1. Load ONCE, when the app starts ----------

function loadTodos() {
  const saved = getFromStorage(STORAGE_KEY, []);
  if (!Array.isArray(saved)) return [];

  // Keep only well-formed items, in case the saved data is damaged.
  return saved.filter(
    (todo) =>
      todo &&
      typeof todo.id === "number" &&
      typeof todo.text === "string" &&
      typeof todo.completed === "boolean"
  );
}

function loadFilter() {
  const saved = getFromStorage(FILTER_KEY, "all");
  return VALID_FILTERS.includes(saved) ? saved : "all";
}

let todos = loadTodos();
let currentFilter = loadFilter();

// ---------- 2. One place that saves and redraws ----------

function commit() {
  saveToStorage(STORAGE_KEY, todos);
  saveToStorage(FILTER_KEY, currentFilter);
  render();
}

// ---------- 3. Every action: change the array, then commit() ----------

function addTodo(text) {
  todos = [
    ...todos,
    { id: Date.now(), text, completed: false, createdAt: new Date().toISOString() },
  ];
  commit();
}

function toggleTodo(id) {
  todos = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
  commit();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  commit();
}

function updateTodoText(id, text) {
  todos = todos.map((t) => (t.id === id ? { ...t, text } : t));
  commit();
}

function clearCompletedTodos() {
  todos = todos.filter((t) => !t.completed);
  commit();
}

function setFilter(filter) {
  currentFilter = filter;
  commit();
}

// ---------- Drawing the page ----------

function render() {
  taskList.replaceChildren();

  const visibleTodos = todos.filter((todo) => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  visibleTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.taskId = String(todo.id);

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = todo.text;
    taskText.tabIndex = 0;
    taskText.setAttribute("role", "button");
    taskText.setAttribute("aria-pressed", String(todo.completed));
    taskText.setAttribute(
      "aria-label",
      `${todo.text}, ${todo.completed ? "completed" : "active"}. Press Enter or Space to toggle.`
    );
    if (todo.completed) taskText.classList.add("completed");

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-task";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete " + todo.text);

    li.append(taskText, deleteButton);
    taskList.appendChild(li);
  });

  // Show the saved filter as the highlighted button.
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });

  const remaining = todos.filter((t) => !t.completed).length;
  itemsLeft.textContent = remaining + (remaining === 1 ? " item left" : " items left");
}

// ---------- Events ----------

// dataset values are strings, so convert back to a number before comparing.
function getTodoId(target) {
  const item = target.closest(".task-item");
  return item ? Number(item.dataset.taskId) : null;
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const text = input.value.trim();

  if (text === "") {
    input.focus();
    return;
  }

  addTodo(text);
  input.value = "";
  input.focus();
});

// One delegated click listener handles toggling and deleting.
taskList.addEventListener("click", function (event) {
  const id = getTodoId(event.target);
  if (id === null) return;

  if (event.target.closest('[data-action="delete"]')) {
    deleteTodo(id);
  } else if (event.target.closest(".task-text")) {
    toggleTodo(id);
  }
});

taskList.addEventListener("keydown", function (event) {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches(".task-text")) {
    event.preventDefault();
    const id = getTodoId(event.target);
    if (id !== null) toggleTodo(id);
  }
});

taskList.addEventListener("dblclick", function (event) {
  const text = event.target.closest(".task-text");
  if (!text) return;

  const id = getTodoId(text);
  const todo = todos.find((t) => t.id === id);
  const li = text.closest(".task-item");
  if (todo && li) editTodo(todo, li);
});

function editTodo(todo, li) {
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = todo.text;
  editInput.setAttribute("aria-label", "Edit task");
  li.replaceChildren(editInput);
  editInput.focus();
  editInput.select();

  let finished = false;
  function finishEdit(save) {
    if (finished) return;
    finished = true;

    const newText = editInput.value.trim();
    if (save && newText) {
      updateTodoText(todo.id, newText);
    } else if (save) {
      deleteTodo(todo.id);
    } else {
      render(); // Escape: nothing changed, just redraw
    }
  }

  editInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") finishEdit(true);
    if (event.key === "Escape") finishEdit(false);
  });
  editInput.addEventListener("blur", () => finishEdit(true));
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

clearCompleted.addEventListener("click", clearCompletedTodos);

render();