import { useId, type FC } from "react";
import "./styles.css";
import type { FormInputProps } from "./types";

export const FormInput: FC<FormInputProps> = ({
  label,
  type = "text",
  children,
  required = false,
  value,
  error,
  ...props
}: FormInputProps) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="form-input-container">
      <label
        className={
          "form-input-label" + (error ? " form-input-label-error" : "")
        }
        htmlFor={id}
      >
        <b>{label} </b>
        {required && <span className="form-input-required">(Obrigatório)</span>}
      </label>
      {children || (
        <input
          className={"form-input" + (error ? " form-input-error" : "")}
          type={type}
          value={value}
          {...props}
        />
      )}

      {error && (
        <span id={errorId} className="form-input-error-message">
          {error}
        </span>
      )}
    </div>
  );
};
