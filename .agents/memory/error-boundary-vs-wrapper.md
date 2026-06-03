---
name: App ErrorBoundary vs Replit preview wrapper
description: How to tell an in-app render crash from a transient preview-load failure on Expo artifacts.
---

# Distinguishing crash sources on the Expo artifact

Two different "error" screens look like a crash but have different causes:

- **App's own ErrorBoundary** renders **"Something went wrong / Please reload the app to continue. [Try Again]"** (`components/ErrorFallback.tsx`). This fires only on a React **render** error inside the app (not event-handler errors). If a user sees THIS text, hunt for a render bug on the screen/interaction they describe.
- **Replit preview outer wrapper** renders **"Your <Artifact Title> artifact encountered an error."** This is NOT from app code — it means the **preview failed to load the artifact**, typically the expo-router **lazy-bundle "6000ms timeout exceeded"** during a slow cold load (common right after a post-merge workflow restart). It clears on reload and does not affect the published build (production bundles eagerly).

**Why:** Chasing a phantom in-app render bug wastes effort when the real signal is a transient dev-preview load timeout. The exact fallback wording is the fastest discriminator.

**How to apply:** Ask the user for the exact error wording. If it names the artifact title ("...artifact encountered an error"), treat it as a load/timeout flake: restart the expo workflow and cold-load a couple of routes via screenshots to confirm health, rather than editing screen code. Only dig into screen render code when they report "Something went wrong / reload to continue."
