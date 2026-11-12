import { useEffect, useState } from "react";
import { projectsApi } from "@/api";
import type { Project, SortOption } from "@/types";

type ProjectFilters = {
  favoritesOnly: boolean;
  sort: SortOption;
  term?: string;
};

export function useProjects({ favoritesOnly, sort, term }: ProjectFilters) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [reloadCount, setReloadCount] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  const queryKey = [favoritesOnly, sort, term, reloadCount].join("|");

  useEffect(() => {
    const controller = new AbortController();
    const init = { signal: controller.signal };

    const filtered = projectsApi.list({ favoritesOnly, sort, term }, init);
    const all = favoritesOnly ? projectsApi.list({}, init) : filtered;

    Promise.all([filtered, all])
      .then(([filteredResult, allResult]) => {
        setProjects(filteredResult.projects);
        setTotal(allResult.total);
        setLoadError(false);
        setLoadedKey(queryKey);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setLoadError(true);
        setLoadedKey(queryKey);
      });

    return () => controller.abort();
  }, [favoritesOnly, sort, term, queryKey]);

  const reload = () => setReloadCount((prev) => prev + 1);

  const toggleFavorite = async (project: Project) => {
    const isFavorite = !project.isFavorite;

    const setFavorite = (value: boolean) =>
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, isFavorite: value } : p,
        ),
      );

    setFavorite(isFavorite);
    try {
      await projectsApi.setFavorite(project.id, isFavorite);
    } catch {
      setFavorite(!isFavorite);
    }
  };

  const removeProject = async (id: string) => {
    await projectsApi.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTotal((prev) => prev - 1);
  };

  return {
    projects,
    total,
    isFirstLoad: loadedKey === null,
    isLoading: loadedKey !== queryKey,
    loadError,
    reload,
    toggleFavorite,
    removeProject,
  };
}
