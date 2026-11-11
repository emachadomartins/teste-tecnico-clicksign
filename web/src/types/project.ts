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
};

export type ProjectQuery = {
  term?: string;
  favoritesOnly?: boolean;
  sort?: keyof ApiProject;
};
