import { getFromStorage, saveToStorage } from "./storage.js";
import * as logic from "./todo-logic.js";

const TODOS_KEY = "todos";
const FILTER_KEY = "filter";

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
        if (index !== -1) listeners.splice(index, 1);
      };
    },
  };
}

// Load ONCE, when the app starts.
export const store = createStore({
  todos: logic.normalizeTodos(getFromStorage(TODOS_KEY, [])),
  filter: logic.normalizeFilter(getFromStorage(FILTER_KEY, "all")),
});

// Saving is just another subscriber.
store.subscribe((state) => {
  saveToStorage(TODOS_KEY, state.todos);
  saveToStorage(FILTER_KEY, state.filter);
});

// Run a pure function on the todos and store the result.
function updateTodos(change) {
  const { todos } = store.getState();
  const next = change(todos);
  if (next !== todos) store.setState({ todos: next });
}

// ---------- Actions ----------
export const addTodo = (text) => updateTodos((todos) => logic.addTodo(todos, text));
export const toggleTodo = (id) => updateTodos((todos) => logic.toggleTodo(todos, id));
export const deleteTodo = (id) => updateTodos((todos) => logic.deleteTodo(todos, id));
export const updateTodoText = (id, text) =>
  updateTodos((todos) => logic.updateTodoText(todos, id, text));
export const clearCompletedTodos = () => updateTodos(logic.clearCompleted);

export function setFilter(filter) {
  store.setState({ filter: logic.normalizeFilter(filter) });
}