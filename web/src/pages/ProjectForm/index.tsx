import { ArrowLeft, Upload } from "lucide-react";
import { Link, useParams } from "react-router";
import { FormInput } from "../../components/FormInput";

import "./styles.css";

export const ProjectForm = () => {
  const { id } = useParams<{ id: string }>();

  const isEditMode = Boolean(id);

  return (
    <div className="project-form-container">
      <Link className="page-back-link" to="/">
        <ArrowLeft size={16} />
        Voltar
      </Link>
      <div className="project-form-headers">
        <div className="project-form-title">
          <b>{isEditMode ? "Editar Projeto" : "Novo Projeto"}</b>
        </div>
      </div>

      <form className="project-form">
        <FormInput label="Nome do Projeto" required />
        <FormInput label="Cliente" required />
        <div className="form-dates">
          <FormInput label="Data de Início" type="date" required />
          <FormInput label="Data de Término" type="date" required />
        </div>
        <FormInput label="Capa do Projeto">
          <div className="file-input">
            <label htmlFor={id} className="file-input-dropzone">
              <Upload size={24} aria-hidden="true" color="#717171" />
              <span className="file-input-text">
                Escolha uma imagem .jpg ou .png no seu dispositivo
              </span>
              <span className="file-input-button">Selecionar</span>
            </label>

            <input
              id={id}
              type="file"
              accept="image/png, image/jpeg"
              className="visually-hidden"
              onChange={(e) => {}}
            />
          </div>
        </FormInput>
        <button type="submit">Criar Projeto</button>
      </form>
    </div>
  );
};
