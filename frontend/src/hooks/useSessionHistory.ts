import { useCallback, useState } from 'react';
import type { SessionHistoryItem } from '../types/prediction';

const STORAGE_KEY = 'seoul_temp_session_history_v1';
const MAX_HISTORY_ITEMS = 5;

function readStoredHistory(): SessionHistoryItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SessionHistoryItem[]).slice(0, MAX_HISTORY_ITEMS) : [];
  } catch {
    return [];
  }
}

function writeStoredHistory(items: SessionHistoryItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Abaikan jika storage penuh atau diblokir oleh mode privat browser.
  }
}

/** Hook persistensi 5 riwayat prediksi sesi terakhir di localStorage. */
export function useSessionHistory() {
  const [history, setHistory] = useState<SessionHistoryItem[]>(() => readStoredHistory());

  const addEntry = useCallback((entry: Omit<SessionHistoryItem, 'id' | 'timestamp'>) => {
    const nextItem: SessionHistoryItem = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    setHistory((prev) => {
      const updated = [nextItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      writeStoredHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    writeStoredHistory([]);
  }, []);

  return {
    history,
    addEntry,
    clearHistory,
  };
}
