import { describe, expect, it } from "vitest";
import { highlightTerm } from "./string";

const join = (parts: { part: string }[]) => parts.map((p) => p.part).join("");

describe("highlightTerm", () => {
  it("devolve o texto inteiro sem destaque quando não há termo", () => {
    const text = "Etanol Cachaça Pinga";
    for (const term of [undefined, "", "   "]) {
      expect(highlightTerm(text, term)).toEqual([
        { part: text, highlight: false },
      ]);
    }
  });

  it("devolve o texto inteiro sem destaque quando nada corresponde", () => {
    expect(highlightTerm("Etanol Cachaça Pinga", "xyz")).toEqual([
      { part: "Etanol Cachaça Pinga", highlight: false },
    ]);
  });

  it("ignora acentos e maiúsculas, mas mantém o texto original", () => {
    expect(highlightTerm("Etanol Cachaça Pinga", "CACHACA")).toEqual([
      { part: "Etanol ", highlight: false },
      { part: "Cachaça", highlight: true },
      { part: " Pinga", highlight: false },
    ]);
  });

  it("destaca cada palavra do termo, em qualquer ordem", () => {
    expect(highlightTerm("Etanol Cachaça Pinga", "pinga etanol")).toEqual([
      { part: "Etanol", highlight: true },
      { part: " Cachaça ", highlight: false },
      { part: "Pinga", highlight: true },
    ]);
  });

  it("trata caracteres especiais de regex como texto", () => {
    expect(highlightTerm("Plano C++ (beta)", "c++")).toEqual([
      { part: "Plano ", highlight: false },
      { part: "C++", highlight: true },
      { part: " (beta)", highlight: false },
    ]);
    expect(() => highlightTerm("Plano C++ (beta)", "(")).not.toThrow();
  });

  it("reconstrói exatamente o texto original", () => {
    const text = "Décimo  Projeto de Exemplo";
    expect(join(highlightTerm(text, "decimo exemplo"))).toBe(text);
  });
});
