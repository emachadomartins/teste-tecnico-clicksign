import { afterEach, describe, expect, it, vi } from "vitest";
import { formatLongDate, toDateInputValue } from "./date";

describe("toDateInputValue", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("gera a data de hoje no formato YYYY-MM-DD", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 12, 10, 0));
    expect(toDateInputValue()).toBe("2026-11-12");
  });

  it("completa mês e dia com zero à esquerda", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 10, 0));
    expect(toDateInputValue()).toBe("2026-01-05");
  });

  it("usa o horário local, mesmo perto da meia-noite", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 12, 23, 59));
    expect(toDateInputValue()).toBe("2026-11-12");
  });
});

describe("formatLongDate", () => {
  it("formata a data por extenso", () => {
    expect(formatLongDate("2026-11-11")).toBe("11 de novembro de 2026");
  });

  it("não volta um dia por causa do fuso horário", () => {
    expect(formatLongDate("2026-01-01")).toBe("1 de janeiro de 2026");
  });
});
