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

Current theme (2026-06): "Pure White + Gold" — white surfaces everywhere, a
single soft-gold accent (`#C2A24E`, dark `#A6843E`, light `#DCC079`) for
actions/hero/active-tab/icons, quiet warm-gray text (`#4A4540`/`#6E6862`...).
User explicitly rejected ALL charcoal/graphite/dark fills and mixed colors —
wants white + a little gold only, peaceful/quiet. So: `primary*` family is gold
(NOT dark); every category accent token (`green`/`blue`/`purple`/`teal`) is
collapsed to the same gold so nothing is multi-colored. Onboarding `welcome.tsx`
and the launch splash `intro.tsx` were flipped from dark to white+gold via their
LOCAL consts (BG→white, CREAM→dark text, GOLD_LIGHT→gold, btnText→dark on gold).
STILL DARK: the route-map immersive "walk mode" sub-screen (local DARK_BG/
DARK_PANEL/CARD_BG `#18181A`, ~69 dark refs) — deliberate night-walk view, left
dark to avoid a risky redesign; offer to whiten if asked. Replaced prior
"Clean White" (graphite primary), "Sacred Hill" (teal), "Sacred Minimalism".
