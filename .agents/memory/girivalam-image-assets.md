---
name: Girivalam image assets
description: Which bundled images are usable as clean photos vs framed templates/mockups.
---
- `assets/images/girivalam-card-bg.png` is NOT a clean photo — it's a gold-framed share-card template with a stray "OPEN 12% (psm)" caption and multiple stacked panels. Do not use it as a full-bleed hero/background; cropping shows the frame or stray text.
- `assets/images/home-vision.png` and `walk-vision*.png` are app-UI concept mockups (phone screenshots), not usable as content imagery.

**Why:** Local Guide hero needed a hill photo; no bundled asset is a clean photo, and the user forbids paid image generation.
**How to apply:** For on-brand hero/banners, prefer a saffron `LinearGradient` (Colors.saffron→primaryDark) with text + a subtle Ionicons motif, as used on the Local Guide landing — reuse that pattern instead of hunting for a photo.
