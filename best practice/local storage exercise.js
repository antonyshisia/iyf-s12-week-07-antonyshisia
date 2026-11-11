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
