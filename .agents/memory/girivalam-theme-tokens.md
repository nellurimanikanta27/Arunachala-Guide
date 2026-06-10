---
name: Girivalam theme / color tokens
description: Where the app's theme lives and which screens bypass the central token system.
---

# Theme color system

Most of the app is themed through the central token object in
`constants/colors.ts` (default export `Colors`). Retuning those VALUES reskins
nearly every screen because token NAMES are kept stable (incl. legacy aliases
like `saffron`, `brown`, `gold`).

**Why:** screens import `Colors.*` rather than hardcoding, so a palette change
is a single-file edit for the common case.

**How to apply — when changing the theme, also update these NON-tokenized spots
or the old palette bleeds through:**
- `app/welcome.tsx` — LOCAL consts (BG/CREAM/GOLD/GOLD_LIGHT/MUTED/FAINT) + a
  full-screen `LinearGradient` with hardcoded hex stops. MUTED/FAINT are the
  secondary-text/dot colors — they do NOT follow `Colors`, set them light for a
  dark bg or body text disappears.
- `app/intro.tsx` — LOCAL consts (BG/CREAM/GOLD/GOLD_LIGHT) + onboarding sky
  `LinearGradient` with hardcoded hex stops.
- `app/sadhana-practice.tsx` and `app/sadhana-complete.tsx` — do NOT import
  `Colors` at all; fully hardcoded with local consts `G`/`GF`/`GB` + many raw
  hexes (text/surface/border). Must be edited by hand on a theme change.
- `app/(tabs)/route-map.tsx` — dark map background `LinearGradient` hardcoded hex.
- `app/(tabs)/history.tsx` — its OWN local palette object `W = {...}` (Wisdom
  tab "parchment/paper" look), independent of `Colors`.
- `components/girivalam-map.tsx` — Leaflet HTML map, hardcoded light tiles/bg;
  intentionally left light (maps are conventionally light).

## `Colors.white` is overloaded — split, do not just invert
`Colors.white` is used BOTH as card/surface backgrounds AND as foreground
icons/text on bright accents (ember/gold buttons). You CANNOT make it dark to
get dark cards — that turns every accent-button icon/label dark-on-dark.
**Rule:** keep `Colors.white` = a true light value (`#FFFFFF`) for foregrounds,
and point card backgrounds at a dedicated dark surface token (`Colors.cream`).
**How to apply:** sed `backgroundColor: Colors.white` → `backgroundColor:
Colors.cream` across `app/` + `components/`, THEN set `white` light. Same trap
exists inside the sadhana files where `#FFFFFF` is both card bg AND button-icon
fg — convert only the background occurrences.

Current theme (2026-06): "Sacred Fire in Stillness" — dark Arunachala
night-temple. Deep charcoal page `#151515`, warm-dark cards `#1E1A15` / elevated
`#262019`; Sacred Ember Orange `#D46A1E` for actions/hero/active, Lamp Glow Gold
`#F7D98B`, Temple Bronze `#8B6A3F`; warm-ash light text
`#F7F4ED`/`#C7BFAF`/`#968D7E`/`#6E665B`. Every category accent token
(`green`/`blue`/`purple`/`teal`) collapsed to the ember so nothing is
multi-colored. Replaced the prior "Pure White + Gold" light theme. The
inversion was contrast-safe because old white-fg only sat on colored surfaces
and old dark-text only on light surfaces — symmetric flip — EXCEPT the
`Colors.white` overload above, which needed the split.
