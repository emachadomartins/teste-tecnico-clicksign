import type { Project } from "../../types/project";

export type ProjectCardProps = {
  project: Project;
  onToggleFavorite: (project: Project) => void;
  onMenuOpen: (project: Project) => void;
  onMenuClose: () => void;
};
