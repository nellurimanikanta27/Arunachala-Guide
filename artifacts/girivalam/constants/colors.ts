// ── Clean White palette ─────────────────────────────────────────────────
// White surfaces · Graphite actions · Soft Brass Gold accents · Charcoal text.
// A calm, minimal "white temple" look — no green. Every token NAME is kept
// for backward compatibility so all screens pick up the new look without
// per-screen rewrites; only the VALUES changed.
const Colors = {
  // Graphite — primary brand / actions (reads on white, white text on it)
  primary: "#3A3A3C",
  primaryDark: "#1F1F21",
  primaryLight: "#6E6E73",
  primaryFaint: "#F2F2F3",
  primaryMid: "#48484A",

  // Soft Brass Gold — gentle accents / highlights (warm, not green)
  amber: "#C6A24A",
  amberLight: "#DBBE74",
  amberFaint: "#F6F0DD",

  // White surfaces
  cream: "#FFFFFF",      // primary surface
  creamDark: "#F2F2F2",  // subtle gray fill
  warmWhite: "#FAFAFA",  // app background
  white: "#FFFFFF",

  // Charcoal — text scale
  text: "#1C1C1E",
  textMid: "#48484A",
  textLight: "#8A8A8E",
  textFaint: "#B0B0B5",

  border: "#E5E5E7",
  borderLight: "#F0F0F2",

  shadow: "rgba(0, 0, 0, 0.08)",
  shadowMed: "rgba(0, 0, 0, 0.14)",
  overlay: "rgba(0, 0, 0, 0.50)",
  overlayLight: "rgba(0, 0, 0, 0.06)",

  // aliases for backward compat with other screens
  saffron: "#3A3A3C",
  saffronDark: "#1F1F21",
  saffronLight: "#6E6E73",
  brown: "#1C1C1E",
  brownMid: "#48484A",
  brownLight: "#8A8A8E",
  gold: "#C6A24A",
  goldLight: "#DBBE74",
  // Category accents — no green/teal; calm, distinct, neutral-leaning.
  green: "#7A828C",  // slate gray (formerly green)
  blue: "#5C7A99",
  purple: "#8A7A9E",
  teal: "#A6843E",   // muted brass (formerly teal)
};

export default Colors;
