---
name: Girivalam navigation
description: How the Girivalam app's tab nav, default landing, and hidden routes are wired and why.
---

# Girivalam navigation structure

Bottom nav is pilgrim-first, 5 tabs: Local Guide · Wisdom (history.tsx) · Map (route-map, center & visually emphasized) · Sadhana · Translator.

**Default landing = Local Guide**, achieved with two pieces that must stay in sync:
- `app/(tabs)/_layout.tsx` exports `unstable_settings = { initialRouteName: "local-guide" }`
- `app/(tabs)/index.tsx` is a `<Redirect href="/(tabs)/local-guide" />`
**Why both:** expo-router still resolves `/` and `/(tabs)` to the `index` route, so the redirect is what actually moves a cold open / `router.replace("/(tabs)")` onto Local Guide; `initialRouteName` anchors the tab back-behavior.

**Hidden but still routable** (`href: null` in the tab layout): `index`, `home`, `me`, `ai-guide`.
- `home.tsx` is the OLD dashboard, preserved (not deleted) but intentionally undiscoverable — Local Guide replaced it.
- `me` (profile/archive) is reached via the TopBar avatar, not a tab.
- `ai-guide` is superseded by the app-wide `FloatingAssistant` (draggable FAB reusing offline `findAnswer` from `lib/chatbot-knowledge.ts`); the screen is kept routable but off the bar.
**How to apply:** if you re-add a tab or change landing, update BOTH the redirect and `initialRouteName`. Don't "fix" hidden routes by exposing `home`/`ai-guide` — that's deliberate per the restructure spec.
