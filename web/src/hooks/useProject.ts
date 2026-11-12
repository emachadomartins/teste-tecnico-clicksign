import { useEffect, useState } from "react";
import { ApiError, projectsApi } from "@/api";
import type { Project } from "@/types";

export type ProjectLoadError = "not-found" | "failed";

type LoadResult = {
  id: string;
  project: Project | null;
  error: ProjectLoadError | null;
};

export function useProject(id?: string) {
  const [result, setResult] = useState<LoadResult | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    projectsApi
      .get(id, { signal: controller.signal })
      .then((project) => setResult({ id, project, error: null }))
      .catch((err) => {
        if (controller.signal.aborted) return;
        setResult({
          id,
          project: null,
          error:
            err instanceof ApiError && err.status === 404
              ? "not-found"
              : "failed",
        });
      });

    return () => controller.abort();
  }, [id]);

  const current = result?.id === id ? result : null;

  return {
    project: current?.project ?? null,
    error: current?.error ?? null,
    isLoading: Boolean(id) && current === null,
  };
}
