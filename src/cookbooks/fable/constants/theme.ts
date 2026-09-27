/**
 * Fable design tokens.
 * One accent, one grey family (cool-neutral), one radius scale:
 *   actions are circles / pills · bubbles 22 · cards 20 · inputs pill.
 * Every spacing value is a multiple of 4.
 */
/** The grammar: black carries the actions, blue only marks status. */
export const Accent = "#0A84FF";
export const Ink = "#111113";

export const Palette = {
  light: {
    bg: "#F2F2F4",
    surface: "#FFFFFF",
    label: "#101012",
    secondary: "#78787E",
    tertiary: "#B4B4BA",
    hairline: "rgba(16, 16, 18, 0.08)",
    rowPressed: "rgba(16, 16, 18, 0.06)",
    avatarRing: "#FFFFFF",
    seenRing: "rgba(16, 16, 18, 0.12)",
    outgoing: "#141416",
    outgoingText: "#FFFFFF",
    incomingText: "#101012",
    placeholder: "rgba(16, 16, 18, 0.38)",
    panelEnd: "#EDEDEF",
    grabber: "rgba(16, 16, 18, 0.12)",
    chip: "rgba(16, 16, 18, 0.06)",
    lift: "0 10px 32px rgba(16, 16, 18, 0.10)",
  },
  dark: {
    bg: "#0A0A0C",
    surface: "#18181B",
    label: "#F5F5F7",
    secondary: "#8E8E93",
    tertiary: "#5C5C61",
    hairline: "rgba(245, 245, 247, 0.10)",
    rowPressed: "rgba(245, 245, 247, 0.07)",
    avatarRing: "#0A0A0C",
    seenRing: "rgba(245, 245, 247, 0.18)",
    outgoing: "#F5F5F7",
    outgoingText: "#101012",
    incomingText: "#F5F5F7",
    placeholder: "rgba(245, 245, 247, 0.40)",
    panelEnd: "#111114",
    grabber: "rgba(245, 245, 247, 0.16)",
    chip: "rgba(245, 245, 247, 0.08)",
    lift: "0 10px 32px rgba(0, 0, 0, 0.45)",
  },
} as const;

export type Scheme = keyof typeof Palette;
export type Theme = (typeof Palette)[Scheme];

export const Radius = {
  bubble: 26,
  card: 28,
  panel: 40,
  pill: 999,
} as const;

export const Space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
} as const;

/** Type ramp — iOS system font, one display size per screen. */
export const Type = {
  navTitle: { fontSize: 17, fontWeight: "600" as const, letterSpacing: -0.2 },
  name: { fontSize: 17, fontWeight: "600" as const, letterSpacing: -0.3 },
  body: {
    fontSize: 17,
    fontWeight: "400" as const,
    letterSpacing: -0.2,
    lineHeight: 23,
  },
  preview: {
    fontSize: 15,
    fontWeight: "400" as const,
    letterSpacing: -0.1,
    lineHeight: 20,
  },
  meta: { fontSize: 13, fontWeight: "400" as const, letterSpacing: -0.1 },
  caption: { fontSize: 11.5, fontWeight: "500" as const, letterSpacing: -0.1 },
  badge: { fontSize: 12, fontWeight: "600" as const },
} as const;
