import {
  CalendarCheck,
  CalendarPlus,
  CircleEllipsis,
  Layers,
  SquarePen,
  Star,
  Trash,
} from "lucide-react";
import React, { useState } from "react";

import { Link } from "react-router";
import "./styles.css";
import type { ProjectCardProps } from "./types";

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onToggleFavorite,
  onMenuOpen,
  onMenuClose,
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
            <Layers size={80} />
          </div>
        )}
        <div className="project-actions">
          <button
            aria-label="Favoritar"
            className="favorite-button"
            onClick={() => onToggleFavorite(project)}
          >
            <Star
              size={32}
              color="#FFFFFF"
              fill={project.isFavorited ? "#FFB23D" : "none"}
              strokeWidth={1}
            />
          </button>
          <button
            className="ellipsis-button"
            aria-label="Mais opções"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              if (isMenuOpen) {
                onMenuClose();
              }
              onMenuOpen(project);
            }}
          >
            <CircleEllipsis
              size={32}
              color="#695CCD"
              fill="#FFFFFF"
              strokeWidth={2}
            />
          </button>
          {isMenuOpen && (
            <ul className="card-menu-options">
              <li>
                <Link
                  to={`/projects/${project.id}/edit`}
                  className="card-menu-option"
                  onClick={() => {}}
                >
                  <SquarePen size={24} aria-hidden="true" />
                  Editar
                </Link>
              </li>
              <li>
                <button className="card-menu-option" onClick={() => {}}>
                  <Trash size={24} aria-hidden="true" />
                  Remover
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
      <article className="project-card">
        <p className="project-name">{project.name}</p>
        <p className="project-description">
          <b>Cliente:</b> {project.client}
        </p>
        <div className="project-dates">
          <div className="date">
            <CalendarPlus size={24} color="#717171" />
            <span>{project.startDate}</span>
          </div>
          <div className="date">
            <CalendarCheck size={24} color="#717171" />
            <span>{project.endDate}</span>
          </div>
        </div>
      </article>
    </li>
  );
};
