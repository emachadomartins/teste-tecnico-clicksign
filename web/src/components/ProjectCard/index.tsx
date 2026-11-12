import React, { useState } from "react";
import { Link } from "react-router";
import type { Project } from "@/types";
import { formatLongDate, highlightTerm } from "@/utils";
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
            <Icon icon="layers" color="white" size={80} shadow />
          </div>
        )}
        <div className="project-actions">
          <Icon
            label="Favoritar"
            onClick={() => onFavorite(project)}
            icon="star"
            size={32}
            color="white"
            fill={project.isFavorite ? "accent" : "none"}
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
            color="primary"
            circle
            circleColor="white"
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
                    color="primary"
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
                    color="primary"
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
            <Icon icon="calendar-plus" size={24} color="textMuted" />
            <span>{formatLongDate(project.initialDate)}</span>
          </div>
          <div className="date">
            <Icon icon="calendar-check" size={24} color="textMuted" />
            <span>{formatLongDate(project.finalDate)}</span>
          </div>
        </div>
      </article>
    </li>
  );
};
