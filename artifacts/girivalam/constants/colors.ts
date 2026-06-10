// ── "Sacred Dawn — Inspired by Arunachala" palette ────────────────────────
//
// Warm sand-white surfaces, sunlit temple stone, soft brass accents,
// Arunachala ember for important actions, and sage green for reflection.
// Every token NAME is preserved so existing screens continue working without
// breaking imports. Only VALUES are changed to match the Sacred Dawn home
// experience.

const Colors = {
  // Soft Brass — reverent accent for active states, icons, borders, badges
  primary: "#B08D57",
  primaryDark: "#8F7246",
  primaryLight: "#E8D7B8",
  primaryFaint: "#F3EADB",
  primaryMid: "#D97A3A", // Arunachala Ember for important actions

  // Arunachala Ember — inner flame, important CTAs, Girivalam highlights
  amber: "#D97A3A",
  amberLight: "#F2B17E",
  amberFaint: "#F9E4D3",

  // Sacred Dawn surfaces
  cream: "#F2EEE6", // Temple Stone — cards / secondary surfaces
  creamDark: "#E5DED2",
  warmWhite: "#FAF8F3", // Warm Sand White — main page background
  white: "#FFFFFF",

  // Text — calm, readable, warm
  text: "#2E2B27",
  textMid: "#6D665F",
  textLight: "#9C948B",
  textFaint: "#B8B0A6",

  // Lines, shadows, overlays
  border: "#DDD4C8",
  borderLight: "#EAE3D8",
  shadow: "rgba(80, 55, 28, 0.10)",
  shadowMed: "rgba(80, 55, 28, 0.18)",
  overlay: "rgba(46, 43, 39, 0.45)",
  overlayLight: "rgba(176, 141, 87, 0.12)",

  // Backward compatibility aliases
  saffron: "#D97A3A", // Arunachala Ember
  saffronDark: "#9A5A2E",
  saffronLight: "#F2B17E",

  brown: "#2E2B27",
  brownMid: "#6D665F",
  brownLight: "#9C948B",

  gold: "#B08D57",
  goldLight: "#E8D7B8",

  // Category accents
  green: "#A9B49A", // Sage Green — reflection / wisdom / community
  blue: "#7D9EAA", // muted dawn blue for calm informational elements
  purple: "#A998B8", // soft spiritual lavender
  teal: "#8FAEA4", // muted grounding teal
};

export default Colors;
