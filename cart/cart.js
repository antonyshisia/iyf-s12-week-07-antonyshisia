// ---------- Storage helpers (from Task 13.1) ----------

const STORAGE_KEY = "cart"; // different from the to-do key "todos"
const MAX_UNDO_STEPS = 20;
const PRICE_LOCALE = "en-KE";

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Could not save data:", error);
    }
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

// ---------- State ----------

const state = {
    products: [
        { id: 1, name: "Mandazi (pack of 6)", price: 120, image: "🍩" },
        { id: 2, name: "Chapati (pack of 5)", price: 150, image: "🫓" },
        { id: 3, name: "Tea leaves 250g", price: 180, image: "🍵" },
    ],
    cart: [], // { productId, quantity }: only the cart is saved
};

const history = []; // earlier copies of the cart, for Undo

function loadCart() {
    const saved = getFromStorage(STORAGE_KEY, []);
    if (!Array.isArray(saved)) {
        return [];
    }

    // Keep only valid items for products that still exist.
    return saved.filter(
        (item) =>
            item &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            state.products.some((product) => product.id === item.productId)
    );
}

state.cart = loadCart();

// ---------- The one place that changes the cart ----------

function commitCart(newCart) {
    history.push(state.cart);
    if (history.length > MAX_UNDO_STEPS) {
        history.shift();
    }
    state.cart = newCart;
    saveToStorage(STORAGE_KEY, state.cart);
    render();
}

// ---------- Actions ----------

function addToCart(productId) {
    const existing = state.cart.find((item) => item.productId === productId);

    if (existing) {
        commitCart(
            state.cart.map((item) =>
                item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    } else {
        commitCart([...state.cart, { productId, quantity: 1 }]);
    }
}

function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    commitCart(
        state.cart.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
}

function removeFromCart(productId) {
    commitCart(state.cart.filter((item) => item.productId !== productId));
}

function clearCart() {
    if (state.cart.length === 0) {
        return;
    }
    commitCart([]);
}

function undo() {
    if (history.length === 0) {
        return;
    }
    state.cart = history.pop();
    saveToStorage(STORAGE_KEY, state.cart);
    render();
}

// ---------- Calculated values (never stored) ----------

function getProduct(productId) {
    return state.products.find((product) => product.id === productId);
}

function getCartTotal() {
    return state.cart.reduce((total, item) => {
        const product = getProduct(item.productId);
        return product ? total + product.price * item.quantity : total;
    }, 0);
}

function getCartCount() {
    return state.cart.reduce((count, item) => count + item.quantity, 0);
}

function formatPrice(amount) {
    return "KSh " + amount.toLocaleString(PRICE_LOCALE);
}

// ---------- Drawing the page ----------

const productList = document.getElementById("product-list");
const cartList = document.getElementById("cart-list");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const emptyMessage = document.getElementById("empty-message");
const undoButton = document.getElementById("undo-button");
const clearButton = document.getElementById("clear-button");

function renderProducts() {
    productList.replaceChildren();

    state.products.forEach((product) => {
        const li = document.createElement("li");

        const image = document.createElement("span");
        image.className = "image";
        image.textContent = product.image;
        image.setAttribute("aria-hidden", "true");

        const info = document.createElement("div");
        info.className = "info";
        const name = document.createElement("div");
        name.textContent = product.name;
        const price = document.createElement("div");
        price.className = "price";
        price.textContent = formatPrice(product.price);
        info.append(name, price);

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "primary";
        addButton.dataset.action = "add";
        addButton.dataset.productId = String(product.id);
        addButton.textContent = "Add to Cart";

        li.append(image, info, addButton);
        productList.appendChild(li);
    });
}

function renderCart() {
    cartList.replaceChildren();

    state.cart.forEach((item) => {
        const product = getProduct(item.productId);
        if (!product) {
            return;
        }

        const li = document.createElement("li");

        const info = document.createElement("div");
        info.className = "info";
        const name = document.createElement("div");
        name.textContent = `${product.image} ${product.name}`;
        const lineTotal = document.createElement("div");
        lineTotal.className = "price";
        lineTotal.textContent = `${formatPrice(product.price)} × ${item.quantity} = ${formatPrice(product.price * item.quantity)}`;
        info.append(name, lineTotal);

        const minus = document.createElement("button");
        minus.type = "button";
        minus.dataset.action = "decrease";
        minus.dataset.productId = String(item.productId);
        minus.textContent = "−";
        minus.setAttribute("aria-label", "Decrease quantity of " + product.name);

        const quantity = document.createElement("span");
        quantity.className = "quantity";
        quantity.textContent = String(item.quantity);

        const plus = document.createElement("button");
        plus.type = "button";
        plus.dataset.action = "increase";
        plus.dataset.productId = String(item.productId);
        plus.textContent = "+";
        plus.setAttribute("aria-label", "Increase quantity of " + product.name);

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "danger";
        remove.dataset.action = "remove";
        remove.dataset.productId = String(item.productId);
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", "Remove " + product.name);

        li.append(info, minus, quantity, plus, remove);
        cartList.appendChild(li);
    });

    cartCount.textContent = String(getCartCount());
    cartTotal.textContent = formatPrice(getCartTotal());
    emptyMessage.hidden = state.cart.length > 0;
    clearButton.disabled = state.cart.length === 0;
    undoButton.disabled = history.length === 0;
}

function render() {
    renderCart(); // products never change, so they're drawn once at startup
}

// ---------- Events (one listener per list) ----------

productList.addEventListener("click", (event) => {
    const button = event.target.closest('[data-action="add"]');
    if (!button) {
        return;
    }
    addToCart(Number(button.dataset.productId));
});

cartList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
        return;
    }

    const productId = Number(button.dataset.productId);
    const item = state.cart.find((cartItem) => cartItem.productId === productId);
    if (!item) {
        return;
    }

    if (button.dataset.action === "increase") {
        updateQuantity(productId, item.quantity + 1);
    }
    if (button.dataset.action === "decrease") {
        updateQuantity(productId, item.quantity - 1);
    }
    if (button.dataset.action === "remove") {
        removeFromCart(productId);
    }
});

clearButton.addEventListener("click", clearCart);
undoButton.addEventListener("click", undo);

// ---------- Start ----------

renderProducts();
render();
