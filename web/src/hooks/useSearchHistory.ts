import { useState } from "react";

const STORAGE_KEY = "gerenciador-de-projetos-search-history";
const MAX_ITEMS = 5;

function readHistory(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(readHistory);

  const addSearch = (term: string) => {
    const trimmed = term.trim();
    if (trimmed.length < 3) return;

    setHistory((prev) => {
      const next = [
        trimmed,
        ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
      ].slice(0, MAX_ITEMS);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return { history, addSearch };
}
