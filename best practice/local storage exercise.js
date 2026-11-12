// Local storage basics

localStorage.setItem("username", "John");

const username = localStorage.getItem("username");
console.log(username);

if (localStorage.getItem("username") !==null) {
    console.log("User exits")
}

localStorage.removeItem("username");

console.log(localStorage.getItem("username"));

localStorage.clear();

//Exercise 2: Storing Objects(JSON)

// Task 13.1 — Exercise 2: Storing objects

const user = {
  name: "John",
  age: 30,
  hobbies: ["coding", "reading"]
};

// Wrong: JavaScript converts the object to a plain string.
localStorage.setItem("week7-user", user);
console.log(localStorage.getItem("week7-user"));
// Output: "[object Object]"

// Right: convert the object to a JSON string before saving.
localStorage.setItem("week7-user", JSON.stringify(user));

// Convert the saved JSON string back into an object.
const retrievedUser = JSON.parse(localStorage.getItem("week7-user"));
console.log(retrievedUser);

// Reusable localStorage helpers

function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getFromStorage(key, defaultValue = null) {
  const data = localStorage.getItem(key);

  if (data === null) {
    return defaultValue;
  }

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Could not read saved data:", error);
    return defaultValue;
  }
}

function removeFromStorage(key) {
  localStorage.removeItem(key);
}

// Example usage
saveToStorage("week7-settings", { theme: "dark", fontSize: 16 });

const settings = getFromStorage("week7-settings", {
  theme: "light",
  fontSize: 14
});

console.log(settings);

// Notes app

const notesForm = document.getElementById("notes-form");
const noteInput = document.getElementById("note-input");
const notesList = document.getElementById("notes-list");
const notesStatus = document.getElementById("notes-status")

let notes =getFromStorage("week7-notes", []);

if (!Array.isArray(notes)) {
    notes = [];
}

function renderNotes() {
    notesList.replaceChildren();

    if (notes.length === 0) {
        const emptyMessage =document.createElement("li");
        notesList.appendChild(emptyMessage);
        return;
    }
     notes.forEach(note => {
    const listItem = document.createElement("li");

    const noteText = document.createElement("span");
    noteText.textContent = note.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.dataset.noteId = note.id;

    listItem.append(noteText, " ", deleteButton);
    notesList.appendChild(listItem);
  });
}
notesForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const text = noteInput.value.trim();

  if (text === "") {
    notesStatus.textContent = "Please write a note first.";
    return;
  }

  const newNote = {
    id: `${Date.now()}-${Math.random()}`,
    text: text
  };

  notes.push(newNote);
  saveToStorage("week7-notes", notes);

  noteInput.value = "";
  notesStatus.textContent = "Note saved.";
  renderNotes();
});

notesList.addEventListener("click", function (event) {
  const deleteButton = event.target.closest("button[data-note-id]");

  if (!deleteButton) {
    return;
  }

  const noteId = deleteButton.dataset.noteId;
  notes = notes.filter(note => note.id !== noteId);

  saveToStorage("week7-notes", notes);
  notesStatus.textContent = "Note deleted.";
  renderNotes();
});

// Show previously saved notes when the page opens.
renderNotes();