import { filterTodos, countRemaining } from "./todo-logic.js";

export const elements = {
  form: document.getElementById("task-form"),
  input: document.getElementById("task-input"),
  taskList: document.getElementById("task-list"),
  itemsLeft: document.getElementById("items-left"),
  clearCompleted: document.getElementById("clear-completed"),
  filterButtons: document.querySelectorAll(".filter"),
};

export function render({ todos, filter }) {
  const { taskList, itemsLeft, filterButtons } = elements;

  taskList.replaceChildren();

  filterTodos(todos, filter).forEach((todo) => {
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

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });

  const remaining = countRemaining(todos);
  itemsLeft.textContent = remaining + (remaining === 1 ? " item left" : " items left");
}

// dataset values are strings, so convert back to a number.
export function getTodoId(element) {
  const item = element.closest(".task-item");
  return item ? Number(item.dataset.taskId) : null;
}

// Swaps a task's row for a text box. It reports back through callbacks.
export function startEditing(li, todo, { onSave, onCancel }) {
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = todo.text;
  editInput.setAttribute("aria-label", "Edit task");
  li.replaceChildren(editInput);
  editInput.focus();
  editInput.select();

  let finished = false;
  function finish(save) {
    if (finished) return;
    finished = true;
    if (save) onSave(editInput.value);
    else onCancel();
  }

  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") finish(true);
    if (event.key === "Escape") finish(false);
  });
  editInput.addEventListener("blur", () => finish(true));
}