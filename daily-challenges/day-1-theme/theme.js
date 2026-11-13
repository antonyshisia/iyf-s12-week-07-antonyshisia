const THEME_KEY = "theme";
const THEME = { LIGHT: "light", DARK: "dark" };

const toggleButton = document.getElementById("theme-toggle");

function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === THEME.LIGHT || saved === THEME.DARK) {
        return saved;
    }
    // Nothing saved yet: follow the computer's setting.
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? THEME.DARK : THEME.LIGHT;
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const isDark = theme === THEME.DARK;
    toggleButton.setAttribute("aria-pressed", String(isDark));
    toggleButton.textContent = isDark ? "Switch to light mode" : "Switch to dark mode";
}

function saveTheme(theme) {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
        console.error("Could not save theme:", error);
    }
}

toggleButton.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme;
    const next = current === THEME.DARK ? THEME.LIGHT : THEME.DARK;
    applyTheme(next);
    saveTheme(next);
});

applyTheme(getInitialTheme()); // applies on page load
