import { PlusCircle } from "lucide-react";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { projectsApi } from "../../api/project";
import { Button } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Icon } from "../../components/Icon";
import { ProjectCard } from "../../components/ProjectCard";
import { ProjectEmpty } from "../../components/ProjectEmpty";
import type { Project, ProjectInput } from "../../types/project";
import "./styles.css";

const sortOptions: Partial<Record<keyof ProjectInput, string>> = {
  name: "Ordem alfabética",
  initial_date: "Iniciados mais recentes",
  final_date: "Prazo mais próximo",
};

export const ProjectList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [openedFilter, setOpenedFilter] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const term = searchParams.get("term") || undefined;
  const favoritesOnly = searchParams.get("favorites_only") === "true";
  const sort = (searchParams.get("sort_by") as keyof ProjectInput) || "name";

  useEffect(() => {
    projectsApi.list({ favoritesOnly, sort, term }).then(({ projects }) => {
      setProjectList(projects);
    });
  }, [favoritesOnly, sort, term]);

  const isEmpty = !favoritesOnly && !term && projectList.length === 0;

  const handleToggleFavorites = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("favorites_only", String(!favoritesOnly));
      return next;
    });
  };

  const handleToggleFavorite = (project: Project) => {
    projectsApi.setFavorite(project.id, !project.isFavorite);
    setProjectList((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, isFavorite: !p.isFavorite } : p,
      ),
    );
  };

  const handleOrderBy = (option: keyof ProjectInput) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("sort_by", option);
      return next;
    });
    setOpenedFilter(false);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await projectsApi.delete(projectToDelete.id);
      setProjectList((prev) => prev.filter((p) => p.id !== projectToDelete.id));
      setProjectToDelete(null);
    } catch {
    } finally {
      setIsDeleting(false);
    }
  };

  return isEmpty ? (
    <ProjectEmpty />
  ) : (
    <div className="project-list-container">
      <div className="page-header">
        <h1 className="page-title">
          Projetos
          <span> ({projectList.length})</span>
        </h1>
        <div className="project-list-actions">
          <label className="switch">
            <input
              type="checkbox"
              role="switch"
              checked={favoritesOnly}
              onChange={() => handleToggleFavorites()}
            />
            <span className="switch-slider" aria-hidden="true" />
            Apenas favoritos
          </label>
          <div className="project-list-filter">
            <div
              className={
                "project-list-filter-container" +
                (openedFilter ? " opened" : "")
              }
            >
              <button
                className="project-list-filter-button"
                onClick={() => setOpenedFilter(!openedFilter)}
              >
                {sortOptions[sort]}
                {
                  <Icon
                    icon={openedFilter ? "chevron-up" : "chevron-down"}
                    color="primary"
                    size={20}
                  />
                }
              </button>
              {openedFilter && (
                <ul className="project-list-options">
                  {Object.keys(sortOptions).map((option, index) => (
                    <li key={index} className="project-list-option">
                      <button
                        className="project-list-options-button"
                        onClick={() =>
                          handleOrderBy(option as keyof ProjectInput)
                        }
                      >
                        {sortOptions[option as keyof ProjectInput]}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <Button
            isLink
            to="/projects/new"
            icon={<PlusCircle size={24} strokeWidth={2} />}
          >
            Novo Projeto
          </Button>
        </div>
      </div>
      <div className="project-list">
        {projectList.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            term={term}
            onFavorite={handleToggleFavorite}
            onDelete={setProjectToDelete}
          />
        ))}
      </div>
      <ConfirmDialog
        open={projectToDelete !== null}
        title="Remover projeto"
        message={
          <span className="remove-project-message">
            Essa ação removerá definitivamente o projeto:
            <b className="remove-project-name">{projectToDelete?.name}</b>
          </span>
        }
        icon="trash"
        confirmLabel="Remover"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
};
