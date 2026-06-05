// ── Pure White + Gold palette ───────────────────────────────────────────
// Everything white and quiet, with a single soft-gold accent — no charcoal,
// no dark fills, no mixed colors. Every token NAME is preserved for backward
// compatibility so all screens pick up the new look without per-screen
// rewrites; only the VALUES changed.
const Colors = {
  // Soft Gold — the single accent (actions / hero / active states)
  primary: "#C2A24E",
  primaryDark: "#A6843E",
  primaryLight: "#DCC079",
  primaryFaint: "#FBF5E6",
  primaryMid: "#B89240",

  // Gold highlights (same family)
  amber: "#C2A24E",
  amberLight: "#DCC079",
  amberFaint: "#FBF5E6",

  // White surfaces
  cream: "#FFFFFF",
  creamDark: "#F7F4ED",
  warmWhite: "#FFFFFF",
  white: "#FFFFFF",

  // Soft, quiet text — readable but never harsh/charcoal
  text: "#4A4540",
  textMid: "#6E6862",
  textLight: "#9A938B",
  textFaint: "#BCB6AE",

  border: "#EFE9DC",
  borderLight: "#F6F2EA",

  shadow: "rgba(120, 100, 50, 0.08)",
  shadowMed: "rgba(120, 100, 50, 0.14)",
  overlay: "rgba(60, 50, 30, 0.35)",
  overlayLight: "rgba(194, 162, 78, 0.10)",

  // aliases for backward compat with other screens
  saffron: "#C2A24E",
  saffronDark: "#A6843E",
  saffronLight: "#DCC079",
  brown: "#4A4540",
  brownMid: "#6E6862",
  brownLight: "#9A938B",
  gold: "#C2A24E",
  goldLight: "#DCC079",
  // category accents — all unified to the single soft gold (no mixed colors)
  green: "#C2A24E",
  blue: "#C2A24E",
  purple: "#C2A24E",
  teal: "#C2A24E",
};

export default Colors;
