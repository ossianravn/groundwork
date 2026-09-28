// The catalog owns the available accents and their order. Each accent's
// colours live in styles/theme.css as a light and a dark [data-accent] block;
// accents.test.ts keeps the two in agreement.
export const accents = [
  { value: "indigo", label: "Indigo" },
  { value: "teal", label: "Teal" },
  { value: "neutral", label: "Neutral" },
] as const

export type Accent = (typeof accents)[number]["value"]

export const defaultAccent: Accent = accents[0].value
