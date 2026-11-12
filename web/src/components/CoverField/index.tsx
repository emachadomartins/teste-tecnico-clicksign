import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "../Button";
import { FormInput } from "../FormInput";
import { Icon } from "../Icon";
import "./styles.css";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024;

type CoverFieldProps = {
  file: File | null;
  currentUrl?: string;
  onFileChange: (file: File | null) => void;
  onRemoveCurrent: () => void;
};

export const CoverField = ({
  file,
  currentUrl,
  onFileChange,
  onRemoveCurrent,
}: CoverFieldProps) => {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const coverToShow = previewUrl ?? currentUrl ?? null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError("Escolha uma imagem .jpg ou .png");
      return;
    }
    if (selected.size > MAX_SIZE) {
      setError("A imagem deve ter no máximo 5 MB");
      return;
    }

    setError(null);
    onFileChange(selected);
  };

  const handleRemove = () => {
    if (file) onFileChange(null);
    else onRemoveCurrent();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <FormInput label="Capa do projeto" error={error ?? undefined}>
      <div className="file-input cover-field">
        <label htmlFor={inputId} className="file-input-dropzone">
          <Icon icon="upload" size={24} aria-hidden="true" color="textMuted" />
          <span className="file-input-text">
            Escolha uma imagem .jpg ou .png no seu dispositivo
          </span>
          <Button variant="secondary" isFake>
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
                onClick={handleRemove}
                size={20}
              />
            </div>
          </>
        )}

        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(", ")}
          className="visually-hidden"
          onChange={handleChange}
          tabIndex={-1}
        />
      </div>
    </FormInput>
  );
};
