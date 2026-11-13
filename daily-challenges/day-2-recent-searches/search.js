const HISTORY_KEY = "recent-searches";
const MAX_SEARCHES = 5;

const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const historyList = document.getElementById("history-list");
const result = document.getElementById("result");

// ---------- Pure helper: newest first, no duplicates, last 5 only ----------
function addSearch(searches, term) {
    const withoutDuplicate = searches.filter((item) => item.toLowerCase() !== term.toLowerCase());
    return [term, ...withoutDuplicate].slice(0, MAX_SEARCHES);
}

// ---------- Storage ----------
function loadSearches() {
    try {
        const saved = JSON.parse(localStorage.getItem(HISTORY_KEY));
        if (!Array.isArray(saved)) {
            return [];
        }
        return saved.filter((item) => typeof item === "string").slice(0, MAX_SEARCHES);
    } catch (error) {
        console.error("Could not read searches:", error);
        return [];
    }
}

function saveSearches(searches) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(searches));
    } catch (error) {
        console.error("Could not save searches:", error);
    }
}

let recentSearches = loadSearches();

// ---------- Drawing the dropdown ----------
function renderHistory() {
    historyList.replaceChildren();

    recentSearches.forEach((term) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.term = term;
        button.textContent = term;
        item.appendChild(button);
        historyList.appendChild(item);
    });
}

function showHistory() {
    historyList.hidden = recentSearches.length === 0;
}

function hideHistory() {
    historyList.hidden = true;
}

// ---------- Searching ----------
function runSearch(term) {
    const cleanTerm = term.trim();
    if (cleanTerm === "") {
        return;
    }

    recentSearches = addSearch(recentSearches, cleanTerm);
    saveSearches(recentSearches);

    input.value = cleanTerm;
    result.textContent = `Showing results for "${cleanTerm}"`;
    renderHistory();
    hideHistory();
}

// ---------- Events ----------
form.addEventListener("submit", (event) => {
    event.preventDefault();
    runSearch(input.value);
});

input.addEventListener("focus", showHistory);
input.addEventListener("click", showHistory);
input.addEventListener("blur", hideHistory);

// Without this, clicking a history item makes the input lose focus first. The list
// would hide before the click lands. preventDefault on mousedown keeps the focus.
historyList.addEventListener("mousedown", (event) => event.preventDefault());

historyList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-term]");
    if (button) {
        runSearch(button.dataset.term);
    }
});

renderHistory();
