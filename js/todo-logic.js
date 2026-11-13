// PURE functions: array in, new array out. Nothing here touches the page or storage.

export const FILTER = { ALL: "all", ACTIVE: "active", COMPLETED: "completed" };
export const FILTERS = Object.values(FILTER);

export function isValidTodo(todo) {
    return (
        todo !== null &&
        typeof todo === "object" &&
        typeof todo.id === "number" &&
        typeof todo.text === "string" &&
        typeof todo.completed === "boolean"
    );
}

// Turns whatever came out of storage into a safe array of todos.
export function normalizeTodos(value) {
    return Array.isArray(value) ? value.filter(isValidTodo) : [];
}


// id and createdAt can be passed in, which makes this easy to test.
export function addTodo(
    todos,
    text,
    id = Date.now(),
    createdAt = new Date().toISOString()
) {
    const cleanText = String(text).trim();
    if (cleanText === "") {
        return todos;
    }
    return [...todos, { id, text: cleanText, completed: false, createdAt }];
}

export function toggleTodo(todos, id) {
    return todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
}

export function deleteTodo(todos, id) {
    return todos.filter((todo) => todo.id !== id);
}

// Saving an empty text deletes the todo, the same as your Week 5 edit behaviour.
export function updateTodoText(todos, id, text) {
    const cleanText = String(text).trim();
    if (cleanText === "") {
        return deleteTodo(todos, id);
    }
    return todos.map((todo) => (todo.id === id ? { ...todo, text: cleanText } : todo));
}

export function clearCompleted(todos) {
    return todos.filter((todo) => !todo.completed);
}

export function filterTodos(todos, filter) {
    if (filter === FILTER.ACTIVE) {
        return todos.filter((todo) => !todo.completed);
    }
    if (filter === FILTER.COMPLETED) {
        return todos.filter((todo) => todo.completed);
    }
    return todos;
}

export function countRemaining(todos) {
    return todos.filter((todo) => !todo.completed).length;
}