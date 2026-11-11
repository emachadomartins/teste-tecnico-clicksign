import { PlusCircle } from "lucide-react";

import { useEffect, useState } from "react";
import { projectsApi } from "../../api/project";
import { Button } from "../../components/Button";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { Icon } from "../../components/Icon";
import { ProjectCard } from "../../components/ProjectCard";
import type { Project } from "../../types/project";
import "./styles.css";

const orderOptions = [
  "Ordem alfabética",
  "Iniciados mais recentes",
  "Prazo mais próximo",
];

export const ProjectList = () => {
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [openedFilter, setOpenedFilter] = useState(false);
  const [orderBy, setOrderBy] = useState("Ordem alfabetica");
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    projectsApi.list().then(({ projects }) => {
      setProjectList(projects);
    });
  }, []);

  const handleToggleFavorites = () => {
    setOnlyFavorites(!onlyFavorites);
  };

  const visibleProjects = onlyFavorites
    ? projectList.filter((p) => p.isFavorite)
    : projectList;

  const handleToggleFavorite = (project: Project) => {
    projectsApi.setFavorite(project.id, !project.isFavorite);
    setProjectList((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, isFavorite: !p.isFavorite } : p,
      ),
    );
  };

  const handleOrderBy = (option: number) => {
    setOrderBy(orderOptions[option]);
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
      // mostrar um erro (dentro do modal, por exemplo)
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="project-list-container">
      <div className="page-header">
        <h1 className="page-title">
          Projetos
          <span> ({visibleProjects.length})</span>
        </h1>
        <div className="project-list-actions">
          <label className="switch">
            <input
              type="checkbox"
              role="switch"
              checked={onlyFavorites}
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
                {orderBy}
                {
                  <Icon
                    icon={openedFilter ? "chevron-up" : "chevron-down"}
                    color="#695CCD"
                    size={20}
                  />
                }
              </button>
              {openedFilter && (
                <ul className="project-list-options">
                  {orderOptions.map((option, index) => (
                    <li key={index} className="project-list-option">
                      <button
                        className="project-list-options-button"
                        onClick={() => handleOrderBy(index)}
                      >
                        {option}
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
        {visibleProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
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
