---
name: Native-only startup crashes (Expo/Hermes/React 19)
description: Module-load-time mutations that pass on react-native-web but crash native at startup.
---

# Native-only startup crashes that the web preview hides

The Girivalam app runs on Expo (Hermes + React 19 New Architecture). The web preview
uses `react-native-web`, which is far more permissive than native. A change can render
perfectly in the screenshot tool and still crash on a real device.

## `Text.defaultProps` / `TextInput.defaultProps` font-scaling override
Mutating `Text.defaultProps = {...}` at module scope to set `allowFontScaling: false`
works on web but can throw `TypeError: Cannot assign to read only property` on native,
because `defaultProps` may be a non-writable property on the component object. ESM runs
in strict mode, so the assignment throws **at import time, before React mounts** — the
ErrorBoundary cannot catch it and the whole app red-screens with a "runtime error".

**Why:** read-only/frozen `defaultProps` on native + strict-mode assignment = hard throw
at module load, outside the React tree.

**How to apply:** never reassign `defaultProps` unguarded at module scope. Wrap the
mutation in try/catch so a non-writable platform degrades gracefully (font scaling stays
on) instead of crashing. See `app/_layout.tsx` `disableFontScaling()`.

**General rule:** any code that runs at module-load time (top-level side effects,
component-object mutation) bypasses the ErrorBoundary. If it can throw on any platform,
guard it — and remember the web preview will not surface native-only failures.
