export type Project = {
  name: string;
  client: string;
  startDate: string;
  endDate: string;
  coverUrl?: string;
  isFavorited?: boolean;
};

export type ProjectCardProps = {
  project: Project;
};
