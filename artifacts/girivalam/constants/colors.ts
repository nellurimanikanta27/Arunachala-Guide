// ── Sacred Minimalism palette ───────────────────────────────────────────
// Warm Ivory · Sandstone · Muted Gold · Soft Bronze · Deep Charcoal.
// Every token NAME below is preserved for backward compatibility so all
// screens pick up the calmer look without per-screen rewrites. Only the
// VALUES were re-tuned toward soft, spacious, low-saturation "temple at
// dawn" tones — no neon, no heavy glassmorphism.
const Colors = {
  // Soft Bronze — primary brand / actions
  primary: "#9A6A43",
  primaryDark: "#6E4A2C",
  primaryLight: "#B5885E",
  primaryFaint: "#F4EADF",
  primaryMid: "#835836",

  // Muted Gold — gentle accents / highlights
  amber: "#B8912E",
  amberLight: "#CDA64A",
  amberFaint: "#FAF3E2",

  // Warm Ivory + Sandstone — surfaces
  cream: "#F7EEDF",      // warm ivory
  creamDark: "#E8DAC2",  // sandstone
  warmWhite: "#FCF8F1",  // lightest ivory
  white: "#FFFFFF",

  // Deep Charcoal — text scale
  text: "#2B2520",
  textMid: "#5A4D40",
  textLight: "#8A7864",
  textFaint: "#B6A48C",

  border: "#E4D6C0",
  borderLight: "#F0E7D8",

  shadow: "rgba(74, 54, 30, 0.10)",
  shadowMed: "rgba(74, 54, 30, 0.16)",
  overlay: "rgba(43, 37, 32, 0.50)",
  overlayLight: "rgba(154, 106, 67, 0.10)",

  // aliases for backward compat with other screens
  saffron: "#9A6A43",
  saffronDark: "#6E4A2C",
  saffronLight: "#B5885E",
  brown: "#2B2520",
  brownMid: "#5A4D40",
  brownLight: "#8A7864",
  gold: "#B8912E",
  goldLight: "#CDA64A",
  // Calm, desaturated category accents (no neon) — gently distinct so the
  // expanded Local Guide categories read apart from one another.
  green: "#7E8B5A",
  blue: "#5C7A99",
  purple: "#8A7A9E",
  teal: "#5F8175",
};

export default Colors;
