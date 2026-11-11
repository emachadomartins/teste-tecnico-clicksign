import type { Project } from "../../types/project";

export type ProjectCardProps = {
  project: Project;
  onFavorite: (project: Project) => void;
  onDelete: (project: Project) => void;
};
