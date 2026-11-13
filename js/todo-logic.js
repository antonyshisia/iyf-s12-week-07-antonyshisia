// PURE functions: no document, no localStorage, no changing the arrays passed in.

export function normalizeFilter(value) {
    return FILTERS.includes(value) ? value : FILTER.ALL;
}

export function filterTodos(todos, filter) {
    if (filter === FILTER.ACTIVE) return todos.filter((todo) => !todo.completed);
    if (filter === FILTER.COMPLETED) return todos.filter((todo) => todo.completed);
    return todos;
}
// Turns whatever came out of storage into a safe array of todos.
export function normalizeTodos(value) {
    return Array.isArray(value) ? value.filter(isValidTodo) : [];
}

export function normalizeFilter(value) {
    return FILTERS.includes(value) ? value : "all";
}

// id and createdAt can be passed in, which makes this easy to test.
export function addTodo(todos, text, id = Date.now(), createdAt = new Date().toISOString()) {
    const cleanText = String(text).trim();
    if (cleanText === "") return todos;
    return [...todos, { id, text: cleanText, completed: false, createdAt }];
}

export function toggleTodo(todos, id) {
    return todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
}

export function deleteTodo(todos, id) {
    return todos.filter((t) => t.id !== id);
}

// Saving an empty text deletes the todo, the same as your Week 5 edit behaviour.
export function updateTodoText(todos, id, text) {
    const cleanText = String(text).trim();
    if (cleanText === "") return deleteTodo(todos, id);
    return todos.map((t) => (t.id === id ? { ...t, text: cleanText } : t));
}

export function clearCompleted(todos) {
    return todos.filter((t) => !t.completed);
}

export function filterTodos(todos, filter) {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
}

export function countRemaining(todos) {
    return todos.filter((t) => !t.completed).length;
}
