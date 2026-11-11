import type { FC } from "react";
import "./styles.css";
import type { FormInputProps } from "./types";

export const FormInput: FC<FormInputProps> = ({
  label,
  type = "text",
  children,
  required = false,
  value,
}: FormInputProps) => {
  return (
    <div className="form-input-container">
      <label className="form-input-label">
        <b>{label} </b>
        {required && <span className="form-input-required">(Obrigatório)</span>}
      </label>
      {children || <input className="form-input" type={type} value={value} />}
    </div>
  );
};
