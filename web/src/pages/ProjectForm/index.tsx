import { Link, useParams } from "react-router";
import { Button, Icon, ProjectFormFields } from "@/components";
import { useProject } from "@/hooks";
import "./styles.css";

export const ProjectForm = () => {
  const { id } = useParams<{ id: string }>();
  const { project, isLoading, error } = useProject(id);
  const isEditMode = Boolean(id);

  return (
    <div className="project-form-container">
      <Link className="page-back-link" to="/">
        <Icon icon="arrow-left" color="primary" size={16} />
        Voltar
      </Link>
      <div className="project-form-headers">
        <div className="project-form-title">
          <b>{isEditMode ? "Editar projeto" : "Novo projeto"}</b>
        </div>
      </div>

      <div className="project-form-panel">
        {isLoading ? (
          <div className="page-state" role="status">
            <p className="page-state-message">Carregando projeto...</p>
          </div>
        ) : error ? (
          <div className="page-state" role="alert">
            <p className="page-state-message">
              {error === "not-found"
                ? "Este projeto não existe ou foi removido."
                : "Não foi possível carregar o projeto."}
            </p>
            <Button isLink to="/" variant="secondary">
              Voltar para a lista
            </Button>
          </div>
        ) : (
          <ProjectFormFields key={id ?? "new"} project={project} />
        )}
      </div>
    </div>
  );
};
