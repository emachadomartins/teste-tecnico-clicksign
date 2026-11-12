import type { ProjectInput } from "@/types";

export function validate(
  form: ProjectInput,
  today: string,
  isEditMode: boolean,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.name.trim() || form.name.trim().split(" ").length < 2)
    errors.name = "Por favor, digite ao menos duas palavras";
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
