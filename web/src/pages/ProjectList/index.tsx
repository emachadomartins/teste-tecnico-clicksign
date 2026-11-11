import { ChevronDown, ChevronUp, PlusCircle } from "lucide-react";

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { projectsApi } from "../../api/project";
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
  const [openedMenu, setOpenedMenu] = useState<number | null>(null);

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

  const handleOpenMenu = (project: any) => {
    setOpenedMenu((prev) => (prev === project.id ? null : project.id));
  };

  const handleCloseMenu = () => {
    setOpenedMenu(null);
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
                {openedFilter ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
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
          <Link className="new-project-button" to="/projects/new">
            <PlusCircle size={24} strokeWidth={2} />
            Novo Projeto
          </Link>
        </div>
      </div>
      <div className="project-list">
        {visibleProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onToggleFavorite={handleToggleFavorite}
            onMenuOpen={handleOpenMenu}
            onMenuClose={handleCloseMenu}
          />
        ))}
      </div>
    </div>
  );
};
