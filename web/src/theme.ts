export const colors = {
  primary: "var(--color-primary)",
  primaryLight: "var(--color-primary-light)",
  primarySurface: "var(--color-primary-surface)",
  heading: "var(--color-heading)",
  dark: "var(--color-dark)",
  accent: "var(--color-accent)",
  danger: "var(--color-danger)",
  white: "var(--color-white)",
  text: "var(--color-text)",
  textMuted: "var(--color-text-muted)",
  textPlaceholder: "var(--color-text-placeholder)",
  neutral: "var(--color-neutral)",
} as const;

export type ColorName = keyof typeof colors;
