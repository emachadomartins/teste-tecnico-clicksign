import {
  CalendarCheck,
  CalendarPlus,
  Ellipsis,
  Layers,
  Star,
} from "lucide-react";
import React from "react";

import "./styles.css";
import type { ProjectCardProps } from "./types";

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onToggleFavorite,
}: ProjectCardProps) => {
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
            onClick={() => onToggleFavorite(project)}
          >
            <Star
              size={28}
              color="#FFFFFF"
              fill={project.isFavorited ? "#FFB23D" : "none"}
            />
          </button>
          <button className="ellipsis-button" aria-label="Mais opções">
            <Ellipsis size={20} color="#1C1930" fill="#FFFFFF" />
          </button>
        </div>
      </div>
      <article className="project-card">
        <p className="project-name">{project.name}</p>
        <p className="project-description">
          <b>Cliente:</b> {project.client}
        </p>
        <div className="project-dates">
          <div className="date">
            <CalendarCheck size={24} color="#717171" />
            <span>{project.startDate}</span>
          </div>
          <div className="date">
            <CalendarPlus size={24} color="#717171" />
            <span>{project.endDate}</span>
          </div>
        </div>
      </article>
    </li>
  );
};
