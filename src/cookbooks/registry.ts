export const COOKBOOK_IDS = ["fable", "astra"] as const;
export type CookbookId = (typeof COOKBOOK_IDS)[number];
export const COOKBOOKS = [
  {
    id: "fable",
    title: "Cookbook 1 (Fable)",
    description:
      "A folding story rail, glass portraits, and an ink-and-paper conversation.",
    route: "/fable",
  },
  {
    id: "astra",
    title: "Cookbook 2 (Astra)",
    description:
      "A reversible portrait ribbon, native glass bubbles, and a shared photo.",
    route: "/astra",
  },
] as const;
