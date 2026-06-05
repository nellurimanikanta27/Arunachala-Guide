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
- `app/welcome.tsx` — full-screen `LinearGradient` with hardcoded hex stops.
- `app/intro.tsx` — onboarding sky `LinearGradient` with hardcoded hex stops.
- `app/(tabs)/route-map.tsx` — dark map background `LinearGradient` hardcoded hex.
- `app/(tabs)/history.tsx` — its OWN local palette object `W = {...}` (Wisdom
  tab "parchment/paper" look), independent of `Colors`.

Current theme (2026-06): "Clean White" — white surfaces, graphite primary
(`#3A3A3C`) for actions/hero/active-tab (white text on it), soft brass-gold
accents (not green), charcoal text. Category `green`/`teal` tokens were
re-pointed to neutral slate/brass so no green hue remains. Onboarding
(welcome/intro) and the route-map screen stay intentionally dark, but
neutral-gray now (green removed). Replaced the prior teal-green "Sacred Hill",
which replaced the original brown/saffron "Sacred Minimalism".
