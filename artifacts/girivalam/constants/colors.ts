// ── Sacred Hill palette ─────────────────────────────────────────────────
// Serene Teal-Green · Misty Surfaces · Soft Brass Gold · Cool Charcoal.
// Inspired by the green hills, calm dawn air and quiet stillness around
// Arunachala — a peaceful, low-saturation "temple in the hills" mood.
// Every token NAME is preserved for backward compatibility so all screens
// pick up the new look without per-screen rewrites; only the VALUES changed.
const Colors = {
  // Serene Teal-Green — primary brand / actions
  primary: "#2E7D72",
  primaryDark: "#1C5A52",
  primaryLight: "#5AA89B",
  primaryFaint: "#E3F0EC",
  primaryMid: "#266B61",

  // Soft Brass Gold — gentle accents / highlights (spiritual warmth)
  amber: "#C6A24A",
  amberLight: "#DBBE74",
  amberFaint: "#F6F0DD",

  // Misty surfaces — calm, airy, faintly green-white
  cream: "#EEF4F1",      // soft misty paper
  creamDark: "#DBE7E1",  // pale sage
  warmWhite: "#F7FBF9",  // lightest mist
  white: "#FFFFFF",

  // Cool Charcoal-Green — text scale
  text: "#1E2A27",
  textMid: "#46564F",
  textLight: "#74837B",
  textFaint: "#A4B1A9",

  border: "#D6E3DC",
  borderLight: "#E8F0EB",

  shadow: "rgba(20, 60, 52, 0.10)",
  shadowMed: "rgba(20, 60, 52, 0.16)",
  overlay: "rgba(20, 38, 34, 0.50)",
  overlayLight: "rgba(46, 125, 114, 0.10)",

  // aliases for backward compat with other screens
  saffron: "#2E7D72",
  saffronDark: "#1C5A52",
  saffronLight: "#5AA89B",
  brown: "#1E2A27",
  brownMid: "#46564F",
  brownLight: "#74837B",
  gold: "#C6A24A",
  goldLight: "#DBBE74",
  // Calm, desaturated category accents (no neon) — gently distinct so the
  // expanded Local Guide categories read apart from one another and from
  // the teal-green primary.
  green: "#6E9A6A",
  blue: "#5C7A99",
  purple: "#8A7A9E",
  teal: "#4E8C9E",
};

export default Colors;
