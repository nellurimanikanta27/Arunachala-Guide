import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GirivalamMap } from "@/components/girivalam-map";
import Colors from "@/constants/colors";

interface UserLoc {
  lat: number;
  lng: number;
  recenter?: boolean;
}

const GOOGLE_MAPS_NAVIGATION =
  "https://maps.google.com/maps?saddr=My+Location&daddr=Arunachaleswarar+Temple,+Tiruvannamalai&travelmode=walking";
void GOOGLE_MAPS_NAVIGATION;

interface Lingam {
  number: number;
  name: string;
  direction: string;
  description: string;
  distance: string;
  lat: number;
  lng: number;
  meaning: string;
}

const LINGAMS: Lingam[] = [
  { number: 1, name: "Indra Lingam", direction: "East", description: "Near the main Arunachaleswarar Temple entrance", distance: "0 km", lat: 12.2330, lng: 79.0750, meaning: "East. The lingam of beginnings. The walk truly starts here — walk with intention." },
  { number: 2, name: "Agni Lingam", direction: "South-East", description: "Associated with fire element, near Kottai area", distance: "2 km", lat: 12.2264, lng: 79.0747, meaning: "Fire. Sit briefly. What do you want to burn away on this walk?" },
  { number: 3, name: "Yama Lingam", direction: "South", description: "South direction shrine", distance: "3.5 km", lat: 12.2195, lng: 79.0700, meaning: "South — the direction of endings, of letting go. If something wants to release here, let it." },
  { number: 4, name: "Niruthi Lingam", direction: "South-West", description: "Marking the south-west quarter of the hill", distance: "5 km", lat: 12.2237, lng: 79.0584, meaning: "South-West. The halfway turning. You have come this far. Keep walking." },
  { number: 5, name: "Varuna Lingam", direction: "West", description: "Water element shrine on western path", distance: "7 km", lat: 12.2322, lng: 79.0530, meaning: "Water. Let something soften inside you. The path is older here." },
  { number: 6, name: "Vayu Lingam", direction: "North-West", description: "Wind element, scenic forest section", distance: "9 km", lat: 12.2456, lng: 79.0571, meaning: "Wind. The wild forest section. The hill feels very close here. Walk slowly." },
  { number: 7, name: "Kubera Lingam", direction: "North", description: "Prosperity shrine near northern path", distance: "11 km", lat: 12.2516, lng: 79.0670, meaning: "North — the abundance of stillness, not of things. The quieter half." },
  { number: 8, name: "Isanya Lingam", direction: "North-East", description: "Last major shrine before completing the circle", distance: "13 km", lat: 12.2474, lng: 79.0764, meaning: "Almost home. Something is completing. Let yourself feel it." },
];

const GEOFENCE_RADIUS_M = 150;

function haversineDistanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

type POIKind = "food" | "water" | "washroom";
interface POI { kind: POIKind; lat: number; lng: number; name: string; subtitle?: string; }

const POIS: POI[] = [
  { kind: "food", lat: 12.2238, lng: 79.0682, name: "Sri Ramana Ashram", subtitle: "Free food 9–10 AM" },
  { kind: "food", lat: 12.2247, lng: 79.0689, name: "Seshadri Swamigal Ashram", subtitle: "Free food 12 PM onwards" },
  { kind: "food", lat: 12.2348, lng: 79.0668, name: "Annadanam – Main Temple", subtitle: "Free food all day" },
  { kind: "water", lat: 12.2340, lng: 79.0688, name: "Siva Ganga Theertham", subtitle: "Sacred water tank" },
  { kind: "water", lat: 12.2358, lng: 79.0651, name: "Brahma Theertham", subtitle: "Sacred bathing tank" },
  { kind: "water", lat: 12.2255, lng: 79.0660, name: "Agastya Theertham", subtitle: "South side water tank" },
];

interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  category: "guided" | "teaching" | "chant" | "music";
}

const AUDIO_TRACKS: AudioTrack[] = [
  { id: "mental-girivalam", title: "Guided Mental Girivalam", subtitle: "Inner walk around the hill, in 25 minutes", duration: "25 min", category: "guided" },
  { id: "who-am-i", title: "Who Am I?", subtitle: "Ramana's central teaching, read aloud", duration: "12 min", category: "teaching" },
  { id: "ramana-talks", title: "Talks with Ramana — Selected", subtitle: "Short passages, one at a time", duration: "8 min", category: "teaching" },
  { id: "aksharamanamalai", title: "Aksharamanamalai", subtitle: "Ramana's 108-verse hymn to Arunachala (Tamil)", duration: "18 min", category: "chant" },
  { id: "om-namah-shivaya", title: "Om Namah Shivaya", subtitle: "Continuous chant for the walk", duration: "30 min", category: "chant" },
  { id: "arunachala-shiva", title: "Arunachala Shiva", subtitle: "Devotional chant", duration: "20 min", category: "chant" },
  { id: "bhajans", title: "Bhajans of Tiruvannamalai", subtitle: "Traditional devotional songs", duration: "45 min", category: "music" },
];

interface SpecialLingam {
  emoji: string;
  name: string;
  description: string;
}

const SPECIAL_LINGAMS: SpecialLingam[] = [
  { emoji: "☀️", name: "Surya Lingam", description: "Sacred shrine of the Sun — worshipping here bestows health, vitality, and divine light" },
  { emoji: "🌙", name: "Chandra Lingam", description: "Sacred shrine of the Moon — brings peace of mind, emotional balance, and inner calm" },
  { emoji: "🛕", name: "Sunai Lingam", description: "A revered Lingam on the Girivalam path, deeply connected to the ancient traditions of Arunachala" },
];

const TIP_ITEMS = [
  { icon: "time-outline" as const, text: "Best time: Early morning (4–7 AM) or after sunset (6–10 PM)" },
  { icon: "footsteps-outline" as const, text: "Walk barefoot on the path for full spiritual benefit" },
  { icon: "water-outline" as const, text: "Carry enough water — minimal shops in some sections" },
  { icon: "shirt-outline" as const, text: "Wear comfortable traditional or modest clothing" },
  { icon: "moon-outline" as const, text: "Pournami (full moon) nights are especially auspicious" },
  { icon: "people-outline" as const, text: "Stay with the crowd on busy Pournami nights for safety" },
];

