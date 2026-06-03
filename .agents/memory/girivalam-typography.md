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
alone. A `__fontScaled` flag prevents re-patching on Fast Refresh.
