import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ApiError } from "../../api/client";
import { projectsApi } from "../../api/project";
import { type ProjectInput } from "../../types/project";

import { Button } from "../../components/Button";
import { FormInput } from "../../components/FormInput";
import { Icon } from "../../components/Icon";
import { toDateInputValue } from "../../utils/date";
import { validate } from "../../utils/projectForm";
import "./styles.css";

const EMPTY_FORM: ProjectInput = {
  name: "",
  client: "",
  initial_date: "",
  final_date: "",
};

export const ProjectForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProjectInput>(EMPTY_FORM);
  const [touched, setTouched] = useState<
    Partial<Record<keyof ProjectInput, boolean>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileInputId = useId();

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
      const req = id
        ? () => projectsApi.update(id, form)
        : () => projectsApi.create(form);
      const saved = await req();

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
          if (!id) navigate(`/projects/${saved.id}/edit`, { replace: true });
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

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      projectsApi.get(id).then((project) => {
        setForm({
          name: project.name,
          client: project.client,
          cover_url: project.coverUrl,
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

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setCoverError("Escolha uma imagem .jpg ou .png");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCoverError("A imagem deve ter no máximo 5 MB");
      return;
    }

    setCoverError(null);
    setCoverFile(file);
  };

  const previewUrl = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleRemoveCover = () => {
    if (coverFile) setCoverFile(null);
    else {
      setForm((prev) => ({ ...prev, cover_url: undefined }));
      setRemoveCover(true);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const coverToShow = previewUrl ?? form?.cover_url ?? null;

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
        <form className="project-form" onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Nome do projeto"
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
              label="Data Final"
              type="date"
              value={form?.final_date || ""}
              min={form?.initial_date || today}
              onChange={(e) => handleChange("final_date", e.target.value)}
              onBlur={() => handleBlur("final_date")}
              error={errorFor("final_date")}
              required
            />
          </div>
          <FormInput label="Capa do projeto" error={coverError ?? undefined}>
            <div
              className={
                "file-input cover-field" +
                (coverToShow ? " cover-field--with-image" : "")
              }
            >
              <label htmlFor={fileInputId} className="file-input-dropzone">
                <Icon
                  icon="upload"
                  size={24}
                  aria-hidden="true"
                  color="textMuted"
                />
                <span className="file-input-text">
                  Escolha uma imagem .jpg ou .png no seu dispositivo
                </span>
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  isFake
                >
                  Selecionar
                </Button>
              </label>
              {coverToShow && (
                <>
                  <img
                    className="cover-field-image"
                    src={coverToShow}
                    alt="Capa do projeto"
                  />
                  <div className="cover-field-actions">
                    <Icon
                      icon="trash"
                      color="primary"
                      className="icon-button"
                      label="Remover capa"
                      onClick={handleRemoveCover}
                      size={20}
                    />
                  </div>
                </>
              )}

              <input
                id={fileInputId}
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg"
                className="visually-hidden"
                onChange={handleCoverChange}
                tabIndex={-1}
              />
            </div>
          </FormInput>
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
      </div>
    </div>
  );
};
