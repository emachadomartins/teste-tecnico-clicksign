import type { Project } from "../types/project";
import { request } from "./client";

type ApiProject = {
  id: string;
  name: string;
  client: string;
  is_favorite: boolean;
  initial_date: string;
  final_date: string;
};

const toProject = (p: ApiProject): Project => ({
  id: p.id,
  name: p.name,
  client: p.client,
  isFavorite: p.is_favorite,
  initialDate: p.initial_date,
  finalDate: p.final_date,
});

export type ProjectInput = {
  name: string;
  client: string;
  initial_date: string;
  final_date: string;
};

export const projectsApi = {
  async list() {
    const { data, metadata } = await request<ApiProject[]>("/project");
    return {
      projects: data.map(toProject),
      total: metadata?.total ?? data.length,
    };
  },
  async get(id: string) {
    const { data } = await request<ApiProject>(`/project/${id}`);
    return toProject(data);
  },
  async create(input: ProjectInput) {
    const { data } = await request<ApiProject>("/project", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return toProject(data);
  },

  async update(id: string, input: ProjectInput) {
    const { data } = await request<ApiProject>(`/project/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return toProject(data);
  },
};