function openMaps(url: string) {
  Linking.openURL(url).catch(() =>
    Alert.alert("Cannot Open Maps", "Please install Google Maps or check your internet connection.")
  );
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export default function RouteMapScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 0 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  // Map & tracking state
  const [userLocation, setUserLocation] = useState<UserLoc | null>(null);
  const [tracking, setTracking] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [showStops, setShowStops] = useState(true);
  const watchSubRef = useRef<Location.LocationSubscription | null>(null);
  const webWatchIdRef = useRef<number | null>(null);

  // Japa counter
  const [japaCount, setJapaCount] = useState(0);
  const [japaTarget, setJapaTarget] = useState(108);

  // Walk mode
  const [walkMode, setWalkMode] = useState(false);
  const [walkSeconds, setWalkSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const omPulse = useRef(new Animated.Value(0.4)).current;

  // Saved moments at each lingam (in-memory; persistence next pass)
  const [savedMoments, setSavedMoments] = useState<Record<number, string[]>>({});
  const [dismissedFor, setDismissedFor] = useState<number | null>(null);
  // Clear "just keep walking" once the pilgrim leaves the geofence,
  // so re-arrival at the same lingam shows the rich card again.
  useEffect(() => {
    if (activeGeofenceIdx === null && dismissedFor !== null) {
      setDismissedFor(null);
    }
  }, [activeGeofenceIdx, dismissedFor]);

  // Edge panel (quick-access drawer during walk)
  const [edgePanelOpen, setEdgePanelOpen] = useState(false);
  const edgeSlide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.timing(edgeSlide, {
      toValue: edgePanelOpen ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [edgePanelOpen, edgeSlide]);

  // In-app navigation mode
  const [navMode, setNavMode] = useState(false);
  const [navLingamIdx, setNavLingamIdx] = useState(0);

  // Geofence detection — which lingam are you inside (within 150m)
  const [activeGeofenceIdx, setActiveGeofenceIdx] = useState<number | null>(null);
  const lastEnteredRef = useRef<number | null>(null);

  // Nearest lingam computation
  const nearest = (() => {
    if (!userLocation) return null;
    let bestIdx = 0;
    let bestDist = Infinity;
    LINGAMS.forEach((l, i) => {
      const d = haversineDistanceM(userLocation.lat, userLocation.lng, l.lat, l.lng);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    return { idx: bestIdx, distance: bestDist, lingam: LINGAMS[bestIdx] };
  })();

  // Geofence trigger — fires when you enter the 150m radius of a lingam
  useEffect(() => {
    if (!userLocation) { setActiveGeofenceIdx(null); lastEnteredRef.current = null; return; }
    if (!nearest) return;

    // Enter: if nearest is within radius, mark it active (unless already active)
    if (nearest.distance <= GEOFENCE_RADIUS_M && lastEnteredRef.current !== nearest.idx) {
      lastEnteredRef.current = nearest.idx;
      setActiveGeofenceIdx(nearest.idx);
      return;
    }

    // Exit: check distance from the *currently active* geofence, not just nearest
    if (activeGeofenceIdx !== null) {
      const active = LINGAMS[activeGeofenceIdx];
      const dActive = haversineDistanceM(userLocation.lat, userLocation.lng, active.lat, active.lng);
      if (dActive > GEOFENCE_RADIUS_M + 50) {
        lastEnteredRef.current = null;
        setActiveGeofenceIdx(null);
      }
    }
  }, [userLocation?.lat, userLocation?.lng, nearest?.idx, nearest?.distance, activeGeofenceIdx]);

  // Timer for walk mode
  useEffect(() => {
    if (walkMode) {
      timerRef.current = setInterval(() => setWalkSeconds((s) => s + 1), 1000);
      // Om pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(omPulse, { toValue: 0.9, duration: 3000, useNativeDriver: true }),
          Animated.timing(omPulse, { toValue: 0.4, duration: 3000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      omPulse.stopAnimation();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [walkMode]);

  // Cleanup location on unmount
  useEffect(() => {
    return () => {
      watchSubRef.current?.remove();
      watchSubRef.current = null;
      if (Platform.OS === "web" && webWatchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(webWatchIdRef.current);
        webWatchIdRef.current = null;
      }
    };
  }, []);

  async function startTracking() {
    if (tracking) { stopTracking(); return; }
    setRequesting(true);
    try {
      if (Platform.OS === "web") {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          Alert.alert("Not Supported", "Your browser does not support location tracking.");
          return;
        }
        webWatchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, recenter: !tracking });
            setTracking(true);
          },
          (err) => {
            Alert.alert("Location Unavailable", err.message || "Please allow location access in your browser.");
            setTracking(false);
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Location Permission Denied", "Please allow location access in your phone settings.");
          return;
        }
        watchSubRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 10000, distanceInterval: 20 },
          (loc) => {
            setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude, recenter: !tracking });
            setTracking(true);
          }
        );
      }
    } catch {
      Alert.alert("Error", "Could not start location tracking.");
    } finally {
      setRequesting(false);
    }
  }

  function stopTracking() {
    watchSubRef.current?.remove();
    watchSubRef.current = null;
    if (Platform.OS === "web" && webWatchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.clearWatch(webWatchIdRef.current);
      webWatchIdRef.current = null;
    }
    setTracking(false);
  }

  function beginWalk() {
    setJapaCount(0);
    setWalkSeconds(0);
    setWalkMode(true);
  }

  function endWalk() {
    setWalkMode(false);
  }

  function openNavMode() {
    setNavLingamIdx(0);
    setNavMode(true);
    // Auto-start tracking if not already
    if (!tracking) startTracking();
  }

  function exitNavMode() {
    setNavMode(false);
  }

  function handleEssential(kind: "water" | "food" | "washroom" | "emergency") {
    if (kind === "emergency") {
      Alert.alert(
        "Emergency contacts",
        "• Ambulance: 108\n• Police: 100\n• Government Hospital, Tiruvannamalai: 04175 222 444\n• Arunachaleswarar Temple office: 04175 252 438\n\nIf you are in immediate danger, call 108 right away."
      );
      return;
    }
    if (kind === "washroom") {
      Alert.alert(
        "Washrooms on the path",
        "Public washrooms are available at:\n• Arunachaleswarar Temple\n• Sri Ramana Ashram\n• Seshadri Swamigal Ashram\n• Most ashrams along the path\n\nA full washroom map is being added. For now, ask at the nearest temple or ashram."
      );
      return;
    }
    if (!userLocation) {
      Alert.alert(
        kind === "food" ? "Find free food" : "Find water",
        "Tap 'Find me on the path' first so the app knows where you are. Then it will show the nearest " + kind + "."
      );
      return;
    }
    const candidates = POIS.filter((p) => p.kind === kind);
    if (candidates.length === 0) {
      Alert.alert("Coming soon", "More locations being added.");
      return;
    }
    let best = candidates[0];
    let bestD = haversineDistanceM(userLocation.lat, userLocation.lng, best.lat, best.lng);
    for (let i = 1; i < candidates.length; i++) {
      const d = haversineDistanceM(userLocation.lat, userLocation.lng, candidates[i].lat, candidates[i].lng);
      if (d < bestD) { bestD = d; best = candidates[i]; }
    }
    Alert.alert(
      kind === "food" ? "Nearest free food (annadanam)" : "Nearest water",
      `${best.name}\n${best.subtitle ? best.subtitle + "\n" : ""}${formatDistance(bestD)} away`
    );
  }

  function saveMoment(lingamIdx: number, kind: "photo" | "voice" | "note" | "feeling") {
    setSavedMoments((prev) => {
      const existing = prev[lingamIdx] ?? [];
      if (existing.includes(kind)) return prev;
      return { ...prev, [lingamIdx]: [...existing, kind] };
    });
    const label = { photo: "Photo", voice: "Voice note", note: "Written note", feeling: "Feeling" }[kind];
    const lingamName = LINGAMS[lingamIdx]?.name ?? "this lingam";
    Alert.alert(
      `${label} — ${lingamName}`,
      `Your ${label.toLowerCase()} is being remembered for this moment.\n\nCapture and storage are being added in the next pass. For now, the timeline will show that you marked this moment.`
    );
  }

  function playTrack(track: AudioTrack) {
    Alert.alert(
      track.title,
      `${track.subtitle}\n\nDuration: ${track.duration}\n\nAudio file coming soon — this will play through your earphones while you walk.`
    );
  }

  // ─── IN-APP NAVIGATION MODE ───────────────────────────────────────────────
  if (navMode) {
    const currentLingam = LINGAMS[navLingamIdx];
    const nearbyWater = [
      "Siva Ganga Theertham", "Agastya Theertham", "Ayyankulam", "Brahma Theertham"
    ][navLingamIdx % 4];

    return (
      <View style={nStyles.root}>
        {/* Top bar */}
        <View style={[nStyles.topBar, { paddingTop: topInset + 10 }]}>
          <Pressable onPress={exitNavMode} style={nStyles.backBtn} accessibilityRole="button">
            <Ionicons name="chevron-back" size={20} color={Colors.white} />
            <Text style={nStyles.backBtnText}>Exit</Text>
          </Pressable>
          <View style={nStyles.topCenter}>
            <View style={nStyles.navDot} />
            <Text style={nStyles.topTitle}>Navigating Girivalam</Text>
          </View>
          <View style={{ width: 64 }} />
        </View>

        {/* Full map */}
        <GirivalamMap
          userLocation={userLocation}
          showStops={true}
          height={420}
          zoom={15}
        />

        {/* Location status */}
        {!tracking ? (
          <Pressable style={nStyles.locationBanner} onPress={startTracking}>
            <Ionicons name="locate-outline" size={16} color={Colors.amber} />
            <Text style={nStyles.locationBannerText}>
              Tap to show your live position on the map
            </Text>
          </Pressable>
        ) : (
          <View style={[nStyles.locationBanner, nStyles.locationBannerActive]}>
            <View style={nStyles.liveDot} />
            <Text style={[nStyles.locationBannerText, { color: Colors.amberLight }]}>
              Live location active — your dot is on the map
            </Text>
          </View>
        )}

        {/* Next lingam selector */}
        <View style={nStyles.lingamNav}>
          <Pressable
            style={[nStyles.lingamNavBtn, navLingamIdx === 0 && nStyles.lingamNavBtnDisabled]}
            onPress={() => setNavLingamIdx((i) => Math.max(0, i - 1))}
            disabled={navLingamIdx === 0}
          >
            <Ionicons name="chevron-back" size={18} color={navLingamIdx === 0 ? Colors.border : Colors.primary} />
          </Pressable>
          <View style={nStyles.lingamInfo}>
            <Text style={nStyles.lingamInfoNum}>{navLingamIdx + 1} / 8</Text>
            <Text style={nStyles.lingamInfoName}>{currentLingam.name}</Text>
            <Text style={nStyles.lingamInfoDir}>{currentLingam.direction} · {currentLingam.distance}</Text>
          </View>
          <Pressable
            style={[nStyles.lingamNavBtn, navLingamIdx === 7 && nStyles.lingamNavBtnDisabled]}
            onPress={() => setNavLingamIdx((i) => Math.min(7, i + 1))}
            disabled={navLingamIdx === 7}
          >
            <Ionicons name="chevron-forward" size={18} color={navLingamIdx === 7 ? Colors.border : Colors.primary} />
          </Pressable>
        </View>

        {/* Info row */}
        <View style={[nStyles.infoRow, { paddingBottom: bottomInset + 12 }]}>
          <View style={nStyles.infoCard}>
            <Text style={nStyles.infoCardIcon}>🛕</Text>
            <View>
              <Text style={nStyles.infoCardLabel}>This lingam</Text>
              <Text style={nStyles.infoCardText} numberOfLines={2}>{currentLingam.description}</Text>
            </View>
          </View>
          <View style={nStyles.infoCard}>
            <Text style={nStyles.infoCardIcon}>💧</Text>
            <View>
              <Text style={nStyles.infoCardLabel}>Nearby water</Text>
              <Text style={nStyles.infoCardText}>{nearbyWater}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ─── WALK MODE SCREEN ─────────────────────────────────────────────────────
  if (walkMode) {
    const distKm = (walkSeconds / 3600) * 3;
    const lingamIdx = Math.min(7, Math.floor(distKm / 1.75));
    const nextLingamIdx = Math.min(7, lingamIdx + (distKm > 0 ? 1 : 0));
    const nextLingam = LINGAMS[nextLingamIdx];
    const timeStr = formatTime(walkSeconds);
    const malasDone = japaCount > 0 && japaCount % 108 === 0;

    return (
      <View style={wStyles.root}>
        <LinearGradient
          colors={["#1A0500", "#3A0F00", "#5C1A00"]}
          style={wStyles.gradient}
        >
          {/* Top status bar */}
          <View style={[wStyles.topBar, { paddingTop: topInset + 12 }]}>
            <View style={wStyles.walkingBadge}>
              <View style={wStyles.walkingDot} />
              <Text style={wStyles.walkingBadgeText}>
                {distKm > 0 ? `${distKm.toFixed(1)} km covered` : "Walking"}
              </Text>
            </View>
            <Text style={wStyles.timerText}>{timeStr}</Text>
            <Pressable
              onPress={endWalk}
              style={wStyles.endBtn}
              accessibilityRole="button"
              accessibilityLabel="End walk"
            >
              <Text style={wStyles.endBtnText}>End</Text>
            </Pressable>
          </View>

          {/* Lingam progress dots */}
          <View style={wStyles.lingamDots}>
            {LINGAMS.map((l, i) => (
              <View
                key={l.number}
                style={[wStyles.dot, i <= lingamIdx && wStyles.dotActive]}
              />
            ))}
          </View>

          {/* TAP ANYWHERE = +1 japa */}
          <Pressable
            style={wStyles.tapArea}
            onPress={() => setJapaCount((c) => c + 1)}
            accessibilityRole="button"
            accessibilityLabel="Count one chant"
          >
            <Text style={wStyles.japaBig}>{japaCount}</Text>
            <Text style={wStyles.tapHint}>TAP ANYWHERE TO COUNT</Text>
            {malasDone && (
              <View style={wStyles.malaBanner}>
                <Text style={wStyles.malaBannerText}>
                  🙏 {japaCount / 108} mala complete
                </Text>
              </View>
            )}

            {/* Pulsing Om */}
            <Animated.View style={[wStyles.omCircle, { opacity: omPulse }]}>
              <MaterialCommunityIcons name="om" size={34} color="rgba(255,255,255,0.7)" />
            </Animated.View>
            <Text style={wStyles.mantraText}>Om Namah Shivaya</Text>
          </Pressable>

          {/* ─── Morphing lingam banner ───────────────────────────────────
              Three states based on real GPS distance to the nearest lingam:
              ① FAR  (> 300 m)         → tiny "Approaching X" line
              ② NEAR (≤ 300 m)         → softer card with meaning preview
              ③ AT   (geofence active) → rich "You have reached" + save moment
          ─────────────────────────────────────────────────────────────────── */}
          {(() => {
            // ③ AT — arrived (geofence triggered)
            if (activeGeofenceIdx !== null && dismissedFor !== activeGeofenceIdx) {
              const here = LINGAMS[activeGeofenceIdx];
              const saved = savedMoments[activeGeofenceIdx] ?? [];
              const isSaved = (k: string) => saved.includes(k);
              return (
                <View style={wStyles.arrivalCard}>
                  <View style={wStyles.arrivalHead}>
                    <Text style={wStyles.arrivalLabel}>YOU HAVE REACHED</Text>
                    <Text style={wStyles.arrivalName}>{here.name}</Text>
                    <Text style={wStyles.arrivalMeaning}>{here.meaning}</Text>
                  </View>

                  <View style={wStyles.arrivalSaveSection}>
                    <Text style={wStyles.arrivalSaveHint}>Save this moment</Text>
                    <View style={wStyles.arrivalSaveRow}>
                      {([
                        { k: "photo",   icon: "📷", l: "Photo" },
                        { k: "voice",   icon: "🎙️", l: "Voice" },
                        { k: "note",    icon: "✍️", l: "Note" },
                        { k: "feeling", icon: "❤️", l: "Feeling" },
                      ] as const).map((b) => (
                        <Pressable
                          key={b.k}
                          style={wStyles.arrivalSaveBtn}
                          onPress={() => saveMoment(activeGeofenceIdx, b.k)}
                          accessibilityRole="button"
                          accessibilityLabel={`Save ${b.l.toLowerCase()}`}
                        >
                          <View style={[wStyles.arrivalSaveIcon, isSaved(b.k) && wStyles.arrivalSaveIconActive]}>
                            <Text style={wStyles.arrivalSaveEmoji}>{b.icon}</Text>
                          </View>
                          <Text style={wStyles.arrivalSaveLabel}>{isSaved(b.k) ? `${b.l} ✓` : b.l}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <Pressable
                    style={wStyles.arrivalDismiss}
                    onPress={() => setDismissedFor(activeGeofenceIdx)}
                    accessibilityRole="button"
                    accessibilityLabel="Just keep walking"
                  >
                    <Text style={wStyles.arrivalDismissText}>Just keep walking</Text>
                  </Pressable>
                </View>
              );
            }

            // ② NEAR — within 300 m, show meaning preview
            if (nearest && nearest.distance <= 300) {
              return (
                <View style={wStyles.nearCard}>
                  <View style={wStyles.nearHead}>
                    <View style={wStyles.nearDot} />
                    <Text style={wStyles.nearLabel}>
                      {nearest.lingam.name.toUpperCase()} · {formatDistance(nearest.distance)}
                    </Text>
                  </View>
                  <Text style={wStyles.nearMeaning}>{nearest.lingam.meaning}</Text>
                </View>
              );
            }

            // ① FAR — gentle "approaching" line, only if a lingam is reasonably ahead
            if (nearest && nearest.distance <= 2500) {
              return (
                <View style={wStyles.farBanner}>
                  <View style={wStyles.farDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={wStyles.farTitle}>Approaching {nearest.lingam.name}</Text>
                    <Text style={wStyles.farSub}>
                      {nearest.lingam.direction} · {formatDistance(nearest.distance)} ahead
                    </Text>
                  </View>
                </View>
              );
            }

            return null;
          })()}

          {/* Edge tab — always visible thin handle on the right when panel closed */}
          {!edgePanelOpen && (
            <Pressable
              style={[wStyles.edgeTab, { top: "45%" }]}
              onPress={() => setEdgePanelOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Open quick access"
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={16} color="rgba(255,255,255,0.7)" />
            </Pressable>
          )}

          {/* Backdrop dim when panel open */}
          {edgePanelOpen && (
            <Pressable
              style={wStyles.edgeBackdrop}
              onPress={() => setEdgePanelOpen(false)}
              accessibilityLabel="Close quick access"
            />
          )}

          {/* The edge panel — slides in from right */}
          <Animated.View
            style={[
              wStyles.edgePanel,
              {
                pointerEvents: edgePanelOpen ? "auto" : "none",
                top: topInset + 80,
                bottom: bottomInset + 110,
                transform: [
                  {
                    translateX: edgeSlide.interpolate({
                      inputRange: [0, 1],
                      outputRange: [260, 0],
                    }),
                  },
                ],
                opacity: edgeSlide,
              },
            ]}
          >
            <View style={wStyles.edgePanelHeader}>
              <Text style={wStyles.edgePanelLabel}>QUICK</Text>
              <Pressable
                onPress={() => setEdgePanelOpen(false)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
              {[
                { key: "annaprasadam", icon: "🍛", label: "Annaprasadam", sub: "Free food · donations", onPress: () => { setEdgePanelOpen(false); handleEssential("food"); } },
                { key: "restaurants",  icon: "🍴", label: "Restaurants",  sub: "Nearby", onPress: () => { setEdgePanelOpen(false); Alert.alert("Restaurants nearby", "Manna Restaurant (near temple) · Dreaming Tree Cafe (Ramana Nagar) · Shanti Cafe · German Bakery · Usha Inn\n\nA curated guide is being added."); } },
                { key: "washrooms",    icon: "🚻", label: "Washrooms",    sub: "On the path", onPress: () => { setEdgePanelOpen(false); handleEssential("washroom"); } },
                { key: "audiobooks",   icon: "📖", label: "Audio books",  sub: "Ramana · Talks", onPress: () => { setEdgePanelOpen(false); Alert.alert("Audio books", "Talks with Ramana — Selected (8 min)\nWho Am I? (12 min)\nGuided Mental Girivalam (25 min)\n\nFor your earphones. Recordings being added."); } },
                { key: "music",        icon: "🎵", label: "Music",        sub: "Chants · Bhajans", onPress: () => { setEdgePanelOpen(false); Alert.alert("Music", "Om Namah Shivaya chant (30 min)\nArunachala Shiva chant (20 min)\nAksharamanamalai (18 min)\nBhajans of Tiruvannamalai (45 min)\n\nFor your earphones. Recordings being added."); } },
                { key: "japa",         icon: "📿", label: "Japa counter", sub: `${japaCount} / ${japaTarget}`, onPress: () => { setEdgePanelOpen(false); } },
              ].map((item) => (
                <Pressable
                  key={item.key}
                  style={wStyles.edgeItem}
                  onPress={item.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <View style={wStyles.edgeItemIcon}>
                    <Text style={wStyles.edgeItemEmoji}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={wStyles.edgeItemLabel}>{item.label}</Text>
                    <Text style={wStyles.edgeItemSub}>{item.sub}</Text>
                  </View>
                </Pressable>
              ))}
              <Text style={wStyles.edgeFooter}>Tap the tab anytime</Text>
            </ScrollView>
          </Animated.View>

          {/* Bottom 3-icon bar */}
          <View style={[wStyles.bottomBar, { paddingBottom: bottomInset + 16 }]}>
            <View style={wStyles.bottomIcon}>
              <View style={wStyles.bottomIconCircle}>
                <Text style={wStyles.bottomIconEmoji}>💧</Text>
              </View>
              <Text style={wStyles.bottomIconLabel}>Water</Text>
            </View>

            <View style={wStyles.bottomIcon}>
              <View style={wStyles.bottomIconCircle}>
                <Text style={wStyles.bottomIconCount}>{lingamIdx + 1}/8</Text>
              </View>
              <Text style={wStyles.bottomIconLabel}>Lingam</Text>
            </View>

            <Pressable
              style={wStyles.bottomIcon}
              accessibilityRole="button"
              onPress={() =>
                Alert.alert(
                  "Emergency Contacts",
                  "🏥 Hospital: +91-4175-223000\n\n🚔 Police: 100\n\n🛕 Ramana Ashram: +91-4175-237292",
                  [{ text: "Close" }]
                )
              }
            >
              <View style={[wStyles.bottomIconCircle, wStyles.emergencyCircle]}>
                <Text style={wStyles.bottomIconEmoji}>🆘</Text>
              </View>
              <Text style={wStyles.bottomIconLabel}>Help</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // ─── NORMAL MAP SCREEN ────────────────────────────────────────────────────
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Begin Walk CTA */}
      <Pressable
        style={styles.beginWalkBtn}
        onPress={beginWalk}
        accessibilityRole="button"
        accessibilityLabel="Begin my Girivalam"
      >
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.beginWalkGradient}
        >
          <View style={styles.beginWalkLeft}>
            <Text style={styles.beginWalkIcon}>🚶</Text>
            <View>
              <Text style={styles.beginWalkTitle}>Begin my Girivalam</Text>
              <Text style={styles.beginWalkSub}>
                Tap to enter walk mode · japa · map · emergency
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
        </LinearGradient>
      </Pressable>

      {/* Map card */}
      <View style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <MaterialCommunityIcons name="map-marker-path" size={22} color={Colors.saffron} />
          <View style={styles.mapHeaderText}>
            <Text style={styles.mapTitle}>Girivalam Path</Text>
            <Text style={styles.mapSubtitle}>14 km around Arunachala Hill</Text>
          </View>
        </View>

        <GirivalamMap userLocation={userLocation} showStops={showStops} />

        <View style={styles.stopsToggleRow}>
          <Pressable
            style={[styles.stopsChip, showStops && styles.stopsChipActive]}
            onPress={() => setShowStops((v) => !v)}
            accessibilityRole="button"
          >
            <Ionicons name={showStops ? "eye" : "eye-off"} size={14} color={showStops ? Colors.white : Colors.saffron} />
            <Text style={[styles.stopsChipText, showStops && styles.stopsChipTextActive]}>
              {showStops ? "Hide Stops" : "Show Stops"}
            </Text>
          </Pressable>
          <Text style={styles.stopsHint}>
            {showStops ? "Showing 16 stops on path" : "Tap to see helpful stops"}
          </Text>
        </View>

        <View style={styles.mapLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#B8410E" }]} />
            <Text style={styles.legendText}>Main Temple</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.saffron }]} />
            <Text style={styles.legendText}>8 Lingams</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.legendDash} />
            <Text style={styles.legendText}>Walk Path</Text>
          </View>
          {tracking && (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#1E88E5" }]} />
              <Text style={styles.legendText}>You</Text>
            </View>
          )}
        </View>

        {showStops && (
          <View style={styles.iconGuide}>
            <Text style={styles.iconGuideTitle}>Stop Icons</Text>
            <View style={styles.iconGuideRow}>
              <Text style={styles.iconGuideItem}>🕉️ Ashram</Text>
              <Text style={styles.iconGuideItem}>🛕 Temple</Text>
              <Text style={styles.iconGuideItem}>🛖 Cave</Text>
              <Text style={styles.iconGuideItem}>🍛 Free Food</Text>
              <Text style={styles.iconGuideItem}>💧 Theertham</Text>
              <Text style={styles.iconGuideItem}>🚻 Rest Stop</Text>
              <Text style={styles.iconGuideItem}>🏥 Medical</Text>
              <Text style={styles.iconGuideItem}>🅿️ Parking</Text>
            </View>
          </View>
        )}

        <View style={styles.mapButtonRow}>
          <Pressable
            style={[styles.mapBtn, tracking ? styles.mapBtnTracking : styles.mapBtnPrimary]}
            onPress={startTracking}
            disabled={requesting}
            accessibilityRole="button"
          >
            {requesting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Ionicons name={tracking ? "radio-button-on" : "locate"} size={20} color={Colors.white} />
            )}
            <Text style={styles.mapBtnText}>
              {tracking ? "Stop Tracking" : "Track My Location"}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.mapBtn, styles.mapBtnSecondary]}
            onPress={openNavMode}
            accessibilityRole="button"
          >
            <Ionicons name="navigate" size={20} color={Colors.saffron} />
            <Text style={[styles.mapBtnText, styles.mapBtnTextSecondary]}>Navigate</Text>
          </Pressable>
        </View>

        {tracking && (
          <View style={styles.trackingBanner}>
            <View style={styles.trackingDot} />
            <Text style={styles.trackingText}>
              Live tracking active — your position updates as you walk
            </Text>
          </View>
        )}
      </View>

      {/* Where am I? card — live nearest lingam + geofence detection */}
      <View style={styles.whereCard}>
        <View style={styles.whereHeader}>
          <Ionicons name="compass-outline" size={20} color={Colors.primary} />
          <Text style={styles.whereTitle}>Where am I on the path?</Text>
        </View>

        {!userLocation && (
          <>
            <Text style={styles.whereHint}>
              Tap below to find your position. The app will show the nearest lingam and quietly notice when you reach one.
            </Text>
            <Pressable
              style={styles.whereBtn}
              onPress={startTracking}
              disabled={requesting}
              accessibilityRole="button"
            >
              {requesting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="locate" size={18} color={Colors.white} />
                  <Text style={styles.whereBtnText}>Find me on the path</Text>
                </>
              )}
            </Pressable>
          </>
        )}

        {userLocation && nearest && (
          <>
            {activeGeofenceIdx !== null ? (
              <View style={styles.whereArrived}>
                <Text style={styles.whereArrivedBadge}>YOU HAVE REACHED</Text>
                <Text style={styles.whereArrivedName}>
                  {LINGAMS[activeGeofenceIdx].number}. {LINGAMS[activeGeofenceIdx].name}
                </Text>
                <Text style={styles.whereArrivedMeaning}>
                  {LINGAMS[activeGeofenceIdx].meaning}
                </Text>
              </View>
            ) : (
              <View style={styles.whereNearest}>
                <Text style={styles.whereNearestLabel}>Nearest lingam</Text>
                <Text style={styles.whereNearestName}>
                  {nearest.lingam.number}. {nearest.lingam.name}
                </Text>
                <Text style={styles.whereNearestDist}>
                  {formatDistance(nearest.distance)} away · {nearest.lingam.direction}
                </Text>
              </View>
            )}
            <Pressable
              onPress={tracking ? stopTracking : startTracking}
              style={styles.whereToggle}
              accessibilityRole="button"
            >
              <Text style={styles.whereToggleText}>
                {tracking ? "Stop live updates" : "Resume live updates"}
              </Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Quick essentials — one-tap access to water, food, washroom, emergency */}
      <View style={styles.quickCard}>
        <Text style={styles.quickHeader}>QUICK ESSENTIALS</Text>
        <View style={styles.quickRow}>
          <Pressable style={styles.quickBtn} onPress={() => handleEssential("water")} accessibilityRole="button">
            <Text style={styles.quickEmoji}>💧</Text>
            <Text style={styles.quickLabel}>Water</Text>
          </Pressable>
          <Pressable style={styles.quickBtn} onPress={() => handleEssential("food")} accessibilityRole="button">
            <Text style={styles.quickEmoji}>🍛</Text>
            <Text style={styles.quickLabel}>Free Food</Text>
          </Pressable>
          <Pressable style={styles.quickBtn} onPress={() => handleEssential("washroom")} accessibilityRole="button">
            <Text style={styles.quickEmoji}>🚻</Text>
            <Text style={styles.quickLabel}>Washroom</Text>
          </Pressable>
          <Pressable style={[styles.quickBtn, styles.quickBtnEmergency]} onPress={() => handleEssential("emergency")} accessibilityRole="button">
            <Text style={styles.quickEmoji}>🆘</Text>
            <Text style={[styles.quickLabel, styles.quickLabelEmergency]}>Emergency</Text>
          </Pressable>
        </View>
      </View>

      {/* Japa Counter */}
      <View style={styles.japaCard}>
        <View style={styles.japaHeader}>
          <Text style={styles.japaHeaderIcon}>📿</Text>
          <Text style={styles.japaHeaderTitle}>Japa Counter</Text>
          <Pressable onPress={() => setJapaCount(0)} accessibilityRole="button" style={styles.japaReset}>
            <Text style={styles.japaResetText}>Reset</Text>
          </Pressable>
        </View>
        <Pressable
          style={styles.japaTapBtn}
          onPress={() => setJapaCount((c) => c + 1)}
          accessibilityRole="button"
          accessibilityLabel="Count one chant"
        >
          <Text style={styles.japaCount}>{japaCount}</Text>
          <Text style={styles.japaTapLabel}>TAP TO COUNT</Text>
          {japaCount > 0 && japaCount % japaTarget === 0 && (
            <Text style={styles.japaComplete}>🙏 {japaCount / japaTarget} mala complete!</Text>
          )}
        </Pressable>
        <View style={styles.japaPresets}>
          <Pressable
            style={[styles.japaPresetBtn, japaTarget === 108 && styles.japaPresetActive]}
            onPress={() => setJapaTarget(108)}
            accessibilityRole="button"
          >
            <Text style={[styles.japaPresetText, japaTarget === 108 && styles.japaPresetTextActive]}>108</Text>
          </Pressable>
          <Pressable
            style={[styles.japaPresetBtn, japaTarget === 1008 && styles.japaPresetActive]}
            onPress={() => setJapaTarget(1008)}
            accessibilityRole="button"
          >
            <Text style={[styles.japaPresetText, japaTarget === 1008 && styles.japaPresetTextActive]}>1008</Text>
          </Pressable>
          <View style={styles.japaProgress}>
            <View style={[styles.japaProgressFill, { width: `${Math.min(100, (japaCount % japaTarget || (japaCount > 0 && japaCount % japaTarget === 0 ? japaTarget : 0)) / japaTarget * 100)}%` as any }]} />
          </View>
          <Text style={styles.japaProgressLabel}>{japaTarget - (japaCount % japaTarget === 0 && japaCount > 0 ? japaTarget : japaCount % japaTarget)} to go</Text>
        </View>
      </View>

      {/* Listen while you walk — Ramana audio, chants, bhajans */}
      <View style={styles.audioCard}>
        <View style={styles.audioHeader}>
          <Text style={styles.audioHeaderIcon}>🎧</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.audioHeaderTitle}>Listen while you walk</Text>
            <Text style={styles.audioHeaderHint}>Plug in your earphones. Walk with Ramana's words, or with sacred sound.</Text>
          </View>
        </View>

        {AUDIO_TRACKS.map((track) => (
          <Pressable
            key={track.id}
            style={styles.audioTrack}
            onPress={() => playTrack(track)}
            accessibilityRole="button"
            accessibilityLabel={`Play ${track.title}, ${track.duration}`}
          >
            <View style={styles.audioPlayIcon}>
              <Ionicons name="play" size={14} color={Colors.white} />
            </View>
            <View style={styles.audioTrackInfo}>
              <Text style={styles.audioTrackTitle}>{track.title}</Text>
              <Text style={styles.audioTrackSubtitle}>{track.subtitle}</Text>
            </View>
            <Text style={styles.audioTrackDuration}>{track.duration}</Text>
          </Pressable>
        ))}

        <Text style={styles.audioFooterNote}>
          Audio files coming soon. Plays in the background — keep walking, phone in pocket.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>8 Sacred Lingams</Text>
      <Text style={styles.sectionDesc}>
        The Girivalam path passes through 8 directional shrines representing the 8 cardinal directions
      </Text>

      {LINGAMS.map((lingam) => (
        <View key={lingam.number} style={styles.lingamRow}>
          <View style={styles.lingamNumber}>
            <Text style={styles.lingamNumberText}>{lingam.number}</Text>
          </View>
          <View style={styles.lingamContent}>
            <View style={styles.lingamHeader}>
              <Text style={styles.lingamName}>{lingam.name}</Text>
              <Text style={styles.lingamDistance}>{lingam.distance}</Text>
            </View>
            <Text style={styles.lingamDirection}>{lingam.direction}</Text>
            <Text style={styles.lingamDesc}>{lingam.description}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Other Sacred Lingams</Text>
      <Text style={styles.sectionDesc}>Additional sacred Lingams on the Girivalam path</Text>

      {SPECIAL_LINGAMS.map((sl) => (
        <View key={sl.name} style={styles.specialLingamRow}>
          <View style={styles.specialLingamEmoji}>
            <Text style={styles.specialLingamEmojiText}>{sl.emoji}</Text>
          </View>
          <View style={styles.lingamContent}>
            <Text style={styles.lingamName}>{sl.name}</Text>
            <Text style={styles.lingamDesc}>{sl.description}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Pilgrim Tips</Text>
      {TIP_ITEMS.map((tip, index) => (
        <View key={index} style={styles.tipRow}>
          <View style={styles.tipIcon}>
            <Ionicons name={tip.icon} size={20} color={Colors.saffron} />
          </View>
          <Text style={styles.tipText}>{tip.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Nav mode styles ──────────────────────────────────────────────────────────
const nStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.warmWhite },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingRight: 10,
    width: 64,
  },
  backBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  topCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    justifyContent: "center",
  },
  navDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.amberLight,
  },
  topTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.amberFaint,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  locationBannerActive: {
    backgroundColor: "rgba(155,61,18,0.07)",
  },
  locationBannerText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.amber,
    flex: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.amberLight,
  },
  lingamNav: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  lingamNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primaryFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  lingamNavBtnDisabled: {
    backgroundColor: Colors.warmWhite,
  },
  lingamInfo: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  lingamInfoNum: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.amber,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  lingamInfoName: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.primaryDark,
  },
  lingamInfoDir: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
  },
  infoRow: {
    flexDirection: "column",
    gap: 8,
    padding: 12,
    backgroundColor: Colors.cream,
    flex: 1,
    justifyContent: "flex-end",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  infoCardIcon: { fontSize: 22, marginTop: 1 },
  infoCardLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.amber,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoCardText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    lineHeight: 18,
    flex: 1,
  },
});

// ─── Walk mode styles ─────────────────────────────────────────────────────────
const wStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1A0500" },
  gradient: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
  },
  walkingBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  walkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C47A1E",
  },
  walkingBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#C47A1E",
  },
  timerText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
  },
  endBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  endBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.5)",
  },
  lingamDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 16,
  },
  dot: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  dotActive: {
    backgroundColor: "#C47A1E",
    width: 20,
  },
  tapArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  japaBig: {
    fontSize: 100,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    lineHeight: 110,
    textShadowColor: "rgba(196,122,30,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  },
  tapHint: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: 2,
    marginTop: 4,
  },
  malaBanner: {
    backgroundColor: "rgba(196,122,30,0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(196,122,30,0.4)",
  },
  malaBannerText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#E09A2A",
  },
  omCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(155,61,18,0.3)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  mantraText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 0.5,
    marginTop: 8,
  },
  lingamBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(196,122,30,0.12)",
    borderWidth: 1,
    borderColor: "rgba(196,122,30,0.25)",
  },
  lingamBannerIcon: { fontSize: 20 },
  lingamBannerTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#E09A2A",
  },
  lingamBannerSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
  },
  bottomIcon: {
    alignItems: "center",
    gap: 6,
  },
  bottomIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(155,61,18,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyCircle: {
    backgroundColor: "rgba(180,30,30,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,80,80,0.2)",
  },
  bottomIconEmoji: { fontSize: 22 },
  bottomIconCount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#C47A1E",
  },
  bottomIconLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.35)",
  },

  // Edge panel
  edgeTab: {
    position: "absolute",
    right: 0,
    width: 18,
    height: 96,
    backgroundColor: "rgba(155,61,18,0.55)",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: "rgba(196,122,30,0.35)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  edgeBackdrop: {
    position: "absolute",
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 30,
  },
  edgePanel: {
    position: "absolute",
    right: 0,
    width: 240,
    backgroundColor: "rgba(20,6,0,0.92)",
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: "rgba(196,122,30,0.25)",
    paddingTop: 14,
    paddingLeft: 16,
    paddingRight: 12,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
    zIndex: 40,
  },
  edgePanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingLeft: 2,
  },
  edgePanelLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 2,
  },
  edgeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  edgeItemIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#9B3D12",
    alignItems: "center",
    justifyContent: "center",
  },
  edgeItemEmoji: { fontSize: 18 },
  edgeItemLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.9)",
  },
  edgeItemSub: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
    marginTop: 1,
  },
  edgeFooter: {
    marginTop: 10,
    paddingTop: 10,
    paddingLeft: 2,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    fontSize: 9,
    color: "rgba(255,255,255,0.25)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // ── Morphing banner: ① FAR
  farBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(196,122,30,0.10)",
    borderWidth: 1,
    borderColor: "rgba(196,122,30,0.20)",
  },
  farDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(196,122,30,0.55)",
  },
  farTitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(224,154,42,0.8)",
  },
  farSub: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
    marginTop: 1,
  },

  // ── Morphing banner: ② NEAR
  nearCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "rgba(196,122,30,0.18)",
    borderWidth: 1,
    borderColor: "rgba(196,122,30,0.35)",
  },
  nearHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  nearDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E09A2A" },
  nearLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#E09A2A",
    letterSpacing: 2,
  },
  nearMeaning: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontStyle: "italic",
    lineHeight: 20,
  },

  // ── Morphing banner: ③ AT (arrival + save this moment)
  arrivalCard: {
    marginHorizontal: 14,
    marginBottom: 16,
    borderRadius: 22,
    backgroundColor: "rgba(155,61,18,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,200,140,0.35)",
    overflow: "hidden",
    shadowColor: "#C47A1E",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  arrivalHead: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
  },
  arrivalLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 2,
    marginBottom: 4,
  },
  arrivalName: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  arrivalMeaning: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontStyle: "italic",
    lineHeight: 19,
  },
  arrivalSaveSection: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
  },
  arrivalSaveHint: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 10,
  },
  arrivalSaveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  arrivalSaveBtn: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  arrivalSaveIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  arrivalSaveIconActive: {
    backgroundColor: "rgba(255,255,255,0.28)",
    borderColor: "rgba(255,255,255,0.55)",
  },
  arrivalSaveEmoji: { fontSize: 16 },
  arrivalSaveLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.75)",
  },
  arrivalDismiss: {
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  arrivalDismissText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
  },
});

