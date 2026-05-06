import React, { useEffect, useRef } from "react";
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
  { lat: 12.2349, lng: 79.0676, title: "Arunachaleswarar Temple", subtitle: "Starting Point", color: "#B8410E" },
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

interface StopPoint {
  lat: number;
  lng: number;
  emoji: string;
  title: string;
  subtitle: string;
}

const STOP_POINTS: StopPoint[] = [
  { lat: 12.2238, lng: 79.0682, emoji: "🕉️", title: "Sri Ramana Ashram", subtitle: "Meditation hall · Free food 9–10 AM" },
  { lat: 12.2247, lng: 79.0689, emoji: "🕉️", title: "Seshadri Swamigal Ashram", subtitle: "Free food 12 PM onwards" },
  { lat: 12.2289, lng: 79.0712, emoji: "🛖", title: "Skandashram", subtitle: "Sacred cave on the hill" },
  { lat: 12.2278, lng: 79.0701, emoji: "🛖", title: "Virupaksha Cave", subtitle: "Ramana's meditation cave" },
  { lat: 12.2290, lng: 79.0782, emoji: "🕉️", title: "Yogi Ramsuratkumar Ashram", subtitle: "South-East side of path" },
  { lat: 12.2479, lng: 79.0541, emoji: "🛕", title: "Adi Annamalai Temple", subtitle: "Original Arunachaleswarar shrine" },
  { lat: 12.2348, lng: 79.0668, emoji: "🍛", title: "Annadanam – Main Temple", subtitle: "Free food all day" },
  { lat: 12.2340, lng: 79.0688, emoji: "💧", title: "Siva Ganga Theertham", subtitle: "Sacred water tank" },
  { lat: 12.2358, lng: 79.0651, emoji: "💧", title: "Brahma Theertham", subtitle: "Sacred bathing tank" },
  { lat: 12.2255, lng: 79.0660, emoji: "💧", title: "Agastya Theertham", subtitle: "South side water tank" },
  { lat: 12.2380, lng: 79.0710, emoji: "💧", title: "Ayyankulam", subtitle: "Large sacred tank" },
  { lat: 12.2310, lng: 79.0790, emoji: "🚻", title: "Rest Stop – East", subtitle: "Toilets & seating" },
  { lat: 12.2210, lng: 79.0620, emoji: "🚻", title: "Rest Stop – South", subtitle: "Toilets & water" },
  { lat: 12.2490, lng: 79.0630, emoji: "🚻", title: "Rest Stop – North", subtitle: "Shade & seating" },
  { lat: 12.2410, lng: 79.0790, emoji: "🏥", title: "Medical Help (Pournami)", subtitle: "First-aid post on full moon nights" },
  { lat: 12.2370, lng: 79.0760, emoji: "🅿️", title: "Pilgrim Parking", subtitle: "Near temple east entrance" },
];

interface UserLocation {
  lat: number;
  lng: number;
  recenter?: boolean;
}

export interface GirivalamMapProps {
  userLocation?: UserLocation | null;
  showStops?: boolean;
  height?: number;
  zoom?: number;
}

