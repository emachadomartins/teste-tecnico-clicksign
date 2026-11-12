import React, { useState } from "react";
import { Link } from "react-router";
import type { Project } from "../../types/project";
import { highlightTerm } from "../../utils/string";
import { Icon } from "../Icon";
import "./styles.css";

export type ProjectCardProps = {
  project: Project;
  term?: string;
  onFavorite: (project: Project) => void;
  onDelete: (project: Project) => void;
};

const highlightComponents = (text: string, term?: string) => {
  return highlightTerm(text, term).map((part, index) =>
    part.highlight ? (
      <mark key={index}>{part.part}</mark>
    ) : (
      <span key={index}>{part.part}</span>
    ),
  );
};

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeZone: "UTC",
});

function formatLongDate(isoDate: string): string {
  return longDateFormatter.format(new Date(isoDate));
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  term,
  onDelete,
  onFavorite,
}: ProjectCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <li className="project-card-container">
      <div className="project-cover">
        {project.coverUrl ? (
          <img
            className="project-image"
            src={project.coverUrl}
            alt={`Capa do projeto ${project.name}`}
          />
        ) : (
          <div className="project-image-placeholder" aria-hidden="true">
            <Icon icon="layers" color="#FFFFFF" size={80} shadow />
          </div>
        )}
        <div className="project-actions">
          <Icon
            label="Favoritar"
            onClick={() => onFavorite(project)}
            icon="star"
            size={32}
            color="#FFFFFF"
            fill={project.isFavorite ? "#FFB23D" : "none"}
            stroke={1}
            shadow
          />

          <Icon
            label="Mais opções"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
            icon="ellipsis"
            size={24}
            color="#695CCD"
            circle
            circleColor="#FFFFFF"
            circleSize={32}
            shadow
          />

          {isMenuOpen && (
            <ul className="card-menu-options">
              <li>
                <Link
                  to={`/projects/${project.id}/edit`}
                  className="card-menu-option"
                >
                  <Icon
                    icon="square-pen"
                    color="#695ccd"
                    size={24}
                    aria-hidden="true"
                  />
                  Editar
                </Link>
              </li>
              <li>
                <button
                  className="card-menu-option"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete(project);
                  }}
                >
                  <Icon
                    icon="trash"
                    color="#695ccd"
                    size={24}
                    aria-hidden="true"
                  />
                  Remover
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
      <article className="project-card">
        <p className="project-name">
          {highlightComponents(project.name, term)}
        </p>
        <p className="project-description">
          <b>Cliente:</b> {highlightComponents(project.client, term)}
        </p>
        <div className="project-dates">
          <div className="date">
            <Icon icon="calendar-plus" size={24} color="#717171" />
            <span>{formatLongDate(project.initialDate)}</span>
          </div>
          <div className="date">
            <Icon icon="calendar-check" size={24} color="#717171" />
            <span>{formatLongDate(project.finalDate)}</span>
          </div>
        </div>
      </article>
    </li>
  );
};
