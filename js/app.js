import {
    store,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodoText,
    clearCompletedTodos,
    setFilter,
} from "./state.js";
import { elements, render, getTodoId, startEditing } from "./ui.js";

const { form, input, taskList, clearCompleted, filterButtons } = elements;

form.addEventListener("submit", (event) => {
    event.preventDefault();
    addTodo(input.value);
    input.value = "";
    input.focus();
});

taskList.addEventListener("click", (event) => {
    const id = getTodoId(event.target);
    if (id === null) {
        return;
    }

    if (event.target.closest('[data-action="delete"]')) {
        deleteTodo(id);
    } else if (event.target.closest(".task-text")) {
        toggleTodo(id);
    }
});

taskList.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches(".task-text")) {
        event.preventDefault();
        const id = getTodoId(event.target);
        if (id !== null) {
            toggleTodo(id);
        }
    }
});

taskList.addEventListener("dblclick", (event) => {
    const text = event.target.closest(".task-text");
    if (!text) {
        return;
    }

    const id = getTodoId(text);
    const todo = store.getState().todos.find((t) => t.id === id);
    const li = text.closest(".task-item");
    if (!todo || !li) {
        return;
    }

    startEditing(li, todo, {
        onSave: (newText) => updateTodoText(id, newText),
        onCancel: () => render(store.getState()),
    });
});

filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.filter));
});

clearCompleted.addEventListener("click", clearCompletedTodos);

// Start the app.
store.subscribe(render);
render(store.getState());
