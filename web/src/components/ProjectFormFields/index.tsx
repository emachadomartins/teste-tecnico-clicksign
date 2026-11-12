import { useState } from "react";
import { useNavigate } from "react-router";
import { ApiError, projectsApi } from "@/api";
import { Button } from "../Button";
import { CoverField } from "../CoverField";
import { FormInput } from "../FormInput";
import type { Project, ProjectInput } from "@/types";
import { toDateInputValue, validate } from "@/utils";
import "./styles.css";

type FieldName = "name" | "client" | "initial_date" | "final_date";

const ALL_TOUCHED: Record<FieldName, boolean> = {
  name: true,
  client: true,
  initial_date: true,
  final_date: true,
};

function toFormValues(project: Project | null): ProjectInput {
  return {
    name: project?.name ?? "",
    client: project?.client ?? "",
    initial_date: project?.initialDate ?? "",
    final_date: project?.finalDate ?? "",
  };
}

type ProjectFormFieldsProps = {
  project: Project | null;
};

export const ProjectFormFields = ({ project }: ProjectFormFieldsProps) => {
  const navigate = useNavigate();
  const isEditMode = project !== null;

  const [form, setForm] = useState<ProjectInput>(() => toFormValues(project));
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState(project?.coverUrl);
  const [removeCover, setRemoveCover] = useState(false);

  const today = toDateInputValue();
  const errors = validate(form, today, isEditMode);
  const isFormValid = Object.keys(errors).length === 0;

  const fieldProps = (field: FieldName) => ({
    value: form[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value })),
    onBlur: () => setTouched((prev) => ({ ...prev, [field]: true })),
    error: touched[field] ? errors[field] : undefined,
  });

  const handleRemoveCurrentCover = () => {
    setCurrentCoverUrl(undefined);
    setRemoveCover(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched(ALL_TOUCHED);
    if (!isFormValid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const saved = project
        ? await projectsApi.update(project.id, form)
        : await projectsApi.create(form);

      if (removeCover && !coverFile) {
        try {
          await projectsApi.removeCover(saved.id);
        } catch {
          setSubmitError(
            "O projeto foi salvo, mas não foi possível remover a capa. Tente novamente.",
          );
          return;
        }
      }

      if (coverFile) {
        try {
          await projectsApi.uploadCover(saved.id, coverFile);
        } catch {
          setSubmitError(
            "O projeto foi salvo, mas não foi possível enviar a capa. Tente novamente.",
          );
          if (!project) {
            navigate(`/projects/${saved.id}/edit`, { replace: true });
          }
          return;
        }
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

  return (
    <form className="project-form" onSubmit={handleSubmit} noValidate>
      <FormInput label="Nome do projeto" {...fieldProps("name")} required />
      <FormInput label="Cliente" {...fieldProps("client")} required />
      <div className="form-dates">
        <FormInput
          label="Data de Início"
          type="date"
          max={form.final_date || undefined}
          min={isEditMode ? undefined : today}
          {...fieldProps("initial_date")}
          required
        />
        <FormInput
          label="Data Final"
          type="date"
          min={form.initial_date || today}
          {...fieldProps("final_date")}
          required
        />
      </div>
      <CoverField
        file={coverFile}
        currentUrl={currentCoverUrl}
        onFileChange={setCoverFile}
        onRemoveCurrent={handleRemoveCurrentCover}
      />
      {submitError && (
        <p className="form-submit-error" role="alert">
          {submitError}
        </p>
      )}
      <Button
        className="project-form-submit"
        disabled={!isFormValid || isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Salvando..." : "Salvar projeto"}
      </Button>
    </form>
  );
};
