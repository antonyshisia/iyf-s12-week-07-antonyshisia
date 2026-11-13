import { describe, it, expect } from "vitest";
import {
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodoText,
    clearCompleted,
    filterTodos,
    countRemaining,
    normalizeTodos,
    normalizeFilter,
} from "../js/todo-logic.js";

// A fresh list for every test, so one test can never affect another.
function makeTodos() {
    return [
        { id: 1, text: "Buy milk", completed: false, createdAt: "2026-11-01T08:00:00.000Z" },
        { id: 2, text: "Write report", completed: true, createdAt: "2026-11-01T09:00:00.000Z" },
        { id: 3, text: "Call Brian", completed: false, createdAt: "2026-11-01T10:00:00.000Z" },
    ];
}

describe("addTodo", () => {
    it("adds a new, not-completed todo to the end of the list", () => {
        const result = addTodo(makeTodos(), "Pay rent", 4, "2026-11-02T08:00:00.000Z");

        expect(result).toHaveLength(4);
        expect(result[3]).toEqual({
            id: 4,
            text: "Pay rent",
            completed: false,
            createdAt: "2026-11-02T08:00:00.000Z",
        });
    });

    it("trims the text", () => {
        const result = addTodo([], "   Pay rent   ", 1, "2026-11-02T08:00:00.000Z");

        expect(result[0].text).toBe("Pay rent");
    });

    it("ignores empty or whitespace-only text", () => {
        const todos = makeTodos();

        expect(addTodo(todos, "")).toBe(todos);
        expect(addTodo(todos, "     ")).toBe(todos);
    });

    it("does not change the original array", () => {
        const todos = makeTodos();
        const snapshot = structuredClone(todos);

        addTodo(todos, "Pay rent", 4, "2026-11-02T08:00:00.000Z");

        expect(todos).toEqual(snapshot);
    });
});

describe("toggleTodo", () => {
    it("flips completed from false to true and back", () => {
        const once = toggleTodo(makeTodos(), 1);
        const twice = toggleTodo(once, 1);

        expect(once[0].completed).toBe(true);
        expect(twice[0].completed).toBe(false);
    });

    it("leaves the other todos alone", () => {
        const result = toggleTodo(makeTodos(), 1);

        expect(result[1]).toEqual(makeTodos()[1]);
        expect(result[2]).toEqual(makeTodos()[2]);
    });

    it("does nothing when the id does not exist", () => {
        const result = toggleTodo(makeTodos(), 999);

        expect(result).toEqual(makeTodos());
    });

    it("does not change the original array or its objects", () => {
        const todos = makeTodos();
        const snapshot = structuredClone(todos);

        toggleTodo(todos, 1);

        expect(todos).toEqual(snapshot);
    });
});

describe("deleteTodo", () => {
    it("removes only the todo with that id", () => {
        const result = deleteTodo(makeTodos(), 2);

        expect(result.map((todo) => todo.id)).toEqual([1, 3]);
    });

    it("returns an equal list when the id does not exist", () => {
        expect(deleteTodo(makeTodos(), 999)).toEqual(makeTodos());
    });

    it("works on an empty list", () => {
        expect(deleteTodo([], 1)).toEqual([]);
    });

    it("does not change the original array", () => {
        const todos = makeTodos();

        deleteTodo(todos, 2);

        expect(todos).toHaveLength(3);
    });
});

describe("updateTodoText", () => {
    it("changes the text of one todo", () => {
        const result = updateTodoText(makeTodos(), 1, "Buy bread");

        expect(result[0].text).toBe("Buy bread");
    });

    it("deletes the todo when the new text is empty", () => {
        const result = updateTodoText(makeTodos(), 1, "   ");

        expect(result.map((todo) => todo.id)).toEqual([2, 3]);
    });
});

describe("clearCompleted", () => {
    it("keeps only the todos that are not completed", () => {
        const result = clearCompleted(makeTodos());

        expect(result.map((todo) => todo.id)).toEqual([1, 3]);
    });
});

describe("filterTodos", () => {
    it("returns everything for 'all'", () => {
        expect(filterTodos(makeTodos(), "all")).toHaveLength(3);
    });

    it("returns only open todos for 'active'", () => {
        const result = filterTodos(makeTodos(), "active");

        expect(result.map((todo) => todo.id)).toEqual([1, 3]);
    });

    it("returns only finished todos for 'completed'", () => {
        const result = filterTodos(makeTodos(), "completed");

        expect(result.map((todo) => todo.id)).toEqual([2]);
    });

    it("returns an empty list for an empty list", () => {
        expect(filterTodos([], "active")).toEqual([]);
    });

    it("does not change the original array", () => {
        const todos = makeTodos();

        filterTodos(todos, "completed");

        expect(todos).toHaveLength(3);
    });
});

describe("countRemaining", () => {
    it("counts the todos that are not completed", () => {
        expect(countRemaining(makeTodos())).toBe(2);
    });

    it("returns 0 for an empty list", () => {
        expect(countRemaining([])).toBe(0);
    });
});

describe("normalizeTodos and normalizeFilter (bad data from storage)", () => {
    it("turns anything that is not an array into an empty list", () => {
        expect(normalizeTodos(null)).toEqual([]);
        expect(normalizeTodos({})).toEqual([]);
        expect(normalizeTodos("nope")).toEqual([]);
    });

    it("drops damaged items and keeps good ones", () => {
        const mixed = [makeTodos()[0], null, { id: "x" }, 5];

        expect(normalizeTodos(mixed)).toEqual([makeTodos()[0]]);
    });

    it("falls back to 'all' for an unknown filter", () => {
        expect(normalizeFilter("archived")).toBe("all");
        expect(normalizeFilter(undefined)).toBe("all");
        expect(normalizeFilter("completed")).toBe("completed");
    });
});

describe("purity", () => {
    it("works on a frozen array, which proves nothing is being changed in place", () => {
        const frozen = Object.freeze(makeTodos().map((todo) => Object.freeze(todo)));

        expect(() => addTodo(frozen, "New", 4)).not.toThrow();
        expect(() => toggleTodo(frozen, 1)).not.toThrow();
        expect(() => deleteTodo(frozen, 1)).not.toThrow();
        expect(() => updateTodoText(frozen, 1, "Changed")).not.toThrow();
        expect(() => clearCompleted(frozen)).not.toThrow();
    });
});
