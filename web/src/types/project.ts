export type Project = {
  id: string;
  name: string;
  client: string;
  initialDate: string;
  finalDate: string;
  coverUrl?: string;
  isFavorite?: boolean;
};

export type ProjectInput = {
  name: string;
  client: string;
  initial_date: string;
  final_date: string;
  cover_url?: string;
};

export type ApiProject = ProjectInput & {
  id: string;
  is_favorite: boolean;
  updated_at: string;
};

export const SORT_OPTIONS = ["name", "initial_date", "final_date"] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

export function isSortOption(value: string | null): value is SortOption {
  return SORT_OPTIONS.includes(value as SortOption);
}

export type ProjectQuery = {
  term?: string;
  favoritesOnly?: boolean;
  sort?: SortOption;
};
