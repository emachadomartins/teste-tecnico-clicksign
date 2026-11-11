import { ChevronDown, ChevronUp, PlusCircle } from "lucide-react";
import { useState } from "react";
import { ProjectCard } from "../../components/ProjectCard";
import "./styles.css";

const projects = [
  {
    id: 1,
    name: "Projeto 1",
    client: "Cliente 1",
    startDate: "10 de novembro de 2026",
    endDate: "30 de novembro de 2026",
    isFavorited: true,
  },
  {
    id: 2,
    name: "Projeto 2",
    client: "Cliente 2",
    startDate: "10 de novembro de 2026",
    endDate: "30 de novembro de 2026",
    isFavorited: false,
  },
  {
    id: 3,
    name: "Projeto 3",
    client: "Cliente 3",
    startDate: "10 de novembro de 2026",
    endDate: "30 de novembro de 2026",
    isFavorited: true,
  },
  {
    id: 4,
    name: "Projeto 4",
    client: "Cliente 4",
    startDate: "10 de novembro de 2026",
    endDate: "30 de novembro de 2026",
    isFavorited: false,
  },
  {
    id: 5,
    name: "Projeto 5",
    client: "Cliente 5",
    startDate: "10 de novembro de 2026",
    endDate: "30 de novembro de 2026",
  },
  {
    id: 6,
    name: "Projeto 6",
    client: "Cliente 6",
    startDate: "10 de novembro de 2026",
    endDate: "30 de novembro de 2026",
  },
  {
    id: 7,
    name: "Projeto 7",
    client: "Cliente 7",
    startDate: "10 de novembro de 2026",
    endDate: "30 de novembro de 2026",
  },
];

const orderOptions = [
  "Ordem alfabética",
  "Iniciados mais recentes",
  "Prazo mais próximo",
];

export const ProjectList = () => {
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [projectList, setProjectList] = useState(projects);
  const [openedFilter, setOpenedFilter] = useState(false);
  const [orderBy, setOrderBy] = useState("Ordem alfabetica");
  const [openedMenu, setOpenedMenu] = useState<number | null>(null);

  const handleToggleFavorites = () => {
    setOnlyFavorites(!onlyFavorites);
  };

  const visibleProjects = onlyFavorites
    ? projectList.filter((p) => p.isFavorited)
    : projectList;

  const handleToggleFavorite = (project: any) => {
    setProjectList((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, isFavorited: !p.isFavorited } : p,
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
      <div className="project-list-headers">
        <div className="project-list-title">
          <b>Projetos</b>
          <span> ({visibleProjects.length})</span>
        </div>
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
          <button className="new-project-button">
            <PlusCircle size={24} strokeWidth={2} />
            Novo Projeto
          </button>
        </div>
      </div>
      <div className="project-list">
        {visibleProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onToggleFavorite={handleToggleFavorite}
            onMenuOpen={handleOpenMenu}
            onCloseMenu={handleCloseMenu}
          />
        ))}
      </div>
    </div>
  );
};
