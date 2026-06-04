import { useState, useCallback } from 'react';
import type { ConversionHistoryItem } from '../types';

const STORAGE_KEY = 'currency_converter_history';
const MAX_HISTORY_ITEMS = 50; // Cap search history size

export function useHistory() {
  const [history, setHistory] = useState<ConversionHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load currency conversion history', e);
      return [];
    }
  });

  // Save history to localStorage whenever state changes
  const saveToStorage = useCallback((items: ConversionHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save currency conversion history', e);
    }
  }, []);

  // Add a history item
  const addHistoryItem = useCallback((
    from: string,
    to: string,
    amount: number,
    result: number,
    rate: number
  ) => {
    const newItem: ConversionHistoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      from,
      to,
      amount,
      result,
      rate,
      timestamp: new Date().toISOString(),
    };

    setHistory((prev) => {
      // Avoid duplicate consecutive entries of identical conversions
      if (prev.length > 0) {
        const last = prev[0];
        if (
          last.from === from &&
          last.to === to &&
          last.amount === amount &&
          Math.abs(last.result - result) < 0.0001
        ) {
          return prev;
        }
      }
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Delete a specific history item
  const deleteHistoryItem = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear currency conversion history', e);
    }
  }, []);

  return {
    history,
    addHistoryItem,
    deleteHistoryItem,
    clearHistory,
  };
}
