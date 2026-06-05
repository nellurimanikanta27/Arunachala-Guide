import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

// Customizes the root HTML document for the web build. Expo Router renders the
// app into <div id="root">, but by default that element only grows to fit its
// content — so when a screen is shorter than the viewport, the bottom tab bar
// floats in the middle with empty "negative space" beneath it instead of being
// locked to the bottom edge. Forcing html / body / #root to full height makes
// the navigator fill the viewport so the tab bar stays pinned to the very
// bottom, while each screen scrolls internally.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: fullHeightStyle }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const fullHeightStyle = `
html, body { height: 100%; margin: 0; padding: 0; }
body { overflow: hidden; }
/* Global on-screen magnification for the web build. Lower the zoom below to make
   the WHOLE UI (text + spacing + cards) less "zoomed in", not just the font.
   Because CSS zoom scales the rendered box, #root is sized to 100%/zoom on both
   axes so the scaled result still fills the viewport exactly — otherwise the
   locked bottom tab bar would leave an empty gap. If you change the 0.9 zoom,
   recompute the two 111.12% values as round(100 / zoom)%. */
#root {
  display: flex;
  flex: 1 1 auto;
  zoom: 1;
  width: 100%;
  height: 100%;
  min-height: 100%;
}
`;
