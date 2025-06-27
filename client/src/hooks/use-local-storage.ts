import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useDrafts() {
  const [drafts, setDrafts] = useLocalStorage<Record<string, { content: string; timestamp: number }>>('reviewDrafts', {});

  const saveDraft = (reviewId: number, content: string) => {
    setDrafts(prev => ({
      ...prev,
      [reviewId]: {
        content,
        timestamp: Date.now()
      }
    }));
  };

  const getDraft = (reviewId: number) => {
    return drafts[reviewId]?.content || '';
  };

  const deleteDraft = (reviewId: number) => {
    setDrafts(prev => {
      const newDrafts = { ...prev };
      delete newDrafts[reviewId];
      return newDrafts;
    });
  };

  const hasDraft = (reviewId: number) => {
    return !!drafts[reviewId];
  };

  return {
    drafts,
    saveDraft,
    getDraft,
    deleteDraft,
    hasDraft
  };
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    theme: 'light' as 'light' | 'dark',
    autoSave: true,
    notifications: true,
    compactView: false,
    defaultResponseTemplateId: null as number | null,
  });

  const updatePreference = <K extends keyof typeof preferences>(
    key: K, 
    value: typeof preferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    preferences,
    updatePreference
  };
}
