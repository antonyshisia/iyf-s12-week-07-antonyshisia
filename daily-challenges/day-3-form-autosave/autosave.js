const DRAFT_KEY = "contact-draft";
const AUTO_SAVE_INTERVAL_MS = 5000;

const form = document.getElementById("contact-form");
const statusMessage = document.getElementById("status-message");

let lastSavedJson = "";

function readForm() {
    return Object.fromEntries(new FormData(form));
}

function isEmptyDraft(draft) {
    return Object.values(draft).every((value) => String(value).trim() === "");
}

function saveDraft() {
    const draft = readForm();
    const json = JSON.stringify(draft);

    if (json === lastSavedJson) {
        return; // nothing changed since the last save
    }
    lastSavedJson = json;

    try {
        if (isEmptyDraft(draft)) {
            localStorage.removeItem(DRAFT_KEY);
            statusMessage.textContent = "";
        } else {
            localStorage.setItem(DRAFT_KEY, json);
            statusMessage.textContent = `Draft saved at ${new Date().toLocaleTimeString()}`;
        }
    } catch (error) {
        console.error("Could not save draft:", error);
    }
}

function restoreDraft() {
    let draft;
    try {
        draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
    } catch (error) {
        console.error("Could not read draft:", error);
        return;
    }

    if (draft === null || typeof draft !== "object" || Array.isArray(draft)) {
        return;
    }

    Object.entries(draft).forEach(([fieldName, value]) => {
        const field = form.elements[fieldName];
        if (field && typeof value === "string") {
            field.value = value;
        }
    });

    lastSavedJson = JSON.stringify(readForm());
    statusMessage.textContent = "Draft restored.";
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    localStorage.removeItem(DRAFT_KEY);
    form.reset();
    lastSavedJson = JSON.stringify(readForm());
    statusMessage.textContent = "Sent! Saved draft cleared.";
});

restoreDraft();
setInterval(saveDraft, AUTO_SAVE_INTERVAL_MS);
