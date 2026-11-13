// ============================================
// Lesson 9 DOM practice, refactored for Week 7 Day 4.
// Same behaviour as before.js. Changes: error handling, named selectors,
// helper functions, clearer names.
// Use with dom-practice.html: <script src="after.js"></script>
// ============================================

// Every selector lives here once. A typo now has a single place to fix.
const SELECTOR = {
    pageHeading: "h1",
    header: "header",
    nav: "nav",
    navList: ".nav-list",
    navItem: ".nav-list li",
    navLink: ".nav-link",
    article: "article",
    articleParagraph: "article .content",
    content: ".content",
    footer: "footer",
};

// ---------- Helpers ----------

// Finds one element, or throws an error that says exactly what was missing.
function requireElement(selector, root = document) {
    const element = root.querySelector(selector);
    if (element === null) {
        throw new Error(`Element not found: "${selector}"`);
    }
    return element;
}

function requireElementById(id) {
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error(`Element not found: #${id}`);
    }
    return element;
}

// Logs a value with a label, so the Console is readable.
function show(label, value) {
    console.log(`${label}:`, value);
}

// Runs one step. If it fails, the error is reported and the next step still runs.
function runStep(stepName, stepFunction) {
    console.group(stepName);
    try {
        stepFunction();
    } catch (error) {
        console.error(`${stepName} failed:`, error.message);
    }
    console.groupEnd();
}

// ---------- Task 9.1: select elements ----------
function selectElements() {
    show("h1", requireElement(SELECTOR.pageHeading));

    // The two legacy methods return LIVE collections: they update when the page changes.
    // querySelectorAll returns a static snapshot.
    show("by class (live)", document.getElementsByClassName("content"));
    show("by tag (live)", document.getElementsByTagName("p"));
    show(".content (static)", document.querySelectorAll(SELECTOR.content));

    show("contact form", requireElementById("contact-form"));
    show("email input", requireElement("#contact-form input[type='email']"));

    const navItems = document.querySelectorAll(SELECTOR.navItem);
    show("nav items", navItems);
    show("first nav link", requireElement(SELECTOR.navLink));
    show("last paragraph in article", requireElement("article p:last-of-type"));

    show("submit button", requireElement("button[type='submit']"));
    show("h2 headings in main", document.querySelectorAll("main h2"));
    show("footer", requireElement(SELECTOR.footer));

    show("missing element returns", document.querySelector(".does-not-exist")); // null
    show(
        "nav item texts",
        [...navItems].map((navItem) => navItem.textContent)
    );
}

// ---------- Task 9.2: traverse ----------
function traverseElements() {
    const header = requireElement(SELECTOR.header);
    show("nav inside header", requireElement(SELECTOR.nav, header));

    const firstNavLink = requireElement(SELECTOR.navLink);
    show("parent li of first link", firstNavLink.parentElement);
    show("header via closest()", firstNavLink.closest(SELECTOR.header));

    const article = requireElement(SELECTOR.article);
    show("element after article", article.nextElementSibling); // should be a section

    show("children of nav list", requireElement(SELECTOR.navList).children);
    show("parent of footer", requireElement(SELECTOR.footer).parentElement); // the body
}

// ---------- Task 9.3: change things ----------
function changeElements() {
    requireElement(SELECTOR.pageHeading).textContent = "My DOM Practice";

    const firstNavLink = requireElement(SELECTOR.navLink);
    firstNavLink.href = "https://developer.mozilla.org";
    firstNavLink.target = "_blank";
    // noopener stops the new tab from reaching back into this page through window.opener.
    firstNavLink.rel = "noopener";

    const article = requireElement(SELECTOR.article);
    show("data-id", article.dataset.id); // "42"
    show("data-category", article.dataset.category); // "tech"
    article.dataset.status = "reviewed";

    // ?. means "only if it exists", so a missing paragraph doesn't crash the step.
    const [firstParagraph, secondParagraph] = document.querySelectorAll(SELECTOR.content);
    firstParagraph?.classList.add("highlight");
    secondParagraph?.classList.toggle("accent");

    // Injection demo. The innerHTML line is UNSAFE ON PURPOSE: it runs the onerror
    // handler and shows an alert. textContent shows the same text as plain text.
    const userInput = `<img src="x" onerror="alert('hacked!')">`;
    requireElementById("unsafe").innerHTML = userInput;
    requireElementById("safe").textContent = userInput;
    // For a user's comment I would use textContent: it never runs the input as code.
}

// ---------- Task 9.4: create, remove, clone ----------
function addNavItem(text, href) {
    const navList = requireElement(SELECTOR.navList);

    const item = document.createElement("li");
    const link = document.createElement("a");
    link.className = "nav-link";
    link.href = href;
    link.textContent = text;

    item.appendChild(link);
    navList.appendChild(item);
}

function createAndRemoveElements() {
    addNavItem("Blog", "#blog");
    addNavItem("Portfolio", "#portfolio");

    // before() throws a clear error if the paragraph is missing. insertBefore(x, null)
    // would just append at the end and hide the problem.
    const insertedParagraph = document.createElement("p");
    insertedParagraph.textContent = "This paragraph was inserted before the first one.";
    insertedParagraph.className = "content highlight";
    requireElement(SELECTOR.articleParagraph).before(insertedParagraph);

    const navList = requireElement(SELECTOR.navList);
    const clonedItem = requireElement("li", navList).cloneNode(true); // true = deep copy
    requireElement("a", clonedItem).textContent = "Cloned";
    navList.prepend(clonedItem);

    requireElement(SELECTOR.footer).remove();
    navList.lastElementChild?.remove(); // the "Portfolio" item
    requireElement(SELECTOR.article).replaceChildren(); // remove all children
}

// ---------- Run everything ----------
runStep("Step 1: select elements", selectElements);
runStep("Step 2: traverse", traverseElements);
runStep("Step 3: change", changeElements);
runStep("Step 4: create and remove", createAndRemoveElements);
