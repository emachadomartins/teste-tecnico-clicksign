import { ArrowLeft, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ApiError } from "../../api/client";
import { projectsApi, type ProjectInput } from "../../api/project";
import { FormInput } from "../../components/FormInput";
import "./styles.css";

const EMPTY_FORM: ProjectInput = {
  name: "",
  client: "",
  initial_date: "",
  final_date: "",
};

function toDateInputValue(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() começa em 0
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function validate(
  form: ProjectInput,
  today: string,
  isEditMode: boolean,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.name.trim() || form.name.trim().split(" ").length < 2)
    errors.name = "Por favor, digite ao menos duas palavra";
  if (form.client.trim().length < 5)
    errors.client = "Por favor, digite ao menos uma palavra";
  if (!form.initial_date) errors.initial_date = "Selecione uma data válida";
  else if (form.initial_date < today && !isEditMode)
    errors.initial_date = "A data de início não pode estar no passado";
  if (!form.final_date) errors.final_date = "Selecione uma data válida";
  else if (form.initial_date && form.final_date < form.initial_date)
    errors.final_date = "A data de término deve ser depois da data de início";

  return errors;
}

export const ProjectForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProjectInput>(EMPTY_FORM);
  const [touched, setTouched] = useState<
    Partial<Record<keyof ProjectInput, boolean>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({
      name: true,
      client: true,
      initial_date: true,
      final_date: true,
    });
    if (!isFormValid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (id) {
        await projectsApi.update(id, form);
      } else {
        await projectsApi.create(form);
      }
      navigate("/");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar o projeto. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      projectsApi.get(id).then((project) => {
        setForm({
          name: project.name,
          client: project.client,
          initial_date: project.initialDate,
          final_date: project.finalDate,
        });
      });
    }
  }, [id]);

  const isEditMode = Boolean(id);

  const today = toDateInputValue();
  const errors = validate(form, today, isEditMode);
  const isFormValid = Object.keys(errors).length === 0;

  const handleBlur = (field: keyof ProjectInput) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const errorFor = (field: keyof ProjectInput) =>
    touched[field] ? errors[field] : undefined;

  const handleChange = (field: keyof ProjectInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

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

      <form className="project-form" onSubmit={handleSubmit} noValidate>
        <FormInput
          label="Nome do Projeto"
          value={form?.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          error={errorFor("name")}
          required
        />
        <FormInput
          label="Cliente"
          value={form?.client || ""}
          onChange={(e) => handleChange("client", e.target.value)}
          onBlur={() => handleBlur("client")}
          error={errorFor("client")}
          required
        />
        <div className="form-dates">
          <FormInput
            label="Data de Início"
            type="date"
            value={form?.initial_date || ""}
            max={form?.final_date || ""}
            min={isEditMode ? undefined : today}
            onChange={(e) => handleChange("initial_date", e.target.value)}
            onBlur={() => handleBlur("initial_date")}
            error={errorFor("initial_date")}
            required
          />
          <FormInput
            label="Data de Término"
            type="date"
            value={form?.final_date || ""}
            min={form?.initial_date || today}
            onChange={(e) => handleChange("final_date", e.target.value)}
            onBlur={() => handleBlur("final_date")}
            error={errorFor("final_date")}
            required
          />
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
        {submitError && (
          <p className="form-submit-error" role="alert">
            {submitError}
          </p>
        )}
        <button
          className="project-form-submit"
          disabled={!isFormValid || isSubmitting}
          type="submit"
        >
          {isSubmitting
            ? "Salvando..."
            : isEditMode
              ? "Salvar Projeto"
              : "Criar Projeto"}
        </button>
      </form>
    </div>
  );
};
