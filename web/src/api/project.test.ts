import { describe, expect, it } from "vitest";
import type { ApiProject } from "@/types";
import { BASE_URL } from "./client";
import { toProject } from "./project";

const apiProject: ApiProject = {
  id: "1b34f8aa-9914-4d01-a43e-2ae9f2b346e9",
  name: "Etanol Cachaça Pinga",
  client: "Cliente Teste",
  is_favorite: true,
  initial_date: "2026-11-10",
  final_date: "2026-11-30",
  updated_at: "2026-11-12T01:13:23.146622-03:00",
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

  it("monta a URL da capa com a data de atualização como versão", () => {
    const project = toProject({ ...apiProject, cover_url: "capa.png" });
    expect(project.coverUrl).toBe(
      `${BASE_URL}/project/${apiProject.id}/cover?v=2026-11-12T01%3A13%3A23.146622-03%3A00`,
    );
  });

  it("muda a URL da capa quando o projeto é atualizado", () => {
    const before = toProject({ ...apiProject, cover_url: "capa.png" });
    const after = toProject({
      ...apiProject,
      cover_url: "capa.png",
      updated_at: "2026-11-12T02:00:00-03:00",
    });
    expect(after.coverUrl).not.toBe(before.coverUrl);
  });

  it("deixa o coverUrl indefinido quando não há capa", () => {
    expect(
      toProject({ ...apiProject, cover_url: "" }).coverUrl,
    ).toBeUndefined();
  });
});
