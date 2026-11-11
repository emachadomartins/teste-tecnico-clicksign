import type { Project } from "../types/project";
import { BASE_URL, request } from "./client";

type ApiProject = {
  id: string;
  name: string;
  client: string;
  is_favorite: boolean;
  initial_date: string;
  final_date: string;
  cover_url?: string;
};

const toProject = (p: ApiProject): Project => ({
  id: p.id,
  name: p.name,
  client: p.client,
  isFavorite: p.is_favorite,
  initialDate: p.initial_date,
  finalDate: p.final_date,
  coverUrl: p.cover_url
    ? `${BASE_URL}/project/${p.id}/cover?v=${encodeURIComponent(p.cover_url)}`
    : undefined,
});

export type ProjectInput = {
  name: string;
  client: string;
  initial_date: string;
  final_date: string;
  cover_url?: string;
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

  async delete(id: string) {
    await request<void>(`/project/${id}`, {
      method: "DELETE",
    });
  },

  async setFavorite(id: string, isFavorite: boolean) {
    const { data } = await request<ApiProject>(`/project/${id}/favorite`, {
      method: "PATCH",
      body: JSON.stringify({ is_favorite: isFavorite }),
    });
    return toProject(data);
  },

  async uploadCover(id: string, file: File) {
    const body = new FormData();
    body.append("cover", file);
    const { data } = await request<ApiProject>(`/project/${id}/cover`, {
      method: "POST",
      body,
    });
    return toProject(data);
  },

  async removeCover(id: string) {
    const { data } = await request<ApiProject>(`/project/${id}/cover`, {
      method: "DELETE",
    });
    return toProject(data);
  },
};
