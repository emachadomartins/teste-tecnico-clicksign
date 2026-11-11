import type { InputHTMLAttributes, ReactNode } from "react";

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  children?: ReactNode;
  required?: boolean;
  error?: string;
};

export type { FormInputProps };
