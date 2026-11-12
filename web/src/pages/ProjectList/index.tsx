import { PlusCircle } from "lucide-react";

import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ApiError } from "@/api";
import {
  Button,
  ConfirmDialog,
  Icon,
  ProjectCard,
  ProjectEmpty,
  SortSelect,
  Switch,
} from "@/components";
import { useProjects } from "@/hooks";
import { isSortOption, type Project, type SortOption } from "@/types";
import "./styles.css";

export const ProjectList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const term = searchParams.get("term") || undefined;
  const favoritesOnly = searchParams.get("favorites_only") === "true";
  const sortParam = searchParams.get("sort_by");
  const sort: SortOption = isSortOption(sortParam) ? sortParam : "name";

  const {
    projects,
    total,
    isFirstLoad,
    isLoading,
    loadError,
    reload,
    toggleFavorite,
    removeProject,
  } = useProjects({ favoritesOnly, sort, term });

  const isEmpty =
    !isLoading &&
    !loadError &&
    !favoritesOnly &&
    !term &&
    projects.length === 0;
  const isSearchResult = Boolean(term);

  const updateParam = (key: string, value: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  };

  const handleOpenDelete = (project: Project) => {
    setDeleteError(null);
    setProjectToDelete(project);
  };

  const handleCancelDelete = () => {
    setDeleteError(null);
    setProjectToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await removeProject(projectToDelete.id);
      setProjectToDelete(null);
    } catch (err) {
      setDeleteError(
        err instanceof ApiError && err.status === 404
          ? "Este projeto não existe mais. Atualize a página."
          : "Não foi possível remover o projeto. Tente novamente.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEmpty) return <ProjectEmpty />;

  return (
    <div className="project-list-container">
      {isSearchResult ? (
        <>
          <Link className="page-back-link" to="/">
            <Icon icon="arrow-left" color="primary" size={16} />
            Voltar
          </Link>
          <div className="page-header page-header--with-back">
            <h1 className="page-title">Resultado da busca</h1>
          </div>
        </>
      ) : (
        <div className="page-header">
          <h1 className="page-title">
            Projetos
            <span className="page-title-count">({total})</span>
          </h1>
          <div className="project-list-actions">
            <Switch
              label="Apenas favoritos"
              checked={favoritesOnly}
              onChange={(checked) =>
                updateParam("favorites_only", checked ? "true" : null)
              }
            />
            <SortSelect
              value={sort}
              onChange={(option) => updateParam("sort_by", option)}
            />
            <Button
              isLink
              to="/projects/new"
              icon={<PlusCircle size={24} strokeWidth={2} />}
            >
              Novo projeto
            </Button>
          </div>
        </div>
      )}
      {loadError && !isLoading ? (
        <div className="page-state" role="alert">
          <p className="page-state-message">
            Não foi possível carregar os projetos.
          </p>
          <Button variant="secondary" onClick={reload}>
            Tentar novamente
          </Button>
        </div>
      ) : isFirstLoad ? (
        <div className="page-state" role="status">
          <p className="page-state-message">Carregando projetos...</p>
        </div>
      ) : !isLoading && projects.length === 0 ? (
        <div className="page-state" role="status">
          <p className="page-state-message">Nenhum projeto encontrado.</p>
        </div>
      ) : (
        <div
          className={
            "project-list" + (isLoading ? " project-list--loading" : "")
          }
          aria-busy={isLoading}
        >
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              term={term}
              onFavorite={toggleFavorite}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}
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
        isLoading={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};
