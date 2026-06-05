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

Current theme (2026-06): "Sacred Hill" — serene teal-green primary
(`#2E7D72`), misty green-white surfaces, soft brass gold accents, cool
charcoal-green text. Replaced the earlier brown/saffron "Sacred Minimalism".
