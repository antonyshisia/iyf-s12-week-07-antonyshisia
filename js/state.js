import { getFromStorage, saveToStorage } from "./storage.js";

const STORAGE_KEY = "todos";
const FILTER_KEY = "filter";
const VALID_FILTERS = ["all", "active", "completed"];

function createStore(initialState) {
    let state = initialState;
    const listeners = [];

    return {
        getState: () => state,

        setState(updates) {
            state = { ...state, ...updates };
            [...listeners].forEach((listener) => listener(state));
        },

        subscribe(listener) {
            listeners.push(listener);
            return () => {
                const index = listeners.indexOf(listener);
                if (index !== -1) {
                    listeners.splice(index, 1);
                }
            };
        },
    };
}

function loadTodos() {
    const saved = getFromStorage(STORAGE_KEY, []);
    if (!Array.isArray(saved)) {
        return [];
    }
    return saved.filter(
        (t) =>
            t &&
            typeof t.id === "number" &&
            typeof t.text === "string" &&
            typeof t.completed === "boolean"
    );
}

function loadFilter() {
    const saved = getFromStorage(FILTER_KEY, "all");
    return VALID_FILTERS.includes(saved) ? saved : "all";
}

export const store = createStore({ todos: loadTodos(), filter: loadFilter() });

// Persistence is just another subscriber.
store.subscribe((state) => {
    saveToStorage(STORAGE_KEY, state.todos);
    saveToStorage(FILTER_KEY, state.filter);
});

// ---------- Actions ----------
export function addTodo(text) {
    const { todos } = store.getState();
    store.setState({
        todos: [
            ...todos,
            { id: Date.now(), text, completed: false, createdAt: new Date().toISOString() },
        ],
    });
}

export function toggleTodo(id) {
    const { todos } = store.getState();
    store.setState({
        todos: todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    });
}

export function deleteTodo(id) {
    const { todos } = store.getState();
    store.setState({ todos: todos.filter((t) => t.id !== id) });
}

export function updateTodoText(id, text) {
    const { todos } = store.getState();
    store.setState({ todos: todos.map((t) => (t.id === id ? { ...t, text } : t)) });
}

export function clearCompletedTodos() {
    const { todos } = store.getState();
    store.setState({ todos: todos.filter((t) => !t.completed) });
}

export function setFilter(filter) {
    if (VALID_FILTERS.includes(filter)) {
        store.setState({ filter });
    }
}
