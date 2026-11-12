const normalize = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const highlightTerm = (
  text: string,
  term?: string,
): { part: string; highlight: boolean }[] => {
  const words = (term ?? "").split(/\s+/).map(normalize).filter(Boolean);
  if (words.length === 0) return [{ part: text, highlight: false }];

  const original = text.normalize("NFC");
  const regex = new RegExp(words.map(escapeRegExp).join("|"), "g");

  const parts: { part: string; highlight: boolean }[] = [];
  let lastIndex = 0;

  for (const match of normalize(original).matchAll(regex)) {
    const start = match.index;
    const end = start + match[0].length;

    if (start > lastIndex)
      parts.push({ part: original.slice(lastIndex, start), highlight: false });
    parts.push({
      part: original.slice(start, end),
      highlight: true,
    });
    lastIndex = end;
  }

  if (lastIndex < original.length)
    parts.push({ part: original.slice(lastIndex), highlight: false });

  return parts;
};
