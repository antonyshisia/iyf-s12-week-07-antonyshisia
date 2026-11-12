const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const itemsLeft = document.getElementById("items-left");
const clearCompleted = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter");

let tasks = [];
let currentFilter = "all";

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const text = input.value.trim();

  if (text === "") {
    input.focus();
    return;
  }

  tasks.push({ id: Date.now() + Math.random(), text, completed: false });
  input.value = "";
  renderTasks();
  input.focus();
});

function renderTasks() {
  taskList.replaceChildren();
  const visibleTasks = tasks.filter(function (task) {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(function (task) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.taskId = String(task.id);

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;
    taskText.tabIndex = 0;
    taskText.setAttribute("role", "button");
    taskText.setAttribute("aria-pressed", String(task.completed));
    taskText.setAttribute("aria-label", `${task.text}, ${task.completed ? "completed" : "active"}. Press Enter or Space to toggle.`);
    if (task.completed) taskText.classList.add("completed");

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-task";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete " + task.text);

    li.append(taskText, deleteButton);
    taskList.appendChild(li);
  });

  const remaining = tasks.filter(task => !task.completed).length;
  itemsLeft.textContent = remaining + (remaining === 1 ? " item left" : " items left");
}

function findTaskFromTarget(target) {
  const item = target.closest(".task-item");
  return item ? tasks.find(task => String(task.id) === item.dataset.taskId) : undefined;
}

// One delegated click listener handles task toggles and deletion, including future items.
taskList.addEventListener("click", function (event) {
  const task = findTaskFromTarget(event.target);
  if (!task) return;

  if (event.target.closest('[data-action="delete"]')) {
    tasks = tasks.filter(item => item.id !== task.id);
  } else if (event.target.closest(".task-text")) {
    task.completed = !task.completed;
  } else {
    return;
  }
  renderTasks();
});

// Keyboard support for the task toggle.
taskList.addEventListener("keydown", function (event) {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches(".task-text")) {
    event.preventDefault();
    const task = findTaskFromTarget(event.target);
    if (task) task.completed = !task.completed;
    renderTasks();
  }
});

// Double-click edits are delegated too, so rerendered and newly added tasks work.
taskList.addEventListener("dblclick", function (event) {
  const text = event.target.closest(".task-text");
  if (!text) return;
  const task = findTaskFromTarget(text);
  const li = text.closest(".task-item");
  if (task && li) editTask(task, li);
});

function editTask(task, li) {
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = task.text;
  editInput.setAttribute("aria-label", "Edit task");
  li.replaceChildren(editInput);
  editInput.focus();
  editInput.select();

  let finished = false;
  function finishEdit(save) {
    if (finished) return;
    finished = true;
    const newText = editInput.value.trim();
    if (save && newText) task.text = newText;
    else if (save && !newText) tasks = tasks.filter(item => item.id !== task.id);
    renderTasks();
  }

  editInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") finishEdit(true);
    if (event.key === "Escape") finishEdit(false);
  });
  editInput.addEventListener("blur", () => finishEdit(true));
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(item => item.classList.toggle("active", item === button));
    renderTasks();
  });
});

clearCompleted.addEventListener("click", function () {
  tasks = tasks.filter(task => !task.completed);
  renderTasks();
});

renderTasks();
