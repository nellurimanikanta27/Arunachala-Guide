import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GirivalamMap } from "@/components/girivalam-map";
import Colors from "@/constants/colors";
import { addMoment, finishWalk, startWalk, updateWalk } from "@/lib/pilgrimage-store";

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

  // Saved moments at each lingam — persisted via pilgrimage-store
  const [savedMoments, setSavedMoments] = useState<Record<number, string[]>>({});
  const [dismissedFor, setDismissedFor] = useState<number | null>(null);
  const [currentWalkId, setCurrentWalkId] = useState<string | null>(null);
  // Walk-screen overlay (japa / audio / plus / utilities / temple info)
  type WalkOverlay = null | "japa" | "audio" | "plus" | "utilities" | "temple" | "translator";
  const [walkOverlay, setWalkOverlay] = useState<WalkOverlay>(null);
  const [templeInfoIdx, setTempleInfoIdx] = useState<number | null>(null);
  // Refs avoid stale-closure / concurrent-tap races on saveMoment.
  const currentWalkIdRef = useRef<string | null>(null);
  const walkInFlightRef = useRef<Promise<string> | null>(null);
  const savedKindsRef = useRef<Set<string>>(new Set()); // "lingamIdx:kind"

  // Sankalpa thread — the "why" of this walk
  const [sankalpa, setSankalpa] = useState("");
  const [sankalpaPromptOpen, setSankalpaPromptOpen] = useState(false);

  // Silent walk mode — phone stays dark, only vibrates at each lingam
  const [silentMode, setSilentMode] = useState(false);

  // End-of-walk ritual overlay (animated lingam glow + sankalpa return)
  const [endRitualOpen, setEndRitualOpen] = useState(false);
  const lingamGlows = useRef(LINGAMS.map(() => new Animated.Value(0))).current;

  // Edge panel (quick-access drawer during walk)
  const [edgePanelOpen, setEdgePanelOpen] = useState(false);

  // Translator state — real translation via MyMemory free API
  type TrLang = "ta" | "hi" | "te";
  const TR_LANG_LABEL: Record<TrLang, string> = {
    ta: "தமிழ் · Tamil",
    hi: "हिन्दी · Hindi",
    te: "తెలుగు · Telugu",
  };
  const [trLang, setTrLang] = useState<TrLang>("ta");
  const [trInput, setTrInput] = useState("");
  const [trOutput, setTrOutput] = useState<{ text: string; lang: TrLang } | null>(null);
  const [trLoading, setTrLoading] = useState(false);
  const [trError, setTrError] = useState<string | null>(null);
  const [trCategory, setTrCategory] = useState<string>("All");

  async function runTranslate(textRaw: string) {
    const text = textRaw.trim();
    if (!text) return;
    setTrLoading(true);
    setTrError(null);
    setTrOutput(null);
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=en|${trLang}`;
      const res = await fetch(url);
      const json = await res.json();
      const out: string | undefined = json?.responseData?.translatedText;
      if (out && typeof out === "string") {
        setTrOutput({ text: out, lang: trLang });
      } else {
        setTrError("Could not translate. Try again.");
      }
    } catch {
      setTrError("Network problem. Check your connection and try again.");
    } finally {
      setTrLoading(false);
    }
  }
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

  // Clear "just keep walking" once the pilgrim leaves the geofence,
  // so re-arrival at the same lingam shows the rich card again.
  useEffect(() => {
    if (activeGeofenceIdx === null && dismissedFor !== null) {
      setDismissedFor(null);
    }
  }, [activeGeofenceIdx, dismissedFor]);
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
      // Silent walk mode: phone is dark, but vibrate gently when you reach a lingam.
      if (walkMode && silentMode && Platform.OS !== "web") {
        try { Vibration.vibrate([0, 220, 120, 220]); } catch { /* noop */ }
      }
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

  // Lazily start a walk record; concurrent callers share the same promise
  // so we never create duplicate walks (architect-flagged race).
  function ensureWalkId(): Promise<string> {
    if (currentWalkIdRef.current) return Promise.resolve(currentWalkIdRef.current);
    if (walkInFlightRef.current) return walkInFlightRef.current;
    const p = startWalk()
      .then((w) => {
        currentWalkIdRef.current = w.id;
        setCurrentWalkId(w.id);
        return w.id;
      })
      .finally(() => {
        walkInFlightRef.current = null;
      });
    walkInFlightRef.current = p;
    return p;
  }

  // Opening the walk now opens the Sankalpa prompt first — the pilgrim
  // sets an intention (the "why") and chooses silent vs normal walk.
  function beginWalk() {
    setSankalpa("");
    setSilentMode(false);
    setSankalpaPromptOpen(true);
  }

  const startingWalkRef = useRef(false);
  async function startWalkAfterSankalpa() {
    // Guard rapid double-taps so we don't create two walk records.
    if (startingWalkRef.current) return;
    startingWalkRef.current = true;
    setSankalpaPromptOpen(false);
    setJapaCount(0);
    setWalkSeconds(0);
    setSavedMoments({});
    setDismissedFor(null);
    setWalkOverlay(null);
    setTempleInfoIdx(null);
    savedKindsRef.current = new Set();
    setWalkMode(true);
    try {
      const id = await ensureWalkId();
      // Persist sankalpa + silent-mode flag on the walk record.
      const trimmed = sankalpa.trim();
      if (trimmed.length > 0 || silentMode) {
        try {
          await updateWalk(id, {
            ...(trimmed.length > 0 ? { sankalpa: trimmed } : {}),
            ...(silentMode ? { silent: true } : {}),
          });
        } catch (e) {
          console.warn("Failed to save sankalpa/silent flag", e);
        }
      }
    } catch (e) {
      console.warn("Failed to record walk start", e);
    } finally {
      startingWalkRef.current = false;
    }
  }

  // End Session now opens the End-of-Walk ritual instead of closing instantly.
  // The walk timer freezes here — the ritual screen shows the final distance.
  function requestEndWalk() {
    setWalkOverlay(null);
    setEndRitualOpen(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Reset + animate 8 lingam glows in sequence.
    lingamGlows.forEach((g) => g.setValue(0));
    Animated.stagger(
      280,
      lingamGlows.map((g) =>
        Animated.timing(g, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      )
    ).start();
  }

  async function endWalk() {
    setWalkMode(false);
    setWalkOverlay(null);
    setTempleInfoIdx(null);
    setEndRitualOpen(false);
    const id = currentWalkIdRef.current;
    if (id) {
      try {
        await finishWalk(id);
      } catch (e) {
        console.warn("Failed to record walk end", e);
      }
      currentWalkIdRef.current = null;
      setCurrentWalkId(null);
    }
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

  async function saveMoment(lingamIdx: number, kind: "photo" | "voice" | "note" | "feeling") {
    const dedupeKey = `${lingamIdx}:${kind}`;
    // Synchronous guard against rapid double-taps (state updates are async).
    if (savedKindsRef.current.has(dedupeKey)) return;
    savedKindsRef.current.add(dedupeKey);

    setSavedMoments((prev) => {
      const existing = prev[lingamIdx] ?? [];
      if (existing.includes(kind)) return prev;
      return { ...prev, [lingamIdx]: [...existing, kind] };
    });

    const lingam = LINGAMS[lingamIdx];
    const label = { photo: "Photo", voice: "Voice note", note: "Written note", feeling: "Feeling" }[kind];

    // Persist via local pilgrimage-store. Walk record is created lazily and
    // shared across concurrent saves via ensureWalkId(). The store itself
    // also idempotency-guards on (walkId, lingamIdx, kind).
    try {
      const walkId = await ensureWalkId();
      await addMoment({
        walkId,
        lingamIdx,
        lingamName: lingam?.name ?? "Unknown lingam",
        kind,
      });
    } catch (e) {
      console.warn("Failed to persist moment", e);
      // Roll back the ref guard so the pilgrim can retry.
      savedKindsRef.current.delete(dedupeKey);
    }

    const captureNote =
      kind === "photo" || kind === "voice"
        ? `\n\n${label === "Photo" ? "Camera" : "Microphone"} capture is being added next. The moment marker is already saved to your pilgrimage.`
        : "";

    Alert.alert(
      `${label} — ${lingam?.name ?? ""}`,
      `Saved to your pilgrimage archive on this phone.${captureNote}`
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
    const timeStr = formatTime(walkSeconds);

    return (
      <View style={dStyles.root}>
        <LinearGradient
          colors={["#0A0604", "#1A0F08", "#0A0604"]}
          style={dStyles.gradient}
        >
          {/* ── Top header: KM · timer · End Session ── */}
          <View style={[dStyles.topBar, { paddingTop: topInset + 14 }]}>
            <View>
              <Text style={dStyles.kmBig}>
                {distKm.toFixed(1)}
                <Text style={dStyles.kmUnit}> KM</Text>
              </Text>
              <Text style={dStyles.kmLabel}>Covered</Text>
            </View>
            <View style={dStyles.topRight}>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={dStyles.timer}>{timeStr}</Text>
                <View style={dStyles.liveRow}>
                  <View style={dStyles.liveDot} />
                  <Text style={dStyles.liveText}>Live Session</Text>
                </View>
              </View>
              <Pressable
                onPress={() => setSilentMode((v) => !v)}
                style={[dStyles.silentPill, silentMode && dStyles.silentPillOn]}
                accessibilityRole="button"
                accessibilityLabel={silentMode ? "Turn off silent mode" : "Turn on silent mode"}
                hitSlop={6}
              >
                <Ionicons
                  name={silentMode ? "moon" : "moon-outline"}
                  size={14}
                  color={silentMode ? "#0A0604" : GOLD}
                />
              </Pressable>
              <Pressable
                onPress={requestEndWalk}
                style={dStyles.endBtn}
                accessibilityRole="button"
                accessibilityLabel="End session"
              >
                <Text style={dStyles.endBtnText}>End Session</Text>
              </Pressable>
            </View>
          </View>

          {/* ── 8-temple progress strip ── */}
          <View style={dStyles.progressRow}>
            <View style={dStyles.progressStrip}>
              {LINGAMS.map((l, i) => {
                const isDone = i < lingamIdx;
                const isCurrent = i === lingamIdx;
                return (
                  <Pressable
                    key={l.number}
                    style={dStyles.progressItem}
                    onPress={() => {
                      setTempleInfoIdx(i);
                      setWalkOverlay("temple");
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${l.name} info`}
                  >
                    <View
                      style={[
                        dStyles.templeIconWrap,
                        isDone && dStyles.templeIconDone,
                        isCurrent && dStyles.templeIconCurrent,
                      ]}
                    >
                      {/* soft golden halo behind every gopuram */}
                      <View
                        pointerEvents="none"
                        style={[
                          dStyles.templeHalo,
                          isCurrent && dStyles.templeHaloCurrent,
                          !isDone && !isCurrent && dStyles.templeHaloUpcoming,
                        ]}
                      />
                      <Animated.View
                        style={
                          isCurrent
                            ? {
                                transform: [
                                  {
                                    scale: omPulse.interpolate({
                                      inputRange: [0.4, 0.9],
                                      outputRange: [1, 1.18],
                                    }),
                                  },
                                ],
                              }
                            : undefined
                        }
                      >
                        <MaterialCommunityIcons
                          name="temple-hindu"
                          size={isCurrent ? 24 : 20}
                          color={
                            isCurrent ? "#FFD98A" : isDone ? GOLD : "rgba(196,122,30,0.55)"
                          }
                        />
                      </Animated.View>
                    </View>
                    <Text
                      style={[
                        dStyles.templeName,
                        (isDone || isCurrent) && dStyles.templeNameLit,
                      ]}
                      numberOfLines={1}
                    >
                      {l.name.replace(" Lingam", "")}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={dStyles.progressCounter}>{Math.min(8, lingamIdx + 1)}/8</Text>
          </View>

          {/* ── Faux dark map area ── */}
          <View style={dStyles.mapArea}>
            {[200, 160, 120, 80].map((r, i) => (
              <View
                key={i}
                style={[
                  dStyles.contour,
                  { width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r },
                ]}
              />
            ))}
            <Text style={dStyles.mountainLabel}>ARUNACHALA</Text>

            {/* Glowing route — dots forming an oval ring */}
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              {Array.from({ length: 40 }).map((_, i) => {
                const a = (i / 40) * Math.PI * 2;
                const rx = 130;
                const ry = 170;
                return (
                  <View
                    key={i}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      marginLeft: Math.cos(a) * rx - 2,
                      marginTop: Math.sin(a) * ry - 2,
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: GOLD,
                      opacity: 0.6,
                      shadowColor: GOLD,
                      shadowOpacity: 1,
                      shadowRadius: 4,
                      shadowOffset: { width: 0, height: 0 },
                    }}
                  />
                );
              })}
            </View>

            {/* Temple pins on the route */}
            {LINGAMS.map((l, i) => {
              const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
              const rx = 130;
              const ry = 170;
              const isDone = i < lingamIdx;
              const isCurrent = i === lingamIdx;
              return (
                <Pressable
                  key={l.number}
                  onPress={() => {
                    setTempleInfoIdx(i);
                    setWalkOverlay("temple");
                  }}
                  style={[
                    dStyles.templePin,
                    isCurrent && dStyles.templePinCurrent,
                    {
                      left: "50%",
                      top: "50%",
                      marginLeft: Math.cos(a) * rx - 14,
                      marginTop: Math.sin(a) * ry - 14,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={l.name}
                >
                  <MaterialCommunityIcons
                    name="temple-hindu"
                    size={isCurrent ? 18 : 14}
                    color={isDone || isCurrent ? GOLD : "rgba(255,255,255,0.4)"}
                  />
                </Pressable>
              );
            })}

            {/* Utility pins (visual hint — full list lives in Utilities overlay) */}
            <View style={[dStyles.utilPin, { top: 14, left: 18 }]}>
              <Text style={dStyles.utilPinText}>💧 Water · 120m</Text>
            </View>
            <View style={[dStyles.utilPin, { top: 14, right: 18 }]}>
              <Text style={dStyles.utilPinText}>🚻 Toilet · 240m</Text>
            </View>
            <View style={[dStyles.utilPin, { bottom: 110, left: 18 }]}>
              <Text style={dStyles.utilPinText}>🍛 Annaprasadam · 150m</Text>
            </View>
            <View style={[dStyles.utilPin, { bottom: 110, right: 18 }]}>
              <Text style={dStyles.utilPinText}>🍴 Restaurant · 300m</Text>
            </View>

            {/* User location */}
            <View style={[dStyles.userDotWrap, { left: "50%", top: "78%", marginLeft: -10 }]}>
              <View style={dStyles.userDotPulse} />
              <View style={dStyles.userDot} />
            </View>

            {/* Re-center FAB — requests a fresh GPS fix and triggers re-center */}
            <Pressable
              style={dStyles.recenterFab}
              accessibilityRole="button"
              accessibilityLabel="Re-center map on my location"
              onPress={() => {
                if (!tracking) {
                  startTracking();
                } else {
                  Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
                    .then((p) =>
                      setUserLocation({
                        lat: p.coords.latitude,
                        lng: p.coords.longitude,
                        recenter: true,
                      })
                    )
                    .catch(() => {
                      Alert.alert("Re-center", "Couldn't get a fresh fix right now. Keep walking — it will retry.");
                    });
                }
              }}
            >
              <Ionicons name="locate" size={18} color={GOLD} />
            </Pressable>
          </View>

          {/* ── Geofence card (uses real AT logic) ── */}
          {activeGeofenceIdx !== null && dismissedFor !== activeGeofenceIdx && (
            <View style={dStyles.geofenceCard}>
              <View style={dStyles.geofenceIcon}>
                <MaterialCommunityIcons name="temple-hindu" size={20} color={GOLD} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={dStyles.geofenceApproach}>Approaching</Text>
                <Text style={dStyles.geofenceName}>
                  {LINGAMS[activeGeofenceIdx].name}
                </Text>
                <Pressable
                  onPress={() => {
                    setTempleInfoIdx(activeGeofenceIdx);
                    setWalkOverlay("temple");
                  }}
                  style={dStyles.geofenceCta}
                  accessibilityRole="button"
                  accessibilityLabel="Know about this temple"
                >
                  <Text style={dStyles.geofenceCtaText}>Know About This Temple</Text>
                </Pressable>
              </View>
              <Pressable
                onPress={() => setDismissedFor(activeGeofenceIdx)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Dismiss"
              >
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.5)" />
              </Pressable>
            </View>
          )}

          {/* ── Bottom 4-button nav ── */}
          <View style={[dStyles.bottomNav, { paddingBottom: bottomInset + 14 }]}>
            <NavTabBtn
              emoji="📿"
              label="Japa"
              active={walkOverlay === "japa"}
              onPress={() => setWalkOverlay(walkOverlay === "japa" ? null : "japa")}
            />
            <NavTabBtn
              emoji="🎵"
              label="Audio"
              active={walkOverlay === "audio"}
              onPress={() => setWalkOverlay(walkOverlay === "audio" ? null : "audio")}
            />
            <Pressable
              onPress={() => setWalkOverlay(walkOverlay === "plus" ? null : "plus")}
              style={[
                dStyles.plusBtn,
                walkOverlay === "plus" && { transform: [{ rotate: "45deg" }] },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Quick actions"
            >
              <Ionicons name="add" size={32} color="#0A0604" />
            </Pressable>
            <NavTabBtn
              emoji="🧭"
              label="Utilities"
              active={walkOverlay === "utilities"}
              onPress={() => setWalkOverlay(walkOverlay === "utilities" ? null : "utilities")}
            />
            <NavTabBtn
              emoji="🈂️"
              label="Translate"
              active={walkOverlay === "translator"}
              onPress={() =>
                setWalkOverlay(walkOverlay === "translator" ? null : "translator")
              }
            />
          </View>

          {/* ── Overlays (always inside the session) ── */}
          {walkOverlay === "japa" && (
            <WalkSheet title="JAPA COUNTER" onClose={() => setWalkOverlay(null)}>
              <View style={dStyles.japaWrap}>
                <View style={dStyles.japaMandala}>
                  <Text style={dStyles.japaBig}>{japaCount}</Text>
                  <Text style={dStyles.japaSub}>Mantras</Text>
                </View>
                <View style={dStyles.japaRow}>
                  <Pressable
                    onPress={() => setJapaCount((c) => Math.max(0, c - 1))}
                    style={dStyles.japaSideBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease"
                  >
                    <Ionicons name="remove" size={22} color={GOLD} />
                  </Pressable>
                  <Pressable
                    onPress={() => setJapaCount((c) => c + 1)}
                    style={dStyles.japaTapBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Count one chant"
                  >
                    <Text style={dStyles.japaTapText}>Tap to count</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setJapaCount((c) => c + 1)}
                    style={dStyles.japaSideBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Add one"
                  >
                    <Ionicons name="add" size={22} color={GOLD} />
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => setJapaCount(0)}
                  style={dStyles.japaReset}
                  accessibilityRole="button"
                  accessibilityLabel="Reset count"
                >
                  <Ionicons name="refresh" size={13} color="rgba(255,255,255,0.5)" />
                  <Text style={dStyles.japaResetText}>Reset</Text>
                </Pressable>
              </View>
            </WalkSheet>
          )}

          {walkOverlay === "audio" && (
            <WalkSheet title="AUDIO" onClose={() => setWalkOverlay(null)}>
              <View style={dStyles.audioTabs}>
                {["Bhajans", "Audiobooks", "Ambient"].map((t, i) => (
                  <Text
                    key={t}
                    style={[dStyles.audioTab, i === 0 && dStyles.audioTabActive]}
                  >
                    {t}
                  </Text>
                ))}
              </View>
              {[
                { title: "Om Namah Shivaya", artist: "Swami Paramarthananda" },
                { title: "Arunachala Ashtakam", artist: "Traditional" },
                { title: "Lingashtakam", artist: "Adi Shankaracharya" },
                { title: "Om Namah Shivaya", artist: "Swami Paramarthananda", playing: true },
              ].map((t, i) => (
                <View key={i} style={dStyles.audioRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={dStyles.audioTitle}>{t.title}</Text>
                    <Text style={dStyles.audioArtist}>{t.artist}</Text>
                  </View>
                  <Ionicons
                    name={t.playing ? "pause-circle" : "play-circle"}
                    size={30}
                    color={GOLD}
                  />
                </View>
              ))}
              <Text style={dStyles.audioFoot}>
                Plays under the map · mini-player stays on
              </Text>
            </WalkSheet>
          )}

          {walkOverlay === "plus" && (
            <WalkSheet title="ACTIONS" onClose={() => setWalkOverlay(null)}>
              {[
                {
                  icon: "create-outline" as const,
                  title: "Quick Note",
                  sub: "Write your thoughts",
                },
                {
                  icon: "camera-outline" as const,
                  title: "Photo Capture",
                  sub: "Capture the moment",
                },
                {
                  icon: "videocam-outline" as const,
                  title: "Video Capture",
                  sub: "Record your journey",
                },
              ].map((a) => (
                <Pressable
                  key={a.title}
                  style={dStyles.actionRow}
                  onPress={() => {
                    setWalkOverlay(null);
                    Alert.alert(
                      a.title,
                      "Capture pipeline is being added next. Your moment will be saved with GPS + time + this session."
                    );
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={a.title}
                >
                  <View style={dStyles.actionIcon}>
                    <Ionicons name={a.icon} size={20} color={GOLD} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={dStyles.actionTitle}>{a.title}</Text>
                    <Text style={dStyles.actionSub}>{a.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
                </Pressable>
              ))}
            </WalkSheet>
          )}

          {walkOverlay === "utilities" && (
            <WalkSheet title="UTILITIES" onClose={() => setWalkOverlay(null)}>
              {[
                { emoji: "💧", label: "Water", sub: "Find water stations nearby" },
                { emoji: "🚻", label: "Toilets", sub: "Find toilets nearby" },
                { emoji: "🍛", label: "Annaprasadam", sub: "Free food locations" },
                { emoji: "🍴", label: "Restaurants", sub: "Nearby restaurants" },
                { emoji: "🏛️", label: "Ashramas", sub: "Nearby ashramas" },
                { emoji: "✨", label: "Nearby Essentials", sub: "All essential services" },
              ].map((u) => (
                <Pressable
                  key={u.label}
                  style={dStyles.utilRow}
                  onPress={() => {
                    setWalkOverlay(null);
                    Alert.alert(
                      u.label,
                      `Pins for ${u.label.toLowerCase()} will appear on your map. The session stays active.`
                    );
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={u.label}
                >
                  <Text style={dStyles.utilRowIcon}>{u.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={dStyles.utilLabel}>{u.label}</Text>
                    <Text style={dStyles.utilSub}>{u.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.3)" />
                </Pressable>
              ))}
            </WalkSheet>
          )}

          {/* Silent walk mode: dim the whole screen — phone "goes quiet".
              The pilgrim taps anywhere to wake briefly. Vibrates at each lingam. */}
          {silentMode && !endRitualOpen && walkOverlay === null && (
            <Pressable
              style={dStyles.silentScrim}
              onPress={() => setSilentMode(false)}
              accessibilityRole="button"
              accessibilityLabel="Wake screen"
            >
              <View style={dStyles.silentInner}>
                <Ionicons name="moon" size={28} color={GOLD} />
                <Text style={dStyles.silentTitle}>Silent walk</Text>
                <Text style={dStyles.silentSub}>
                  Phone is resting. It will vibrate gently when you reach a lingam.
                </Text>
                <Text style={dStyles.silentTap}>Tap anywhere to wake</Text>
              </View>
            </Pressable>
          )}

          {/* ── End-of-walk ritual ── */}
          {endRitualOpen && (
            <View style={dStyles.ritualRoot}>
              <View style={dStyles.ritualInner}>
                <Text style={dStyles.ritualKicker}>YOUR WALK IS COMPLETE</Text>
                <Text style={dStyles.ritualKm}>
                  {((walkSeconds / 3600) * 3).toFixed(1)}
                  <Text style={dStyles.ritualKmUnit}> km</Text>
                </Text>
                <Text style={dStyles.ritualTime}>{formatTime(walkSeconds)}</Text>

                {/* 8 lingams glow one by one */}
                <View style={dStyles.ritualLingamRow}>
                  {LINGAMS.map((l, i) => (
                    <Animated.View
                      key={l.number}
                      style={[
                        dStyles.ritualLingamDot,
                        {
                          opacity: lingamGlows[i],
                          transform: [
                            {
                              scale: lingamGlows[i].interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.6, 1],
                              }),
                            },
                          ],
                          shadowOpacity: lingamGlows[i] as unknown as number,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="temple-hindu"
                        size={18}
                        color={GOLD}
                      />
                    </Animated.View>
                  ))}
                </View>

                {/* Sankalpa returned */}
                {sankalpa.trim().length > 0 ? (
                  <View style={dStyles.ritualSankalpaCard}>
                    <Text style={dStyles.ritualSankalpaLabel}>
                      YOU BEGAN WITH THIS IN YOUR HEART
                    </Text>
                    <Text style={dStyles.ritualSankalpaText}>
                      &ldquo;{sankalpa.trim()}&rdquo;
                    </Text>
                    <Text style={dStyles.ritualSankalpaHand}>
                      The mountain has heard it.
                    </Text>
                  </View>
                ) : (
                  <Text style={dStyles.ritualMessage}>
                    You walked. That is enough.
                  </Text>
                )}

                <Pressable
                  onPress={endWalk}
                  style={dStyles.ritualBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Close walk"
                >
                  <Text style={dStyles.ritualBtnText}>Close</Text>
                </Pressable>
              </View>
            </View>
          )}

          {walkOverlay === "translator" && (() => {
            const PHRASES: { cat: string; en: string }[] = [
              { cat: "Basics", en: "Hello, namaskaram." },
              { cat: "Basics", en: "Thank you." },
              { cat: "Basics", en: "Yes." },
              { cat: "Basics", en: "No." },
              { cat: "Basics", en: "Please." },
              { cat: "Basics", en: "Sorry." },
              { cat: "Help", en: "Please help, I am lost." },
              { cat: "Help", en: "Where am I right now?" },
              { cat: "Help", en: "I am not feeling well." },
              { cat: "Help", en: "Please call a doctor." },
              { cat: "Help", en: "Is there a hospital nearby?" },
              { cat: "Help", en: "I lost my phone." },
              { cat: "Food", en: "Where can I get free food (Annaprasadam)?" },
              { cat: "Food", en: "I am hungry." },
              { cat: "Food", en: "Where is the nearest water?" },
              { cat: "Food", en: "Is this food vegetarian?" },
              { cat: "Food", en: "One plate, please." },
              { cat: "Directions", en: "Where is the toilet?" },
              { cat: "Directions", en: "How far is the next temple?" },
              { cat: "Directions", en: "Where is the auto / cab stand?" },
              { cat: "Directions", en: "How do I go to Ramana Ashram?" },
              { cat: "Directions", en: "Which way is the main temple?" },
              { cat: "Devotion", en: "Om Namah Shivaya." },
              { cat: "Devotion", en: "I want to do darshan." },
              { cat: "Devotion", en: "What time does the temple open?" },
              { cat: "Devotion", en: "I want to light a lamp." },
              { cat: "Money", en: "How much does this cost?" },
              { cat: "Money", en: "I will pay by UPI." },
              { cat: "Money", en: "Do you accept cash?" },
              { cat: "Money", en: "Please give me change." },
            ];
            const CATS = ["All", "Basics", "Help", "Food", "Directions", "Devotion", "Money"];
            const filtered =
              trCategory === "All"
                ? PHRASES
                : PHRASES.filter((p) => p.cat === trCategory);
            return (
              <WalkSheet title="TRANSLATOR" onClose={() => setWalkOverlay(null)}>
                {/* Language picker */}
                <Text style={dStyles.trLabel}>Translate to</Text>
                <View style={dStyles.trLangRow}>
                  {(["ta", "hi", "te"] as TrLang[]).map((lang) => (
                    <Pressable
                      key={lang}
                      onPress={() => {
                        setTrLang(lang);
                        if (trInput.trim()) runTranslate(trInput);
                      }}
                      style={[
                        dStyles.trLangPill,
                        trLang === lang && dStyles.trLangPillActive,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Translate to ${TR_LANG_LABEL[lang]}`}
                    >
                      <Text
                        style={[
                          dStyles.trLangPillText,
                          trLang === lang && { color: GOLD },
                        ]}
                      >
                        {TR_LANG_LABEL[lang]}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Free text input */}
                <Text style={dStyles.trLabel}>Type anything in English</Text>
                <View style={dStyles.trInputRow}>
                  <TextInput
                    value={trInput}
                    onChangeText={setTrInput}
                    placeholder="e.g. Where can I rest for an hour?"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    style={dStyles.trInput}
                    multiline
                    onSubmitEditing={() => runTranslate(trInput)}
                    returnKeyType="go"
                  />
                  <Pressable
                    onPress={() => runTranslate(trInput)}
                    disabled={!trInput.trim() || trLoading}
                    style={[
                      dStyles.trGoBtn,
                      (!trInput.trim() || trLoading) && { opacity: 0.4 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Translate"
                  >
                    {trLoading ? (
                      <ActivityIndicator color="#0A0604" size="small" />
                    ) : (
                      <Ionicons name="arrow-forward" size={20} color="#0A0604" />
                    )}
                  </Pressable>
                </View>

                {trError && (
                  <Text style={dStyles.trErrorText}>{trError}</Text>
                )}

                {trOutput && (
                  <View style={dStyles.trOutputCard}>
                    <Text style={dStyles.trOutputLabel}>
                      {TR_LANG_LABEL[trOutput.lang].toUpperCase()}
                    </Text>
                    <Text style={dStyles.trOutputText}>{trOutput.text}</Text>
                  </View>
                )}

                {/* Category tabs */}
                <Text style={[dStyles.trLabel, { marginTop: 22 }]}>
                  Or pick a common phrase
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={dStyles.trCatRow}
                  contentContainerStyle={{ gap: 8, paddingRight: 12 }}
                >
                  {CATS.map((c) => (
                    <Pressable
                      key={c}
                      onPress={() => setTrCategory(c)}
                      style={[
                        dStyles.trCatChip,
                        trCategory === c && dStyles.trCatChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          dStyles.trCatChipText,
                          trCategory === c && { color: GOLD },
                        ]}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {filtered.map((p, i) => (
                  <Pressable
                    key={i}
                    style={dStyles.trCard}
                    onPress={() => {
                      setTrInput(p.en);
                      runTranslate(p.en);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Translate ${p.en}`}
                  >
                    <Text style={dStyles.trEn}>{p.en}</Text>
                    <View style={dStyles.trCardFooter}>
                      <Text style={dStyles.trCardCat}>{p.cat.toUpperCase()}</Text>
                      <View style={dStyles.trCardArrow}>
                        <Ionicons name="arrow-forward" size={12} color={GOLD} />
                      </View>
                    </View>
                  </Pressable>
                ))}

                <View style={dStyles.trFooter}>
                  <Ionicons
                    name="information-circle-outline"
                    size={14}
                    color={TEXT_DIM}
                  />
                  <Text style={dStyles.trFooterText}>
                    Powered by MyMemory · works offline only for saved phrases.
                  </Text>
                </View>
              </WalkSheet>
            );
          })()}

          {walkOverlay === "temple" && templeInfoIdx !== null && (() => {
            const t = LINGAMS[templeInfoIdx];
            const saved = savedMoments[templeInfoIdx] ?? [];
            return (
              <View style={dStyles.templeOverlay}>
                <Pressable
                  style={dStyles.templeBackdrop}
                  onPress={() => setWalkOverlay(null)}
                  accessibilityLabel="Close temple info"
                />
                <View style={dStyles.templeSheet}>
                  <View style={dStyles.templeHero}>
                    <Pressable
                      onPress={() => setWalkOverlay(null)}
                      style={dStyles.templeClose}
                      accessibilityRole="button"
                      accessibilityLabel="Close"
                    >
                      <Ionicons name="close" size={18} color="white" />
                    </Pressable>
                    <Text style={dStyles.templeKicker}>
                      LINGAM #{t.number} · {t.direction.toUpperCase()}
                    </Text>
                    <Text style={dStyles.templeHeadName}>{t.name}</Text>
                  </View>
                  <View style={dStyles.templeTabs}>
                    {["History", "Significance", "Experiences", "Blog"].map((tab, i) => (
                      <View
                        key={tab}
                        style={[dStyles.templeTabWrap, i === 0 && dStyles.templeTabWrapActive]}
                      >
                        <Text
                          style={[dStyles.templeTab, i === 0 && dStyles.templeTabActive]}
                        >
                          {tab}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ padding: 18, paddingBottom: 24 }}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={dStyles.templeBody}>{t.meaning}</Text>
                    <Text style={[dStyles.templeBody, { marginTop: 14 }]}>
                      {t.description}
                    </Text>
                  </ScrollView>
                  <View style={dStyles.templeFootRow}>
                    {[
                      { icon: "camera-outline" as const, label: "Add Memory", k: "photo" as const },
                      { icon: "share-outline" as const, label: "Share" },
                      { icon: "navigate-outline" as const, label: "Nav Guide" },
                      { icon: "close-outline" as const, label: "Close" },
                    ].map((f) => (
                      <Pressable
                        key={f.label}
                        style={dStyles.templeFootBtn}
                        onPress={() => {
                          if (f.k && templeInfoIdx !== null) {
                            saveMoment(templeInfoIdx, f.k);
                          } else if (f.label === "Close") {
                            setWalkOverlay(null);
                          } else {
                            Alert.alert(f.label, "Coming next.");
                          }
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={f.label}
                      >
                        <Ionicons name={f.icon} size={18} color={GOLD} />
                        <Text style={dStyles.templeFootLabel}>{f.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={dStyles.templeFootNote}>
                    Your walk is still active · {saved.length}{" "}
                    {saved.length === 1 ? "memory" : "memories"} here
                  </Text>
                </View>
              </View>
            );
          })()}

        </LinearGradient>
      </View>
    );
  }

  // ─── NORMAL MAP SCREEN ────────────────────────────────────────────────────
  return (
    <>
    {sankalpaPromptOpen && (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={dStyles.sankalpaRoot}
      >
        <ScrollView
          contentContainerStyle={dStyles.sankalpaScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={dStyles.sankalpaKicker}>SANKALPA · YOUR INTENTION</Text>
          <Text style={dStyles.sankalpaTitle}>
            Why are you walking today?
          </Text>
          <Text style={dStyles.sankalpaSub}>
            One line, in your own words. The app will return it to you at the end of your walk.
          </Text>

          <TextInput
            value={sankalpa}
            onChangeText={setSankalpa}
            placeholder="For my mother's health · for peace · for nothing at all…"
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
            maxLength={140}
            style={dStyles.sankalpaInput}
            autoFocus
          />

          <View style={dStyles.silentRow}>
            <View style={{ flex: 1 }}>
              <Text style={dStyles.silentRowTitle}>Walk in silence</Text>
              <Text style={dStyles.silentRowSub}>
                Phone stays dark. Vibrates only when you reach a lingam.
              </Text>
            </View>
            <Switch
              value={silentMode}
              onValueChange={setSilentMode}
              trackColor={{ false: "rgba(255,255,255,0.15)", true: GOLD }}
              thumbColor={silentMode ? "#FFE9B0" : "#888"}
            />
          </View>

          <Pressable
            onPress={startWalkAfterSankalpa}
            style={dStyles.sankalpaBeginBtn}
            accessibilityRole="button"
            accessibilityLabel="Begin the walk"
          >
            <Text style={dStyles.sankalpaBeginText}>Begin the walk</Text>
          </Pressable>
          <Pressable
            onPress={() => setSankalpaPromptOpen(false)}
            style={dStyles.sankalpaSkipBtn}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <Text style={dStyles.sankalpaSkipText}>Not now</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    )}
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
    </>
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

// ─── Dark/Gold walk-mode tokens & helpers ────────────────────────────────────
const GOLD = "#C47A1E";
const GOLD_DIM = "rgba(196,122,30,0.55)";
const DARK_BG = "#0A0604";
const DARK_PANEL = "rgba(20,12,6,0.95)";
const HAIRLINE = "rgba(196,122,30,0.18)";
const TEXT_DIM = "rgba(255,255,255,0.55)";

function NavTabBtn({
  emoji,
  label,
  active,
  onPress,
}: {
  emoji: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={dStyles.navTab}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <View style={[dStyles.navTabIcon, active && dStyles.navTabIconActive]}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <Text style={[dStyles.navTabLabel, active && dStyles.navTabLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function WalkSheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <View style={dStyles.sheetOverlay} pointerEvents="box-none">
      <Pressable
        style={dStyles.sheetBackdrop}
        onPress={onClose}
        accessibilityLabel="Close panel"
      />
      <View style={dStyles.sheet}>
        <View style={dStyles.sheetHandle} />
        <View style={dStyles.sheetHeader}>
          <Text style={dStyles.sheetTitle}>{title}</Text>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={20} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={{ padding: 18, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const dStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK_BG },
  gradient: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  kmBig: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: "white",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  kmUnit: { fontFamily: "Inter_500Medium", fontSize: 14, color: TEXT_DIM, letterSpacing: 1 },
  kmLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: TEXT_DIM, letterSpacing: 1.5, marginTop: 2 },
  topRight: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  timer: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: GOLD },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD },
  liveText: { fontFamily: "Inter_500Medium", fontSize: 10, color: TEXT_DIM, letterSpacing: 0.5 },
  endBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,80,60,0.55)",
    backgroundColor: "rgba(255,80,60,0.08)",
  },
  endBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#FF806C", letterSpacing: 0.5 },

  // Progress strip
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: HAIRLINE,
  },
  progressStrip: { flex: 1, flexDirection: "row", justifyContent: "space-between" },
  progressItem: { alignItems: "center", paddingHorizontal: 2, flex: 1 },
  templeIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  templeIconDone: {
    shadowColor: GOLD,
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  templeIconCurrent: {
    backgroundColor: "rgba(196,122,30,0.18)",
    shadowColor: GOLD,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  templeHalo: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(196,122,30,0.18)",
  },
  templeHaloCurrent: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(196,122,30,0.32)",
  },
  templeHaloUpcoming: {
    backgroundColor: "rgba(196,122,30,0.06)",
  },

  // Translator overlay
  trLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: GOLD,
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 2,
  },
  trLangRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  trLangPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HAIRLINE,
  },
  trLangPillActive: {
    backgroundColor: "rgba(196,122,30,0.14)",
    borderColor: "rgba(196,122,30,0.55)",
  },
  trLangPillText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.3,
  },
  trInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 10,
  },
  trInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HAIRLINE,
    color: "#fff",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 19,
  },
  trGoBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GOLD,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  trErrorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#FF806C",
    marginTop: 4,
    marginBottom: 8,
  },
  trOutputCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "rgba(196,122,30,0.08)",
    borderWidth: 1,
    borderColor: "rgba(196,122,30,0.35)",
  },
  trOutputLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    color: GOLD,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  trOutputText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#FFE9B0",
    lineHeight: 26,
  },
  trCatRow: {
    flexGrow: 0,
    marginBottom: 12,
  },
  trCatChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HAIRLINE,
  },
  trCatChipActive: {
    backgroundColor: "rgba(196,122,30,0.14)",
    borderColor: "rgba(196,122,30,0.55)",
  },
  trCatChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 0.3,
  },
  trCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HAIRLINE,
    marginBottom: 8,
  },
  trEn: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#fff",
    lineHeight: 18,
  },
  trCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  trCardCat: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    color: TEXT_DIM,
    letterSpacing: 1.5,
  },
  trCardArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(196,122,30,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  trFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
  },
  trFooterText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: TEXT_DIM,
    flex: 1,
  },
  templeName: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    color: "rgba(255,255,255,0.35)",
    marginTop: 2,
    textAlign: "center",
  },
  templeNameLit: { color: "rgba(255,255,255,0.85)" },
  progressCounter: {
    marginLeft: 8,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: GOLD,
  },

  // Map area
  mapArea: {
    flex: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  contour: {
    position: "absolute",
    left: "50%",
    top: "50%",
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(196,122,30,0.08)",
  },
  mountainLabel: {
    position: "absolute",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 3,
  },
  templePin: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(20,12,6,0.85)",
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: "center",
    justifyContent: "center",
  },
  templePinCurrent: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: -18,
    marginTop: -18,
    backgroundColor: "rgba(196,122,30,0.18)",
    borderColor: GOLD,
    shadowColor: GOLD,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  utilPin: {
    position: "absolute",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgba(20,12,6,0.85)",
    borderWidth: 1,
    borderColor: HAIRLINE,
  },
  utilPinText: { fontFamily: "Inter_500Medium", fontSize: 10, color: "rgba(255,255,255,0.75)" },
  userDotWrap: { position: "absolute", width: 20, height: 20, alignItems: "center", justifyContent: "center" },
  userDotPulse: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(196,122,30,0.25)",
  },
  userDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GOLD,
    borderWidth: 2,
    borderColor: "white",
  },
  recenterFab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(20,12,6,0.9)",
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: "center",
    justifyContent: "center",
  },

  // Geofence card
  geofenceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 14,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: DARK_PANEL,
    borderWidth: 1,
    borderColor: GOLD_DIM,
  },
  geofenceIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(196,122,30,0.12)",
  },
  geofenceApproach: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 1,
    color: TEXT_DIM,
  },
  geofenceName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "white", marginTop: 1 },
  geofenceCta: { marginTop: 6, alignSelf: "flex-start" },
  geofenceCtaText: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: GOLD, letterSpacing: 0.3 },

  // Bottom nav
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 22,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIRLINE,
    backgroundColor: "rgba(10,6,4,0.95)",
  },
  navTab: { alignItems: "center", flex: 1 },
  navTabIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  navTabIconActive: {
    backgroundColor: "rgba(196,122,30,0.15)",
    shadowColor: GOLD,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  navTabLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: TEXT_DIM,
    marginTop: 4,
  },
  navTabLabelActive: { color: GOLD },
  plusBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    shadowColor: GOLD,
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },

  // Sheet (overlay)
  sheetOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    backgroundColor: DARK_PANEL,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: GOLD_DIM,
    maxHeight: "75%",
    paddingTop: 8,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 6,
  },
  sheetTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    color: GOLD,
    letterSpacing: 2,
  },

  // Japa
  japaWrap: { alignItems: "center", paddingVertical: 10 },
  japaMandala: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: GOLD_DIM,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: GOLD,
    shadowOpacity: 0.6,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  japaBig: { fontFamily: "Inter_700Bold", fontSize: 56, color: "white", letterSpacing: -1 },
  japaSub: { fontFamily: "Inter_500Medium", fontSize: 11, color: TEXT_DIM, letterSpacing: 1.5, marginTop: 2 },
  japaRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  japaSideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(196,122,30,0.1)",
    borderWidth: 1,
    borderColor: HAIRLINE,
  },
  japaTapBtn: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: GOLD,
  },
  japaTapText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#0A0604", letterSpacing: 0.5 },
  japaReset: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 6 },
  japaResetText: { fontFamily: "Inter_500Medium", fontSize: 11, color: TEXT_DIM, letterSpacing: 0.5 },

  // Audio
  audioTabs: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: HAIRLINE,
    marginBottom: 12,
  },
  audioTab: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: TEXT_DIM,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  audioTabActive: {
    color: GOLD,
    backgroundColor: "rgba(196,122,30,0.12)",
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.06)",
  },
  audioTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "white" },
  audioArtist: { fontFamily: "Inter_400Regular", fontSize: 11, color: TEXT_DIM, marginTop: 2 },
  audioFoot: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: TEXT_DIM,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 14,
  },

  // Plus / actions
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.06)",
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(196,122,30,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "white" },
  actionSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: TEXT_DIM, marginTop: 2 },

  // Utilities
  utilRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.06)",
  },
  utilRowIcon: { fontSize: 22, width: 34, textAlign: "center" },
  utilLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "white" },
  utilSub: { fontFamily: "Inter_400Regular", fontSize: 11, color: TEXT_DIM, marginTop: 2 },

  // Temple info
  templeOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  templeBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.7)" },
  templeSheet: {
    height: "85%",
    backgroundColor: DARK_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    borderTopWidth: 1,
    borderColor: GOLD_DIM,
  },
  templeHero: {
    height: 180,
    backgroundColor: "#1A0F08",
    paddingHorizontal: 22,
    paddingTop: 24,
    justifyContent: "flex-end",
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderColor: HAIRLINE,
  },
  templeClose: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  templeKicker: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: GOLD,
    letterSpacing: 2,
    marginBottom: 6,
  },
  templeHeadName: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "white",
    letterSpacing: -0.5,
  },
  templeTabs: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: HAIRLINE,
  },
  templeTabWrap: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  templeTabWrapActive: { backgroundColor: "rgba(196,122,30,0.12)" },
  templeTab: { fontFamily: "Inter_500Medium", fontSize: 12, color: TEXT_DIM },
  templeTabActive: { color: GOLD },
  templeBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.85)",
  },
  templeFootRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: HAIRLINE,
    backgroundColor: "rgba(20,12,6,0.7)",
  },
  templeFootBtn: { alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4 },
  templeFootLabel: { fontFamily: "Inter_500Medium", fontSize: 10, color: TEXT_DIM, letterSpacing: 0.3 },
  templeFootNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: TEXT_DIM,
    textAlign: "center",
    paddingHorizontal: 18,
    paddingBottom: 12,
    fontStyle: "italic",
  },

  // ─── Silent walk mode ───────────────────────────────────────────────────
  silentPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HAIRLINE,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  silentPillOn: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  silentScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.93)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 60,
  },
  silentInner: {
    alignItems: "center",
    paddingHorizontal: 36,
    gap: 10,
  },
  silentTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: GOLD,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  silentSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: TEXT_DIM,
    textAlign: "center",
    lineHeight: 20,
  },
  silentTap: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1.5,
    marginTop: 24,
    fontStyle: "italic",
  },

  // ─── End-of-walk ritual ─────────────────────────────────────────────────
  ritualRoot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 80,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  ritualInner: {
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  ritualKicker: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: GOLD,
    letterSpacing: 2.5,
  },
  ritualKm: {
    fontFamily: "Inter_700Bold",
    fontSize: 56,
    color: "white",
    marginTop: 6,
    letterSpacing: -1,
  },
  ritualKmUnit: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    color: TEXT_DIM,
  },
  ritualTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: TEXT_DIM,
    letterSpacing: 1,
    marginTop: -4,
  },
  ritualLingamRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 28,
    marginBottom: 20,
    justifyContent: "center",
  },
  ritualLingamDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(196,122,30,0.12)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GOLD,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  ritualSankalpaCard: {
    width: "100%",
    paddingHorizontal: 22,
    paddingVertical: 22,
    borderRadius: 18,
    backgroundColor: "rgba(196,122,30,0.06)",
    borderWidth: 1,
    borderColor: "rgba(196,122,30,0.25)",
    alignItems: "center",
    marginTop: 6,
  },
  ritualSankalpaLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    color: GOLD,
    letterSpacing: 2,
    textAlign: "center",
  },
  ritualSankalpaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "white",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 10,
    fontStyle: "italic",
  },
  ritualSankalpaHand: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: TEXT_DIM,
    marginTop: 12,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  ritualMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: TEXT_DIM,
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  ritualBtn: {
    marginTop: 32,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: GOLD,
  },
  ritualBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "#0A0604",
    letterSpacing: 0.5,
  },

  // ─── Sankalpa prompt (before walk) ──────────────────────────────────────
  sankalpaRoot: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0A0604",
    zIndex: 100,
  },
  sankalpaScroll: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 90,
    paddingBottom: 40,
    justifyContent: "center",
  },
  sankalpaKicker: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: GOLD,
    letterSpacing: 2.5,
    textAlign: "center",
  },
  sankalpaTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 26,
    color: "white",
    textAlign: "center",
    marginTop: 10,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  sankalpaSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: TEXT_DIM,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  sankalpaInput: {
    marginTop: 28,
    minHeight: 110,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: HAIRLINE,
    color: "white",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlignVertical: "top",
  },
  silentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: HAIRLINE,
  },
  silentRowTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: "white",
  },
  silentRowSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: TEXT_DIM,
    marginTop: 3,
    lineHeight: 16,
  },
  sankalpaBeginBtn: {
    marginTop: 28,
    padding: 18,
    borderRadius: 18,
    backgroundColor: GOLD,
    alignItems: "center",
  },
  sankalpaBeginText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#0A0604",
    letterSpacing: 0.5,
  },
  sankalpaSkipBtn: {
    marginTop: 10,
    padding: 14,
    alignItems: "center",
  },
  sankalpaSkipText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: TEXT_DIM,
  },
});
