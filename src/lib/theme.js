import { useEffect, useState } from 'react';
import { readStore, writeStore } from './storage';

function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function useTheme() {
  const [theme, setTheme] = useState(() => readStore('theme', systemPrefersDark() ? 'dark' : 'light'));

  useEffect(() => {
    const dark = theme === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? '#0F1419' : '#F3F5F7');
    writeStore('theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}
