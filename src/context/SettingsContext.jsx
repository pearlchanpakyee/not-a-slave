import { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../lib/storage';

export const DEFAULT_SETTINGS = {
  userName: 'Pearl',
  workStart: '09:00',
  workEnd: '18:00',
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorage('settings', DEFAULT_SETTINGS);

  const value = useMemo(
    () => ({
      // Merge with defaults so future settings keys never come back undefined.
      settings: { ...DEFAULT_SETTINGS, ...settings },
      updateSettings: (patch) => setSettings((prev) => ({ ...DEFAULT_SETTINGS, ...prev, ...patch })),
    }),
    [settings, setSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
