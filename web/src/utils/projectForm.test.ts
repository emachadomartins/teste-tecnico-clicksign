import { describe, expect, it } from "vitest";
import type { ProjectInput } from "@/types";
import { validate } from "./projectForm";

const today = "2026-11-12";

const validForm: ProjectInput = {
  name: "Projeto Exemplo",
  client: "Cliente Teste",
  initial_date: "2026-11-20",
  final_date: "2026-11-30",
};

const errorKeys = (form: Partial<ProjectInput>, isEditMode = false) =>
  Object.keys(validate({ ...validForm, ...form }, today, isEditMode));

describe("validate", () => {
  it("aceita um formulário válido", () => {
    expect(errorKeys({})).toEqual([]);
  });

  it("exige ao menos duas palavras no nome", () => {
    expect(errorKeys({ name: "" })).toEqual(["name"]);
    expect(errorKeys({ name: "Projeto" })).toEqual(["name"]);
    expect(errorKeys({ name: "   " })).toEqual(["name"]);
  });

  it("exige ao menos 5 caracteres no cliente", () => {
    expect(errorKeys({ client: "Acme" })).toEqual(["client"]);
    expect(errorKeys({ client: "   " })).toEqual(["client"]);
    expect(errorKeys({ client: "Acmes" })).toEqual([]);
  });

  it("exige a data de início", () => {
    expect(errorKeys({ initial_date: "" })).toEqual(["initial_date"]);
  });

  it("recusa a data de início no passado ao criar", () => {
    expect(errorKeys({ initial_date: "2026-11-01" })).toEqual(["initial_date"]);
  });

  it("aceita a data de início no passado ao editar", () => {
    expect(errorKeys({ initial_date: "2026-11-01" }, true)).toEqual([]);
  });

  it("aceita a data de início igual a hoje", () => {
    expect(errorKeys({ initial_date: today })).toEqual([]);
  });

  it("exige a data de término", () => {
    expect(errorKeys({ final_date: "" })).toEqual(["final_date"]);
  });

  it("recusa a data de término antes da data de início", () => {
    expect(errorKeys({ final_date: "2026-11-19" })).toEqual(["final_date"]);
  });

  it("aceita a data de término igual à data de início", () => {
    expect(errorKeys({ final_date: "2026-11-20" })).toEqual([]);
  });

  it("aponta todos os campos inválidos de uma vez", () => {
    expect(
      errorKeys({ name: "", client: "", initial_date: "", final_date: "" }),
    ).toEqual(["name", "client", "initial_date", "final_date"]);
  });
});
