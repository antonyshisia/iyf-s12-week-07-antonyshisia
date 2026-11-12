export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Could not save data:", error);
  }
}

export function getFromStorage(key, defaultValue = null) {
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

export function removeFromStorage(key) {
  localStorage.removeItem(key);
}