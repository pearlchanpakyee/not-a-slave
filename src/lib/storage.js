import { useCallback, useEffect, useState } from 'react';

// All app data lives in localStorage under this prefix (zero backend, 100% private).
const PREFIX = 'nas:';

export function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false; // storage full or blocked (e.g. private mode)
  }
}

// useState that persists to localStorage. Supports functional updates.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStore(key, initialValue));

  useEffect(() => {
    writeStore(key, value);
  }, [key, value]);

  const set = useCallback((next) => {
    setValue((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  return [value, set];
}