function buildMapHtml(zoom = 14): string {
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

  const stopsJson = JSON.stringify(STOP_POINTS);
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
    .stop-pin {
      width: 26px; height: 26px; border-radius: 50%;
      background: #ffffff; border: 2px solid #E8620A;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; line-height: 1;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .user-pulse {
      width: 20px; height: 20px; border-radius: 50%;
      background: #1E88E5; border: 3px solid #ffffff;
      box-shadow: 0 0 0 0 rgba(30, 136, 229, 0.6);
      animation: pulse 1.6s infinite;
    }
    .next-lingam-pin {
      width: 34px; height: 34px; border-radius: 50%;
      background: #9B3D12; border: 3px solid #ffffff;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: bold; color: white;
      box-shadow: 0 0 0 0 rgba(155,61,18,0.7);
      animation: lingam-pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(30, 136, 229, 0.6); }
      70% { box-shadow: 0 0 0 18px rgba(30, 136, 229, 0); }
      100% { box-shadow: 0 0 0 0 rgba(30, 136, 229, 0); }
    }
    @keyframes lingam-pulse {
      0% { box-shadow: 0 0 0 0 rgba(155,61,18,0.7); }
      70% { box-shadow: 0 0 0 14px rgba(155,61,18,0); }
      100% { box-shadow: 0 0 0 0 rgba(155,61,18,0); }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: true, attributionControl: true })
      .setView([${ARUNACHALA_CENTER[0]}, ${ARUNACHALA_CENTER[1]}], ${zoom});

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

    var lingamMarkers = [];
    ${markersJs.replace(/\.addTo\(map\)/g, '')}

    // Re-add markers collecting references
    var lingamData = ${JSON.stringify(MARKERS)};
    lingamData.forEach(function(m, i) {
      var marker = L.circleMarker([m.lat, m.lng], {
        radius: 9,
        fillColor: m.color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map).bindPopup('<b>' + m.title + '</b><br/>' + m.subtitle);
      lingamMarkers.push(marker);
    });

    var stopPoints = ${stopsJson};
    window.stopMarkers = [];
    window.stopsLayer = L.layerGroup();
    stopPoints.forEach(function(s) {
      var icon = L.divIcon({
        className: '',
        html: '<div class="stop-pin">' + s.emoji + '</div>',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      var m = L.marker([s.lat, s.lng], { icon: icon })
        .bindPopup('<b>' + s.title + '</b><br/>' + s.subtitle);
      window.stopMarkers.push(m);
      window.stopsLayer.addLayer(m);
    });

    window.setStopsVisible = function(visible) {
      if (visible) {
        if (!map.hasLayer(window.stopsLayer)) map.addLayer(window.stopsLayer);
      } else {
        if (map.hasLayer(window.stopsLayer)) map.removeLayer(window.stopsLayer);
      }
    };
    window.setStopsVisible(true);

    window.nextLingamMarker = null;
    window.highlightNextLingam = function(idx) {
      if (window.nextLingamMarker) {
        map.removeLayer(window.nextLingamMarker);
        window.nextLingamMarker = null;
      }
      if (idx < 0 || idx >= lingamData.length) return;
      var d = lingamData[idx];
      var icon = L.divIcon({
        className: '',
        html: '<div class="next-lingam-pin">' + (idx + 1) + '</div>',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      window.nextLingamMarker = L.marker([d.lat, d.lng], { icon: icon, zIndexOffset: 900 })
        .addTo(map)
        .bindPopup('<b>Next: ' + d.title + '</b><br/>' + d.subtitle);
    };

    window.userMarker = null;
    window.setUserLocation = function(lat, lng, recenter) {
      var icon = L.divIcon({
        className: '',
        html: '<div class="user-pulse"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      if (window.userMarker) {
        window.userMarker.setLatLng([lat, lng]);
      } else {
        window.userMarker = L.marker([lat, lng], { icon: icon, zIndexOffset: 1000 })
          .addTo(map).bindPopup('<b>You are here</b>');
      }
      if (recenter) {
        map.setView([lat, lng], Math.max(map.getZoom(), 15));
      }
    };

    function handleMessage(raw) {
      try {
        var data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!data) return;
        if (data.type === 'setUser') {
          window.setUserLocation(data.lat, data.lng, data.recenter);
        } else if (data.type === 'setStops') {
          window.setStopsVisible(!!data.visible);
        } else if (data.type === 'highlightLingam') {
          window.highlightNextLingam(data.idx);
        }
      } catch (e) {}
    }
    window.addEventListener('message', function(e) { handleMessage(e.data); });
    document.addEventListener('message', function(e) { handleMessage(e.data); });
  </script>
</body>
</html>`;
}

export function GirivalamMap({ userLocation, showStops = true, height = 320, zoom = 14 }: GirivalamMapProps) {
  const html = React.useMemo(() => buildMapHtml(zoom), [zoom]);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const webViewRef = useRef<WebView | null>(null);
  const isReady = useRef(false);

  function postToMap(payload: string) {
    if (Platform.OS === "web") {
      iframeRef.current?.contentWindow?.postMessage(payload, "*");
    } else {
      webViewRef.current?.injectJavaScript(`
        (function(){
          try {
            var data = ${JSON.stringify(payload)};
            var parsed = JSON.parse(data);
            if (parsed.type === 'setUser') {
              window.setUserLocation(parsed.lat, parsed.lng, parsed.recenter);
            } else if (parsed.type === 'setStops') {
              window.setStopsVisible(!!parsed.visible);
            } else if (parsed.type === 'highlightLingam') {
              window.highlightNextLingam(parsed.idx);
            }
          } catch(e){}
        })();
        true;
      `);
    }
  }

  useEffect(() => {
    if (!userLocation) return;
    const payload = JSON.stringify({
      type: "setUser",
      lat: userLocation.lat,
      lng: userLocation.lng,
      recenter: userLocation.recenter ?? false,
    });
    if (isReady.current) {
      postToMap(payload);
    } else {
      const t = setTimeout(() => { isReady.current = true; postToMap(payload); }, 800);
      return () => clearTimeout(t);
    }
  }, [userLocation]);

  useEffect(() => {
    const payload = JSON.stringify({ type: "setStops", visible: showStops });
    if (isReady.current) {
      postToMap(payload);
    } else {
      const t = setTimeout(() => { isReady.current = true; postToMap(payload); }, 800);
      return () => clearTimeout(t);
    }
  }, [showStops]);

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { height }]}>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          onLoad={() => { isReady.current = true; }}
          style={{ width: "100%", height: "100%", border: "none", borderRadius: 16 }}
          title="Girivalam Route Map"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={() => { isReady.current = true; }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.cream,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
});
