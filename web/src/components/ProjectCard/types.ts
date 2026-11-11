export type Project = {
  id: number;
  name: string;
  client: string;
  startDate: string;
  endDate: string;
  coverUrl?: string;
  isFavorited?: boolean;
};

export type ProjectCardProps = {
  project: Project;
  onToggleFavorite: (project: Project) => void;
  onMenuOpen: (project: Project) => void;
  onMenuClose: () => void;
};
