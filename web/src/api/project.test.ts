import { describe, expect, it } from "vitest";
import type { ApiProject } from "../types/project";
import { BASE_URL } from "./client";
import { toProject } from "./project";

const apiProject: ApiProject = {
  id: "1b34f8aa-9914-4d01-a43e-2ae9f2b346e9",
  name: "Etanol Cachaça Pinga",
  client: "Cliente Teste",
  is_favorite: true,
  initial_date: "2026-11-10",
  final_date: "2026-11-30",
};

describe("toProject", () => {
  it("converte os campos de snake_case para camelCase", () => {
    expect(toProject(apiProject)).toEqual({
      id: apiProject.id,
      name: "Etanol Cachaça Pinga",
      client: "Cliente Teste",
      isFavorite: true,
      initialDate: "2026-11-10",
      finalDate: "2026-11-30",
      coverUrl: undefined,
    });
  });

  it("monta a URL da capa com o nome do arquivo como versão", () => {
    const project = toProject({ ...apiProject, cover_url: "capa.png" });
    expect(project.coverUrl).toBe(
      `${BASE_URL}/project/${apiProject.id}/cover?v=capa.png`,
    );
  });

  it("codifica o nome do arquivo na URL da capa", () => {
    const project = toProject({ ...apiProject, cover_url: "minha capa&1.png" });
    expect(project.coverUrl).toBe(
      `${BASE_URL}/project/${apiProject.id}/cover?v=minha%20capa%261.png`,
    );
  });

  it("deixa o coverUrl indefinido quando não há capa", () => {
    expect(toProject({ ...apiProject, cover_url: "" }).coverUrl).toBeUndefined();
  });
});
