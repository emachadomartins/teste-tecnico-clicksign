import { Button } from "../Button";
import { Icon } from "../Icon";
import "./styles.css";

export const ProjectEmpty = () => {
  return (
    <div className="project-empty">
      <h2>Nenhum projeto</h2>
      <p>Clique no botão abaixo para criar o primeiro e gerenciá-lo.</p>
      <Button
        icon={<Icon icon="plus" size={20} color="#ffffff" />}
        isLink
        to="/projects/new"
        className="button button--primary"
      >
        Novo projeto
      </Button>
    </div>
  );
};
