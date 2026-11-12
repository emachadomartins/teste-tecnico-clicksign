import type { ApiProject, Project, ProjectInput, ProjectQuery } from "@/types";
import { BASE_URL, request } from "./client";

export const toProject = (p: ApiProject): Project => ({
  id: p.id,
  name: p.name,
  client: p.client,
  isFavorite: p.is_favorite,
  initialDate: p.initial_date,
  finalDate: p.final_date,
  coverUrl: p.cover_url
    ? `${BASE_URL}/project/${p.id}/cover?v=${encodeURIComponent(p.updated_at)}`
    : undefined,
});

export const projectsApi = {
  async list(
    { favoritesOnly, term, sort }: ProjectQuery = {},
    init?: RequestInit,
  ) {
    const query: string[] = [];
    if (favoritesOnly) query.push("favorites_only=true");
    if (term) query.push(`term=${encodeURIComponent(term)}`);
    if (sort) query.push(`sort_by=${encodeURIComponent(sort)}`);

    const { data, metadata } = await request<ApiProject[]>(
      "/project" + (query.length > 0 ? `?${query.join("&")}` : ""),
      init,
    );
    return {
      projects: data.map(toProject),
      total: metadata?.total ?? data.length,
    };
  },
  async get(id: string, init?: RequestInit) {
    const { data } = await request<ApiProject>(`/project/${id}`, init);
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
    await request<void>(`/project/${id}/cover`, { method: "DELETE" });
  },
};
