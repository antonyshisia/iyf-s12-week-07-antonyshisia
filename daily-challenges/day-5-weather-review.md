# Weather Dashboard: code review (Week 7, Day 5)

Files reviewed: `index.html`, `app.js`, `styles.css`, `config.example.js`, `README.md`.
Not reviewed (not uploaded): `.gitignore` and `.github/workflows/deploy.yml`.

## Summary

The happy path works and the foundations are good: `response.ok` is checked, loading and error states exist, everything from the API goes into the page with `textContent`, the API key stays out of Git, and the README explains setup and deployment honestly. The weak spots are the cases around the happy path: unexpected data, slow or overlapping requests, and storage failures.

## 1. Does it handle all error cases?

| Case | Handled? | Notes |
|---|---|---|
| City not found (404) | Yes | `fetchWeather` throws "City not found" |
| Invalid API key (401) | Yes | Clear message |
| `config.js` missing or key empty | Yes | `getWeather` checks `typeof API_KEY` and `!API_KEY` |
| No internet | Partly | `fetch` rejects with a `TypeError`, shown as "Network error". But **any** `TypeError` inside the `try` gets the same message, including a bug in `displayWeather` |
| Empty input | Yes | The `required` attribute blocks it |
| Whitespace-only input | Partly | `if (city)` silently does nothing, with no message |
| Rate limit (429) or server error (5xx) | Partly | Falls into the generic "Failed to fetch weather data" |
| Slow or hanging request | No | No timeout, so "Loading..." can stay forever |
| Response is not JSON | Partly | `response.json()` throws a `SyntaxError` and the user sees a technical message |
| Unexpected response shape | No | `displayWeather` assumes `data.weather[0]`, `data.sys.country` and `data.wind.speed` exist |
| Several searches in a row | No | Responses can arrive out of order, and the older one can overwrite the newer. The first `finally` hides "Loading..." while the second request is still running. The Search button is not disabled |
| localStorage full or blocked | Partly | `loadRecent` has `try/catch`, but `saveToHistory` does not. It runs inside `getWeather`'s `try`, so a storage failure would show an error even though the weather loaded |
| Damaged saved history | Partly | Invalid JSON is handled. Valid JSON of the wrong shape (for example `{}`) makes `recent.filter` crash |

## 2. Is the code well organised?

**Good:** one function per job (`fetchWeather`, `getWeather`, `displayWeather`, `saveToHistory`, `renderHistory`), event delegation on the history list, and the HTML and CSS are separate and tidy.

**To improve:**
- Everything is in one 190-line `app.js`. It mixes API calls, state, storage and DOM code. The To-Do List split (`api.js`, `storage.js`, `ui.js`, `app.js`) would suit this project.
- `saveToHistory` adds a person's city to a global `recent` variable that is declared further down the file. It works, but the order is confusing.
- A stray `renderHistory();` call sits between two event listeners instead of in a "start the app" section.
- Magic values: `404`, `401`, `"recent"`, `"metric"`, `"°C"`, `"m/s"` and `"hPa"` should be named constants.
- `displayWeather` builds text and writes to the DOM in the same function. The formatting could be a pure function that can be unit tested.

## 3. Can another developer understand it?

**Good:** the README covers local setup, deployment and the key-visibility warning. Function names are clear, and the section comments explain the flow.

**To improve:**
- The header comments are classroom instructions ("GIVEN", "YOU WRITE", "Season 11"). A new reader needs comments about what the code does and why.
- The README does not say how to run lint or tests (there are none yet) and has no screenshot.
- `index.html` loads `config.js` first. If it is missing, the browser logs a 404, and the README should mention that this is expected before setup.

## 4. Security

- The key is not committed: `config.js` is git-ignored and the README says so. To confirm, run `git ls-files | grep config.js` (should print nothing) and `git log -p | grep -i appid` (should show only `${API_KEY}`).
- A front-end key is visible to visitors. The README says this honestly. Restrict the key in the OpenWeather dashboard if the option exists.
- Good: `textContent` is used for every value from the API and the user, never `innerHTML` with outside data.

## 5. Lint and format

- ESLint reports `API_KEY` as undefined (`no-undef`), because it is defined in another file. Add `/* global API_KEY */` at the top of `app.js`.
- `catch (err)` in `loadRecent` never uses `err`, which ESLint 9 warns about. Use `catch {`.
- Run `npm run format` (for example `recent =[` needs a space).

## Improvements needed (highest priority first)

1. **`getWeather`: separate network errors from code bugs.** `err.name === "TypeError"` also matches bugs in `displayWeather`. Catch the `fetch` failure inside `fetchWeather` and throw a clear "Network error" message there.
2. **`displayWeather`: validate the response.** Check `data.weather?.[0]` and `data.main` before using them, and show "Unexpected response" instead of crashing. Make `sys.country` optional.
3. **`getWeather`: stop out-of-order results.** Add a request counter, and ignore results from older requests. Disable the Search button while loading.
4. **`saveToHistory` and `loadRecent`: protect storage.** Wrap `setItem` in `try/catch`, and make `loadRecent` accept only an array of strings.
5. **`fetchWeather`: add a timeout** with `AbortController`, and handle 429 with its own message.
6. **Submit handler: keep the input until the search succeeds.** Right now `cityInput.value = ""` runs before the result, so after "City not found" the user must retype. Also show a message for whitespace-only input.
7. **Split `app.js` into modules** (`api.js`, `storage.js`, `ui.js`) and name the magic values.
8. **Add tests** for a pure `addToRecent(recent, city)` function (newest first, no duplicates ignoring case, maximum 5).
9. **Accessibility:** give the history buttons an `aria-label` such as "Search again for Nairobi".
10. **Comments and README:** replace classroom comments with explanations of why, and add a screenshot and troubleshooting notes (invalid key takes time to activate, `config.js` missing).