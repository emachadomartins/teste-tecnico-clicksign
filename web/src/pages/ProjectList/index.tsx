import { ProjectCard } from "../../components/ProjectCard";
import "./styles.css";

export const ProjectList = () => {
  return (
    <div className="project-list">
      {[
        {
          name: "Projeto 1",
          client: "Cliente 1",
          startDate: "10 de novembro de 2026",
          endDate: "30 de novembro de 2026",
        },
        {
          name: "Projeto 2",
          client: "Cliente 2",
          startDate: "10 de novembro de 2026",
          endDate: "30 de novembro de 2026",
        },
        {
          name: "Projeto 3",
          client: "Cliente 3",
          startDate: "10 de novembro de 2026",
          endDate: "30 de novembro de 2026",
        },
        {
          name: "Projeto 4",
          client: "Cliente 4",
          startDate: "10 de novembro de 2026",
          endDate: "30 de novembro de 2026",
        },
        {
          name: "Projeto 5",
          client: "Cliente 5",
          startDate: "10 de novembro de 2026",
          endDate: "30 de novembro de 2026",
        },
        {
          name: "Projeto 6",
          client: "Cliente 6",
          startDate: "10 de novembro de 2026",
          endDate: "30 de novembro de 2026",
        },
        {
          name: "Projeto 7",
          client: "Cliente 7",
          startDate: "10 de novembro de 2026",
          endDate: "30 de novembro de 2026",
        },
      ].map((project, index) => (
        <ProjectCard key={index} project={project} />
      ))}
    </div>
  );
};
