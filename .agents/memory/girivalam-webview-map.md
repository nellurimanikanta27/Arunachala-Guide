---
name: Girivalam WebView OSM map
description: How the in-app Leaflet/OSM map is rendered and the injection trap when feeding it untrusted POI data.
---

The route-map screen renders its map as a Leaflet + OpenStreetMap page inside
`react-native-webview` (component `RealGirivalamMap` in `app/(tabs)/route-map.tsx`).
The HTML is built as a template string and injected via the WebView `source.html`.

**Web preview limitation:** `react-native-webview` does NOT support web — the Expo
web preview shows "React Native WebView does not support this platform" where the map
should be. This is expected; the map only renders on a real native device. Do not
treat that preview message as a bug.

**Injection trap (two distinct boundaries):**
- `JSON.stringify(data).replace(/</g,'\\u003c')` only protects the `<script>`
  serialization boundary (stops `</script>` breakout). It does NOT make the values
  safe to drop into the DOM.
- Any POI field (name/subtitle) that later gets concatenated into HTML — e.g. Leaflet
  `marker.bindPopup('<div>'+p.name+'</div>')` or `divIcon` html — is a second
  boundary. OSM/Overpass tag values are attacker-controllable, so they must be
  HTML-escaped at that point with an `esc()` helper inside the inline script.
  **Why:** the WebView has the RN bridge enabled (`window.ReactNativeWebView.postMessage`),
  so popup HTML injection is a real trust-boundary crossing, not cosmetic.

**How to apply:** whenever you add new marker/popup/tooltip HTML built from POI or
any external data, run the text through `esc()` (escapes & < > " ') before
concatenating. Numbers/coords used as JS values are fine; only HTML-context strings
need escaping.
