import { Button } from "../Button";
import { Icon } from "../Icon";
import "./styles.css";

export const ProjectEmpty = () => {
  return (
    <div className="project-empty">
      <h2 className="project-empty-title">Nenhum projeto</h2>
      <p className="project-empty-description">
        Clique no botão abaixo para criar o primeiro e gerenciá-lo.
      </p>
      <Button
        icon={<Icon icon="plus" size={20} color="white" />}
        isLink
        to="/projects/new"
      >
        Novo projeto
      </Button>
    </div>
  );
};
