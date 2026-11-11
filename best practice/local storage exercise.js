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