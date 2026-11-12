import { useState } from "react";

const STORAGE_KEY = "gerenciador-de-projetos-search-history";
const MAX_ITEMS = 5;
export const MIN_SEARCH_LENGTH = 3;

function readHistory(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(readHistory);

  const addSearch = (term: string) => {
    const trimmed = term.trim();
    if (trimmed.length < MIN_SEARCH_LENGTH) return;

    setHistory((prev) => {
      const next = [
        trimmed,
        ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, MAX_ITEMS);

      saveHistory(next);
      return next;
    });
  };

  const removeSearch = (term: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item !== term);
      saveHistory(next);
      return next;
    });
  };

  return { history, addSearch, removeSearch };
}