// ─── Normal screen styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.warmWhite },
  content: { padding: 16 },

  beginWalkBtn: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  beginWalkGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  beginWalkLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  beginWalkIcon: { fontSize: 26 },
  beginWalkTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  beginWalkSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },

  mapCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  mapHeaderText: { flex: 1 },
  mapTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.saffronDark },
  mapSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textLight, marginTop: 2 },
  mapLegend: { flexDirection: "row", flexWrap: "wrap", gap: 16, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendDash: { width: 14, height: 3, backgroundColor: Colors.saffron, borderRadius: 2 },
  legendText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textLight },
  stopsToggleRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingTop: 12 },
  stopsChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.saffron, backgroundColor: Colors.white },
  stopsChipActive: { backgroundColor: Colors.saffron },
  stopsChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.saffron },
  stopsChipTextActive: { color: Colors.white },
  stopsHint: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textLight },
  iconGuide: { backgroundColor: Colors.cream, marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 10 },
  iconGuideTitle: { fontSize: 11, fontFamily: "Inter_700Bold", color: Colors.saffronDark, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  iconGuideRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, rowGap: 6 },
  iconGuideItem: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.text },
  mapButtonRow: { flexDirection: "row", gap: 12, padding: 16 },
  mapBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 8 },
  mapBtnPrimary: { backgroundColor: Colors.saffron },
  mapBtnTracking: { backgroundColor: "#1E88E5" },
  mapBtnSecondary: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.saffron },
  mapBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.white },
  mapBtnTextSecondary: { color: Colors.saffron },
  trackingBanner: { flexDirection: "row", alignItems: "center", gap: 8, margin: 16, marginTop: 0, backgroundColor: "rgba(30,136,229,0.08)", padding: 10, borderRadius: 10 },
  trackingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#1E88E5" },
  trackingText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#1E88E5", flex: 1 },

  japaCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  japaHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  japaHeaderIcon: { fontSize: 18 },
  japaHeaderTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  japaReset: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: Colors.primaryFaint, borderRadius: 8 },
  japaResetText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.primary },
  japaTapBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 22, alignItems: "center", gap: 4, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  japaCount: { fontSize: 52, fontFamily: "Inter_700Bold", color: Colors.white, lineHeight: 60 },
  japaTapLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.6)", letterSpacing: 1.5 },
  japaComplete: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.amberLight, marginTop: 4 },
  japaPresets: { flexDirection: "row", alignItems: "center", gap: 8 },
  japaPresetBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.cream },
  japaPresetActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaint },
  japaPresetText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.textLight },
  japaPresetTextActive: { color: Colors.primary },
  japaProgress: { flex: 1, height: 6, backgroundColor: Colors.borderLight, borderRadius: 3, overflow: "hidden" },
  japaProgressFill: { height: "100%" as any, backgroundColor: Colors.primary, borderRadius: 3 },
  japaProgressLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textLight, minWidth: 42, textAlign: "right" },

  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 4, marginTop: 8 },
  sectionDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textLight, marginBottom: 10 },

  lingamRow: { flexDirection: "row", gap: 12, backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 6, elevation: 2 },
  lingamNumber: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.primaryFaint, alignItems: "center", justifyContent: "center", marginTop: 2 },
  lingamNumberText: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.primary },
  lingamContent: { flex: 1 },
  lingamHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  lingamName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.brown, flex: 1 },
  lingamDistance: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.saffron, backgroundColor: Colors.overlayLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  lingamDirection: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textLight, marginTop: 2, marginBottom: 4 },
  lingamDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMid, lineHeight: 17 },

  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 8 },
  tipIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.overlayLight, alignItems: "center", justifyContent: "center" },
  tipText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 20, paddingTop: 7 },

  specialLingamRow: { flexDirection: "row", gap: 12, backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 6, elevation: 2 },
  specialLingamEmoji: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.overlayLight, alignItems: "center", justifyContent: "center", marginTop: 2 },
  specialLingamEmojiText: { fontSize: 20 },

  whereCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 2,
  },
  whereHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  whereTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  whereHint: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMid, lineHeight: 19, marginBottom: 12 },
  whereBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12,
  },
  whereBtnText: { color: Colors.white, fontSize: 14, fontFamily: "Inter_600SemiBold" },
  whereNearest: {
    backgroundColor: Colors.overlayLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  whereNearestLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: Colors.textLight, letterSpacing: 1, marginBottom: 4 },
  whereNearestName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.primary, marginBottom: 2 },
  whereNearestDist: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMid },
  whereArrived: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  whereArrivedBadge: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: Colors.white, opacity: 0.85, letterSpacing: 1.4, marginBottom: 6 },
  whereArrivedName: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.white, marginBottom: 6 },
  whereArrivedMeaning: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.white, opacity: 0.92, lineHeight: 19 },
  whereToggle: { paddingVertical: 6, alignItems: "center" },
  whereToggleText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textLight },

  quickCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 2,
  },
  quickHeader: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: Colors.textLight, letterSpacing: 1.2, marginBottom: 12, paddingHorizontal: 2 },
  quickRow: { flexDirection: "row", gap: 8 },
  quickBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: Colors.overlayLight,
  },
  quickBtnEmergency: { backgroundColor: Colors.primary },
  quickEmoji: { fontSize: 24, marginBottom: 6 },
  quickLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.text, textAlign: "center" },
  quickLabelEmergency: { color: Colors.white },

  audioCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 2,
  },
  audioHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  audioHeaderIcon: { fontSize: 22, marginTop: 2 },
  audioHeaderTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.text, marginBottom: 2 },
  audioHeaderHint: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMid, lineHeight: 17 },
  audioTrack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.overlayLight,
  },
  audioPlayIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    paddingLeft: 2,
  },
  audioTrackInfo: { flex: 1 },
  audioTrackTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text, marginBottom: 2 },
  audioTrackSubtitle: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMid, lineHeight: 15 },
  audioTrackDuration: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textLight, marginLeft: 4 },
  audioFooterNote: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textLight, lineHeight: 16, marginTop: 12, fontStyle: "italic", textAlign: "center" },
});
