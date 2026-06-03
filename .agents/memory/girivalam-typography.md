---
name: Girivalam global typography / font scaling
description: How to change text size app-wide when there is no central type scale.
---

# Global font scaling

There is **no central type scale** in this app — `fontSize` is hardcoded at ~400+
call sites across screens (constants/ only holds colors). To change text size
app-wide, do NOT edit call sites. Instead use the single `FONT_SCALE` constant in
`app/_layout.tsx`, which patches `Text.render` / `TextInput.render` once at module
load to multiply every explicit `fontSize` by that factor (1 = no change, 0.9 = 10%
smaller).

**Why:** editing hundreds of hardcoded sizes is error-prone and unreviewable; one
multiplier is tunable and reversible.

**How to apply:** to make the whole app's text bigger/smaller, change `FONT_SCALE`
only. The patch is guarded in try/catch (same reasoning as the `disableFontScaling`
Text.defaultProps mutation right above it — module-load mutations can be read-only
on native/Hermes and would otherwise crash before mount). It only scales styles
that declare a numeric `fontSize`; text relying on the RN default (~14) is left
alone. A `__fontScaled` flag prevents re-patching on Fast Refresh. It also skips
icon fonts (Ionicons/MaterialCommunityIcons/etc. via `ICON_FONT_RE`) so glyph
icons keep their intended size — `FONT_SCALE` is for words, not icons.

# Overall magnification (web "zoom")

"Reduce font" only shrinks text; if the user says the whole **structure/layout
looks zoomed**, scale font + spacing + cards together via the web-only CSS `zoom`
on `#root` in `app/+html.tsx` (not by editing spacing at call sites).

**Why:** spacing/padding/card sizes are hardcoded everywhere too; one `zoom` knob
de-magnifies everything proportionally.

**How to apply:** lower the `zoom` value on `#root`. CRITICAL: because `zoom`
scales the rendered box, `#root` width AND height must be set to `100/zoom %`
(e.g. zoom 0.9 → 111.12%) or the full-height layout shrinks and the locked bottom
tab bar leaves an empty gap at the bottom. This is web-only (CSS); native gets no
zoom. `FONT_SCALE` and `zoom` stack on web (net text ≈ FONT_SCALE × zoom).
