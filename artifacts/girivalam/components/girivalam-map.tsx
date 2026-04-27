import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import Colors from "@/constants/colors";

const ARUNACHALA_CENTER: [number, number] = [12.2386, 79.0677];

interface MapMarker {
  lat: number;
  lng: number;
  title: string;
  subtitle: string;
  color: string;
}

const MARKERS: MapMarker[] = [
  {
    lat: 12.2349,
    lng: 79.0676,
    title: "Arunachaleswarar Temple",
    subtitle: "Starting Point",
    color: "#B8410E",
  },
  { lat: 12.2330, lng: 79.0750, title: "1. Indra Lingam", subtitle: "East", color: "#E8620A" },
  { lat: 12.2264, lng: 79.0747, title: "2. Agni Lingam", subtitle: "South-East", color: "#E8620A" },
  { lat: 12.2195, lng: 79.0700, title: "3. Yama Lingam", subtitle: "South", color: "#E8620A" },
  { lat: 12.2237, lng: 79.0584, title: "4. Niruthi Lingam", subtitle: "South-West", color: "#E8620A" },
  { lat: 12.2322, lng: 79.0530, title: "5. Varuna Lingam", subtitle: "West", color: "#E8620A" },
  { lat: 12.2456, lng: 79.0571, title: "6. Vayu Lingam", subtitle: "North-West", color: "#E8620A" },
  { lat: 12.2516, lng: 79.0670, title: "7. Kubera Lingam", subtitle: "North", color: "#E8620A" },
  { lat: 12.2474, lng: 79.0764, title: "8. Isanya Lingam", subtitle: "North-East", color: "#E8620A" },
];

const ROUTE_PATH: [number, number][] = [
  [12.2349, 79.0676],
  [12.2330, 79.0750],
  [12.2264, 79.0747],
  [12.2195, 79.0700],
  [12.2237, 79.0584],
  [12.2322, 79.0530],
  [12.2456, 79.0571],
  [12.2516, 79.0670],
  [12.2474, 79.0764],
  [12.2349, 79.0676],
];

function buildMapHtml(): string {
  const markersJs = MARKERS.map(
    (m) => `
      L.circleMarker([${m.lat}, ${m.lng}], {
        radius: 9,
        fillColor: '${m.color}',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map).bindPopup('<b>${m.title}</b><br/>${m.subtitle}');`
  ).join("\n");

  const polylineCoords = JSON.stringify(ROUTE_PATH);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #FFF8EE; }
    .leaflet-popup-content { font-family: -apple-system, system-ui, sans-serif; font-size: 13px; color: #2A1810; }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: true, attributionControl: true })
      .setView([${ARUNACHALA_CENTER[0]}, ${ARUNACHALA_CENTER[1]}], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.polyline(${polylineCoords}, {
      color: '#E8620A',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 6'
    }).addTo(map);

    L.circle([${ARUNACHALA_CENTER[0]}, ${ARUNACHALA_CENTER[1]}], {
      radius: 800,
      color: '#8B4513',
      fillColor: '#D4A373',
      fillOpacity: 0.15,
      weight: 1
    }).addTo(map).bindPopup('<b>Arunachala Hill</b><br/>Sacred Mountain');

    ${markersJs}
  </script>
</body>
</html>`;
}

export function GirivalamMap() {
  const html = buildMapHtml();

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <iframe
          srcDoc={html}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: 16,
          }}
          title="Girivalam Route Map"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 320,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.cream,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
});
