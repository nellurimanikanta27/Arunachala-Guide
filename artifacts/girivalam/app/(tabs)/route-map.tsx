import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BlurView } from "expo-blur";

import { GirivalamMap } from "@/components/girivalam-map";
import ScreenBadge from "@/components/ScreenBadge";
import Colors from "@/constants/colors";
// CINEMATIC-V1
import { AmbientParticles, CINEMATIC_V1, HaloPulse, SERIF_DISPLAY } from "@/lib/cinematic-v1";
import { addBookmark, addMoment, type Bookmark, finishWalk, getBookmarks, getMomentsForWalk, getSettings, getWalkProgress, type Moment, removeBookmark, startWalk, updateSettings, updateWalk } from "@/lib/pilgrimage-store";
import * as ImagePicker from "expo-image-picker";

const PREP_SEEN_KEY = "girivalam:firstWalkPrepSeen";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

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
  deity: string;
  planet: string;
  element: string;
  mantra: string;
  benefit: string;
  specialty: string;
}

const LINGAMS: Lingam[] = [
  { number: 1, name: "Indra Lingam", direction: "East", description: "Near the main Arunachaleswarar Temple entrance", distance: "0 km", lat: 12.2330, lng: 79.0750, meaning: "East. The lingam of beginnings. The walk truly starts here — walk with intention.",
    deity: "Lord Indra, king of the devas", planet: "Sun (Surya)", element: "Sky / Space",
    mantra: "Om Indraya Namaha",
    benefit: "Removes obstacles at the start of any journey · brings authority, leadership, and good fortune.",
    specialty: "The walk traditionally begins here at sunrise. Indra performed Girivalam to atone for his sins — pilgrims bow here to begin with humility." },
  { number: 2, name: "Agni Lingam", direction: "South-East", description: "Associated with fire element, near Kottai area", distance: "2 km", lat: 12.2264, lng: 79.0747, meaning: "Fire. Sit briefly. What do you want to burn away on this walk?",
    deity: "Agni, god of fire", planet: "Venus (Shukra)", element: "Fire (Agni)",
    mantra: "Om Agnaye Namaha",
    benefit: "Burns away karma, illness, and negative habits · purifies the body and aura.",
    specialty: "Devotees offer ghee lamps here. Arunachala itself appeared as a column of fire — Agni Lingam holds that primordial flame." },
  { number: 3, name: "Yama Lingam", direction: "South", description: "South direction shrine", distance: "3.5 km", lat: 12.2195, lng: 79.0700, meaning: "South — the direction of endings, of letting go. If something wants to release here, let it.",
    deity: "Yama, lord of dharma & death", planet: "Mars (Mangala)", element: "Earth",
    mantra: "Om Yamaya Namaha",
    benefit: "Removes fear of death · grants long life, protection, and freedom from untimely end.",
    specialty: "The most powerful lingam for releasing fear. Pilgrims pray here for ancestors and for a peaceful end to suffering." },
  { number: 4, name: "Niruthi Lingam", direction: "South-West", description: "Marking the south-west quarter of the hill", distance: "5 km", lat: 12.2237, lng: 79.0584, meaning: "South-West. The halfway turning. You have come this far. Keep walking.",
    deity: "Nirruti, guardian of the south-west", planet: "Rahu", element: "Earth",
    mantra: "Om Nirrutaye Namaha",
    benefit: "Removes enemies, lawsuits, hidden troubles · protects against black magic and evil eye.",
    specialty: "The quietest of the eight. Worship here is said to dissolve karma you didn't even know you were carrying." },
  { number: 5, name: "Varuna Lingam", direction: "West", description: "Water element shrine on western path", distance: "7 km", lat: 12.2322, lng: 79.0530, meaning: "Water. Let something soften inside you. The path is older here.",
    deity: "Varuna, lord of waters & oceans", planet: "Saturn (Shani)", element: "Water (Jala)",
    mantra: "Om Varunaya Namaha",
    benefit: "Cures water-related illness · brings rain, prosperity, and emotional healing.",
    specialty: "Childless couples come here to pray. Bathing in nearby Theerthams after darshan is considered especially auspicious." },
  { number: 6, name: "Vayu Lingam", direction: "North-West", description: "Wind element, scenic forest section", distance: "9 km", lat: 12.2456, lng: 79.0571, meaning: "Wind. The wild forest section. The hill feels very close here. Walk slowly.",
    deity: "Vayu, god of wind & breath", planet: "Moon (Chandra)", element: "Air (Vayu)",
    mantra: "Om Vayave Namaha",
    benefit: "Cures lung and breathing diseases · steadies the mind · removes mental restlessness.",
    specialty: "The forest grows thick here. Sit and breathe — pranayama at Vayu Lingam is said to give the fruit of a thousand chants." },
  { number: 7, name: "Kubera Lingam", direction: "North", description: "Prosperity shrine near northern path", distance: "11 km", lat: 12.2516, lng: 79.0670, meaning: "North — the abundance of stillness, not of things. The quieter half.",
    deity: "Kubera, lord of wealth", planet: "Mercury (Budha)", element: "Water",
    mantra: "Om Kuberaya Namaha",
    benefit: "Brings wealth, business success, and removes debts · grants lasting prosperity.",
    specialty: "Merchants and householders come here on Pournami nights. Light a lamp facing north — Kubera's direction — for sustained abundance." },
  { number: 8, name: "Isanya Lingam", direction: "North-East", description: "Last major shrine before completing the circle", distance: "13 km", lat: 12.2474, lng: 79.0764, meaning: "Almost home. Something is completing. Let yourself feel it.",
    deity: "Ishana — a fierce form of Shiva himself", planet: "Jupiter (Guru)", element: "Space / Consciousness",
    mantra: "Om Ishanaya Namaha",
    benefit: "Grants moksha (liberation) · removes the deepest karma · awakens self-knowledge.",
    specialty: "The highest of the eight. Ramana Maharshi taught that the walk truly completes only when you arrive here — and recognise the hill in your own heart." },
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

  // Pilgrim name for the share card (persisted in Settings)
  const [pilgrimName, setPilgrimName] = useState<string>("");
  useEffect(() => {
    getSettings()
      .then((s) => {
        if (s.pilgrimName) setPilgrimName(s.pilgrimName);
      })
      .catch(() => {});
  }, []);
  const savePilgrimName = (n: string) => {
    setPilgrimName(n);
    updateSettings({ pilgrimName: n.trim() || undefined }).catch(() => {});
  };

  // Expanded lingam detail rows (collapsed by default)
  const [expandedLingams, setExpandedLingams] = useState<Set<number>>(new Set());
  const toggleLingam = (n: number) => {
    setExpandedLingams((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  // Walk mode
  const [walkMode, setWalkMode] = useState(false);
  const [walkSeconds, setWalkSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const omPulse = useRef(new Animated.Value(0.4)).current;

  // Saved moments at each lingam — persisted via pilgrimage-store
  const [savedMoments, setSavedMoments] = useState<Record<number, string[]>>({});
  // Photo URIs captured during current walk — keyed by lingamIdx, multiple per lingam
  const [walkPhotos, setWalkPhotos] = useState<{ uri: string; lingamIdx: number; lingamName: string }[]>([]);
  const [dismissedFor, setDismissedFor] = useState<number | null>(null);
  const [currentWalkId, setCurrentWalkId] = useState<string | null>(null);
  const [walkNumber, setWalkNumber] = useState<number | null>(null);
  // Walk-screen overlay (plus / utilities / temple info)
  type WalkOverlay = null | "plus" | "utilities" | "temple" | "translator" | "spots";
  const [walkOverlay, setWalkOverlay] = useState<WalkOverlay>(null);
  const [templeInfoIdx, setTempleInfoIdx] = useState<number | null>(null);
  // Bookmarked sacred spots — loaded on demand for the list overlay.
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  // Refs avoid stale-closure / concurrent-tap races on saveMoment.
  const currentWalkIdRef = useRef<string | null>(null);
  const walkInFlightRef = useRef<Promise<string> | null>(null);
  const savedKindsRef = useRef<Set<string>>(new Set()); // "lingamIdx:kind"

  // Sankalpa thread — the "why" of this walk
  const [sankalpa, setSankalpa] = useState("");
  const [sankalpaPromptOpen, setSankalpaPromptOpen] = useState(false);

  // Silent walk mode — phone stays dark, only vibrates at each lingam
  const [silentMode, setSilentMode] = useState(false);

  // First-time prep — show checklist / best time / safety only on the very
  // first opening of the Sankalpa prompt. After the first "Begin the walk",
  // never shown again on this device.
  const [showFirstWalkPrep, setShowFirstWalkPrep] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(PREP_SEEN_KEY)
      .then((v) => {
        if (v == null) setShowFirstWalkPrep(true);
      })
      .catch(() => {});
  }, []);

  // End-of-walk ritual overlay (animated lingam glow + sankalpa return)
  const [endRitualOpen, setEndRitualOpen] = useState(false);
  const lingamGlows = useRef(LINGAMS.map(() => new Animated.Value(0))).current;

  // Edge panel (quick-access drawer during walk)
  const [edgePanelOpen, setEdgePanelOpen] = useState(false);

  // Utility filter column (left edge of the map). Each toggle reveals
  // its pins on the map. Defaults to all on so the map feels alive.
  type UtilKey = "water" | "toilet" | "anna" | "rest" | "ashram" | "ess";
  const UTILS: { key: UtilKey; icon: keyof typeof Ionicons.glyphMap; color: string; label: string }[] = [
    { key: "water", icon: "water", color: "#4FA8FF", label: "Water" },
    { key: "toilet", icon: "medkit", color: "#B583FF", label: "Toilet" },
    { key: "anna", icon: "leaf", color: "#E0B658", label: "Annaprasadam" },
    { key: "rest", icon: "restaurant", color: "#FF6B6B", label: "Restaurant" },
    { key: "ashram", icon: "home", color: "#9BD17C", label: "Ashram" },
    { key: "ess", icon: "sparkles", color: "#FFD98A", label: "Essentials" },
  ];
  const [utilOn, setUtilOn] = useState<Record<UtilKey, boolean>>({
    water: true, toilet: true, anna: true, rest: true, ashram: false, ess: false,
  });
  const toggleUtil = (k: UtilKey) =>
    setUtilOn((s) => ({ ...s, [k]: !s[k] }));

  // Sample on-map utility pins — each tied to a UtilKey + position + distance
  const UTIL_PINS: { key: UtilKey; top: string; left?: string; right?: string; dist: string }[] = [
    { key: "water", top: "18%", left: "8%", dist: "120m" },
    { key: "toilet", top: "20%", right: "8%", dist: "240m" },
    { key: "anna", top: "44%", left: "6%", dist: "150m" },
    { key: "rest", top: "44%", right: "6%", dist: "300m" },
    { key: "ashram", top: "62%", right: "10%", dist: "200m" },
    { key: "water", top: "70%", left: "12%", dist: "80m" },
  ];

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
    if (showFirstWalkPrep) {
      setShowFirstWalkPrep(false);
      AsyncStorage.setItem(PREP_SEEN_KEY, "1").catch(() => {});
    }
    setWalkSeconds(0);
    setSavedMoments({});
    setDismissedFor(null);
    setWalkOverlay(null);
    setTempleInfoIdx(null);
    savedKindsRef.current = new Set();
    setWalkNumber(null);
    try {
      const p = await getWalkProgress();
      setWalkNumber(p.completedWalks + 1);
    } catch {
      // Fall back to unknown; pill will simply hide.
    }
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
    setWalkNumber(null);
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
    const lingam = LINGAMS[lingamIdx];

    // ── Photo capture: launch camera/library, save URI to walk archive ────
    if (kind === "photo") {
      try {
        // Try camera first; fall back to library if camera unavailable (e.g. web).
        let result: ImagePicker.ImagePickerResult | null = null;
        if (Platform.OS !== "web") {
          const camPerm = await ImagePicker.requestCameraPermissionsAsync();
          if (camPerm.granted) {
            result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
              allowsEditing: false,
            });
          }
        }
        if (!result || result.canceled) {
          const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!libPerm.granted) {
            Alert.alert("Permission needed", "Please allow photo access to add a memory.");
            return;
          }
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: false,
          });
        }
        if (result.canceled || !result.assets?.[0]?.uri) return;
        const uri = result.assets[0].uri;

        setWalkPhotos((prev) => [...prev, { uri, lingamIdx, lingamName: lingam?.name ?? "Unknown lingam" }]);
        setSavedMoments((prev) => {
          const existing = prev[lingamIdx] ?? [];
          if (existing.includes(kind)) return prev;
          return { ...prev, [lingamIdx]: [...existing, kind] };
        });

        try {
          const walkId = await ensureWalkId();
          await addMoment({
            walkId,
            lingamIdx,
            lingamName: lingam?.name ?? "Unknown lingam",
            kind,
            uri,
          });
        } catch (e) {
          console.warn("Failed to persist photo moment", e);
        }
        return;
      } catch (e) {
        console.warn("Photo capture failed", e);
        Alert.alert("Couldn't capture photo", "Please try again.");
        return;
      }
    }

    // ── Non-photo moments (voice / note / feeling) ─────────────────────────
    const dedupeKey = `${lingamIdx}:${kind}`;
    if (savedKindsRef.current.has(dedupeKey)) return;
    savedKindsRef.current.add(dedupeKey);

    setSavedMoments((prev) => {
      const existing = prev[lingamIdx] ?? [];
      if (existing.includes(kind)) return prev;
      return { ...prev, [lingamIdx]: [...existing, kind] };
    });

    const label = { photo: "Photo", voice: "Voice note", note: "Written note", feeling: "Feeling" }[kind];

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
      savedKindsRef.current.delete(dedupeKey);
    }

    const captureNote =
      kind === "voice"
        ? `\n\nMicrophone capture is being added next. The moment marker is already saved to your pilgrimage.`
        : "";

    Alert.alert(
      `${label} — ${lingam?.name ?? ""}`,
      `Saved to your pilgrimage archive on this phone.${captureNote}`
    );
  }

  // Load walk photos when end ritual opens (covers reloads & cold pilgrims)
  useEffect(() => {
    if (!endRitualOpen) return;
    const id = currentWalkIdRef.current;
    if (!id) return;
    getMomentsForWalk(id)
      .then((ms: Moment[]) => {
        const photos = ms
          .filter((m) => m.kind === "photo" && !!m.uri)
          .map((m) => ({ uri: m.uri as string, lingamIdx: m.lingamIdx, lingamName: m.lingamName }));
        if (photos.length > 0) setWalkPhotos(photos);
      })
      .catch(() => {});
  }, [endRitualOpen]);

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
          {/* CINEMATIC-V1: ambient gold particles drifting upward */}
          {CINEMATIC_V1 && <AmbientParticles count={14} />}
          {/* ── Top header: KM · timer · End Session ── */}
          <View style={[dStyles.topBar, { paddingTop: topInset + 14 }]}>
            <View>
              <Text style={dStyles.kmBig}>
                {distKm.toFixed(1)}
                <Text style={dStyles.kmUnit}> KM</Text>
              </Text>
              <View style={dStyles.kmLabelRow}>
                <Text style={dStyles.kmLabel}>Covered</Text>
                {walkNumber != null && (
                  <View style={dStyles.walkNumPill}>
                    <Text style={dStyles.walkNumPillText}>{ordinal(walkNumber)} walk</Text>
                  </View>
                )}
              </View>
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

            {/* Filter-driven utility pins — colored dot + label */}
            {UTIL_PINS.filter((p) => utilOn[p.key]).map((p, i) => {
              const u = UTILS.find((x) => x.key === p.key)!;
              return (
                <View
                  key={`${p.key}-${i}`}
                  style={[
                    dStyles.utilPin,
                    p.left ? { left: p.left as any } : null,
                    p.right ? { right: p.right as any } : null,
                    { top: p.top as any },
                  ]}
                >
                  <View style={[dStyles.utilPinDot, { backgroundColor: u.color, shadowColor: u.color }]}>
                    <Ionicons name={u.icon} size={10} color="#0A0604" />
                  </View>
                  <Text style={dStyles.utilPinText}>
                    {u.label} · <Text style={{ color: "rgba(255,255,255,0.55)" }}>{p.dist}</Text>
                  </Text>
                </View>
              );
            })}

            {/* Vertical utility filter column — sits on the LEFT edge of the map.
                Positioned high enough to never overlap the W temple pin (which sits at
                vertical centre). Rendered BEFORE the user dot so pin/dot taps win on
                any narrow-device collision. */}
            <View style={dStyles.utilColumn} pointerEvents="box-none">
              {UTILS.map((u) => {
                const on = utilOn[u.key];
                return (
                  <Pressable
                    key={u.key}
                    onPress={() => toggleUtil(u.key)}
                    style={[
                      dStyles.utilColumnBtn,
                      on && { borderColor: u.color, backgroundColor: "rgba(0,0,0,0.55)" },
                    ]}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={`${u.label} pins`}
                  >
                    <Ionicons
                      name={u.icon}
                      size={14}
                      color={on ? u.color : "rgba(255,255,255,0.35)"}
                    />
                  </Pressable>
                );
              })}
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
              emoji="🗣️"
              label="Translate"
              active={walkOverlay === "translator"}
              onPress={() => setWalkOverlay(walkOverlay === "translator" ? null : "translator")}
            />
          </View>

          {/* ── Overlays (always inside the session) ── */}
          {walkOverlay === "plus" && (
            <WalkSheet title="ACTIONS" onClose={() => setWalkOverlay(null)}>
              {[
                {
                  icon: "create-outline" as const,
                  title: "Quick Note",
                  sub: "Write your thoughts",
                  go: () =>
                    Alert.alert(
                      "Quick Note",
                      "Capture pipeline is being added next. Your moment will be saved with GPS + time + this session."
                    ),
                },
                {
                  icon: "camera-outline" as const,
                  title: "Photo Capture",
                  sub: "Capture the moment",
                  go: () =>
                    Alert.alert(
                      "Photo Capture",
                      "Capture pipeline is being added next. Your moment will be saved with GPS + time + this session."
                    ),
                },
                {
                  icon: "videocam-outline" as const,
                  title: "Video Capture",
                  sub: "Record your journey",
                  go: () =>
                    Alert.alert(
                      "Video Capture",
                      "Capture pipeline is being added next. Your moment will be saved with GPS + time + this session."
                    ),
                },
                {
                  icon: "language-outline" as const,
                  title: "Translator",
                  sub: "Tamil · Hindi · Telugu",
                  go: () => setWalkOverlay("translator"),
                },
              ].map((a) => (
                <Pressable
                  key={a.title}
                  style={dStyles.actionRow}
                  onPress={() => {
                    if (a.title === "Translator") {
                      a.go();
                    } else {
                      setWalkOverlay(null);
                      a.go();
                    }
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
              {/* Sacred-spots: bookmark current GPS, or view saved list */}
              <Pressable
                style={dStyles.utilRow}
                onPress={async () => {
                  if (!userLocation) {
                    Alert.alert("No location yet", "Waiting for GPS — try again in a moment.");
                    return;
                  }
                  const stamp = new Date().toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  await addBookmark({
                    lat: userLocation.lat,
                    lng: userLocation.lng,
                    note: `Sacred spot · ${stamp}`,
                  });
                  setBookmarks(await getBookmarks());
                  setWalkOverlay(null);
                  Alert.alert("Bookmarked", "This spot is saved. See it under My Sacred Spots.");
                }}
                accessibilityRole="button"
                accessibilityLabel="Bookmark this spot"
              >
                <Text style={dStyles.utilRowIcon}>⭐</Text>
                <View style={{ flex: 1 }}>
                  <Text style={dStyles.utilLabel}>Bookmark this spot</Text>
                  <Text style={dStyles.utilSub}>Save where you are right now</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.3)" />
              </Pressable>
              <Pressable
                style={dStyles.utilRow}
                onPress={async () => {
                  const list = await getBookmarks();
                  setBookmarks(list);
                  setWalkOverlay("spots");
                }}
                accessibilityRole="button"
                accessibilityLabel="My sacred spots"
              >
                <Text style={dStyles.utilRowIcon}>🪷</Text>
                <View style={{ flex: 1 }}>
                  <Text style={dStyles.utilLabel}>My Sacred Spots</Text>
                  <Text style={dStyles.utilSub}>Bookmarks you've saved</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.3)" />
              </Pressable>

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

          {walkOverlay === "spots" && (
            <WalkSheet title="MY SACRED SPOTS" onClose={() => setWalkOverlay(null)}>
              {bookmarks.length === 0 ? (
                <Text style={{ color: "rgba(255,255,255,0.55)", fontFamily: "Inter_400Regular", fontSize: 13, textAlign: "center", paddingVertical: 24 }}>
                  No spots yet. Tap &ldquo;Bookmark this spot&rdquo; in Utilities to save where you are.
                </Text>
              ) : (
                bookmarks
                  .slice()
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((b) => (
                    <View key={b.id} style={dStyles.utilRow}>
                      <Text style={dStyles.utilRowIcon}>⭐</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={dStyles.utilLabel} numberOfLines={1}>{b.note}</Text>
                        <Text style={dStyles.utilSub}>
                          {b.lat.toFixed(4)}, {b.lng.toFixed(4)}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          Alert.alert("Remove spot?", b.note, [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Remove",
                              style: "destructive",
                              onPress: async () => {
                                await removeBookmark(b.id);
                                const list = await getBookmarks();
                                setBookmarks(list);
                              },
                            },
                          ]);
                        }}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove ${b.note}`}
                      >
                        <Ionicons name="trash-outline" size={16} color="rgba(255,255,255,0.4)" />
                      </Pressable>
                    </View>
                  ))
              )}
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
          {endRitualOpen && (() => {
            const distKm = ((walkSeconds / 3600) * 3).toFixed(1);
            const timeStr = formatTime(walkSeconds);
            const which = walkNumber != null ? `${ordinal(walkNumber)} Girivalam` : "Girivalam";
            const dateStr = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
            const sk = sankalpa.trim();
            const momentCount = Object.values(savedMoments).reduce((acc, arr) => acc + (arr?.length ?? 0), 0);
            const displayName = pilgrimName.trim() || "A devoted pilgrim";

            const onShare = async () => {
              const lines = [
                `${displayName} completed their ${which} 🕉️`,
                `Around Arunachala · ${dateStr}`,
                `${distKm} km · ${timeStr}`,
              ];
              if (sk.length > 0) lines.push(`Sankalpa: "${sk}"`);
              if (momentCount > 0) lines.push(`${momentCount} sacred moments captured along the path.`);
              lines.push("Om Namah Shivaya 🔥");
              lines.push("Arunachala calls — Tiruvannamalai.");
              const summary = lines.join("\n");
              try {
                const result = await Share.share({ message: summary });
                if (result.action === Share.dismissedAction && Platform.OS === "web") throw new Error("dismissed");
              } catch {
                try {
                  if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
                    await navigator.clipboard.writeText(summary);
                    Alert.alert("Copied", "Your card text is copied — paste it on WhatsApp with the screenshot.");
                    return;
                  }
                } catch {}
                Alert.alert("Share your Girivalam", summary);
              }
            };

            // Polaroid tilts repeat across photos for a hand-laid look
            const tilts = [-4, 3, -2, 4, -3, 2, -5, 3];

            const openSocial = async (kind: "whatsapp" | "instagram" | "facebook" | "share") => {
              const lines = [
                `${displayName} completed ${which} 🕉️`,
                `Arunachala · ${dateStr}`,
                `${distKm} km · ${timeStr}`,
              ];
              if (sk.length > 0) lines.push(`Sankalpa: "${sk}"`);
              lines.push("May Arunachala's Grace stay with you always.");
              lines.push("#Girivalam #Arunachala");
              const summary = lines.join("\n");

              if (kind === "share") return onShare();
              const urls: Record<string, string> = {
                whatsapp: `whatsapp://send?text=${encodeURIComponent(summary)}`,
                instagram: `instagram://story-camera`,
                facebook: `fb://composer`,
              };
              try {
                const supported = await Linking.canOpenURL(urls[kind]);
                if (supported) {
                  await Linking.openURL(urls[kind]);
                  return;
                }
              } catch {}
              onShare();
            };

            return (
              <View style={dStyles.ritualRoot}>
                <ScrollView contentContainerStyle={cardStyles.scrollPad} showsVerticalScrollIndicator={false}>
                  {/* The card itself — designed to be screenshotted & shared */}
                  <View style={cardStyles.card}>
                    <LinearGradient
                      colors={["#0A0604", "#15090A", "#1E0F0A", "#0A0604"]}
                      locations={[0, 0.35, 0.7, 1]}
                      style={cardStyles.cardBg}
                    >
                      {/* Ornate gold border + corners */}
                      <View pointerEvents="none" style={cardStyles.borderOuter} />
                      <View pointerEvents="none" style={cardStyles.borderInner} />
                      <View pointerEvents="none" style={[cardStyles.corner, cardStyles.cornerTL]}>
                        <MaterialCommunityIcons name="flower-tulip-outline" size={22} color="#C47A1E" />
                      </View>
                      <View pointerEvents="none" style={[cardStyles.corner, cardStyles.cornerTR]}>
                        <MaterialCommunityIcons name="flower-tulip-outline" size={22} color="#C47A1E" style={{ transform: [{ scaleX: -1 }] }} />
                      </View>
                      <View pointerEvents="none" style={[cardStyles.corner, cardStyles.cornerBL]}>
                        <MaterialCommunityIcons name="flower-tulip-outline" size={22} color="#C47A1E" style={{ transform: [{ scaleY: -1 }] }} />
                      </View>
                      <View pointerEvents="none" style={[cardStyles.corner, cardStyles.cornerBR]}>
                        <MaterialCommunityIcons name="flower-tulip-outline" size={22} color="#C47A1E" style={{ transform: [{ scaleX: -1 }, { scaleY: -1 }] }} />
                      </View>

                      {/* Header row: small triangle + ARUNACHALA + moon */}
                      <View style={cardStyles.headerRow}>
                        <MaterialCommunityIcons name="triangle-outline" size={14} color="#FFD98A" />
                        <View style={{ flex: 1, alignItems: "center" }}>
                          <Text style={cardStyles.headerTitle}>ARUNACHALA</Text>
                          <Text style={cardStyles.headerSub}>— THE HILL THAT CALLS —</Text>
                        </View>
                        <MaterialCommunityIcons name="moon-full" size={20} color="#FFEAB3" />
                      </View>

                      {/* Hero hill */}
                      <View style={cardStyles.hillWrap}>
                        <Image
                          source={require("../../assets/images/girivalam-hill-overview.png")}
                          style={cardStyles.hillImage}
                          resizeMode="cover"
                          accessibilityLabel="Arunachala Hill at dusk with the girivalam path glowing"
                        />
                        <LinearGradient
                          colors={["transparent", "rgba(10,6,4,0.7)", "#0A0604"]}
                          locations={[0.55, 0.85, 1]}
                          style={StyleSheet.absoluteFill}
                          pointerEvents="none"
                        />
                      </View>

                      {/* Completed banner */}
                      <View style={cardStyles.completedRow}>
                        <View style={cardStyles.thinLine} />
                        <Text style={cardStyles.completedText}>COMPLETED</Text>
                        <View style={cardStyles.thinLine} />
                      </View>
                      <Text style={cardStyles.bigTitle}>GIRIVALAM</Text>
                      <View style={cardStyles.sharanamRow}>
                        <Ionicons name="chevron-back" size={10} color="#C47A1E" />
                        <Text style={cardStyles.sharanam}>ARUNACHALA SHARANAM</Text>
                        <Ionicons name="chevron-forward" size={10} color="#C47A1E" />
                      </View>
                      <View style={cardStyles.lingamIconWrap}>
                        <MaterialCommunityIcons name="temple-hindu" size={20} color="#FFD98A" />
                      </View>

                      {/* Sacred quote */}
                      <Text style={cardStyles.openQuote}>“</Text>
                      <Text style={cardStyles.quoteText}>
                        Around the Hill we walk,{"\n"}Within the Self we rest.
                      </Text>
                      <Text style={cardStyles.quoteAttribution}>~ Bhagavan Sri Ramana Maharshi</Text>

                      {/* Pilgrim name (cursive) */}
                      <TextInput
                        value={pilgrimName}
                        onChangeText={savePilgrimName}
                        placeholder="Your name"
                        placeholderTextColor="rgba(255,234,179,0.35)"
                        style={cardStyles.nameCursive}
                        maxLength={40}
                        autoCapitalize="words"
                        accessibilityLabel="Your name for the share card"
                      />
                      <Text style={cardStyles.embracedText}>
                        You have walked. You have offered.{"\n"}
                        You have been embraced by{" "}
                        <Text style={{ color: "#FFD98A", fontStyle: "italic" }}>Arunachala</Text>.
                      </Text>

                      {/* Stats row */}
                      <View style={cardStyles.statsRow}>
                        <View style={cardStyles.statBox}>
                          <View style={cardStyles.statHead}>
                            <Ionicons name="calendar-outline" size={11} color="#C47A1E" />
                            <Text style={cardStyles.statLabel}>DATE</Text>
                          </View>
                          <Text style={cardStyles.statValue}>{dateStr}</Text>
                        </View>
                        <View style={cardStyles.statDivider} />
                        <View style={cardStyles.statBox}>
                          <View style={cardStyles.statHead}>
                            <Ionicons name="time-outline" size={11} color="#C47A1E" />
                            <Text style={cardStyles.statLabel}>TIME</Text>
                          </View>
                          <Text style={cardStyles.statValue}>{timeStr}</Text>
                        </View>
                        <View style={cardStyles.statDivider} />
                        <View style={cardStyles.statBox}>
                          <View style={cardStyles.statHead}>
                            <MaterialCommunityIcons name="walk" size={11} color="#C47A1E" />
                            <Text style={cardStyles.statLabel}>DISTANCE</Text>
                          </View>
                          <Text style={cardStyles.statValue}>{distKm} km</Text>
                        </View>
                        <View style={cardStyles.statDivider} />
                        <View style={cardStyles.statBox}>
                          <View style={cardStyles.statHead}>
                            <Ionicons name="moon-outline" size={11} color="#C47A1E" />
                            <Text style={cardStyles.statLabel}>WALK NO.</Text>
                          </View>
                          <Text style={cardStyles.statValue}>{walkNumber ?? "—"}</Text>
                        </View>
                      </View>

                      {/* Polaroid filmstrip — user's walk photos */}
                      {walkPhotos.length > 0 ? (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={cardStyles.polaroidStripPad}
                          style={cardStyles.polaroidStrip}
                        >
                          {walkPhotos.map((p, i) => (
                            <View
                              key={`${p.uri}-${i}`}
                              style={[
                                cardStyles.polaroid,
                                { transform: [{ rotate: `${tilts[i % tilts.length]}deg` }] },
                              ]}
                            >
                              <Image source={{ uri: p.uri }} style={cardStyles.polaroidImage} resizeMode="cover" />
                              <Text style={cardStyles.polaroidCaption} numberOfLines={1}>
                                {p.lingamName}
                              </Text>
                            </View>
                          ))}
                        </ScrollView>
                      ) : (
                        <View style={cardStyles.noPhotosBox}>
                          <Ionicons name="camera-outline" size={18} color="rgba(255,234,179,0.5)" />
                          <Text style={cardStyles.noPhotosText}>
                            Capture photos at each lingam to weave them into your card.
                          </Text>
                        </View>
                      )}

                      {/* Sankalpa returned (if set) */}
                      {sk.length > 0 && (
                        <View style={cardStyles.sankalpaBox}>
                          <Text style={cardStyles.sankalpaLabel}>SANKALPA</Text>
                          <Text style={cardStyles.sankalpaText}>“{sk}”</Text>
                        </View>
                      )}

                      {/* Closing blessing */}
                      <Text style={cardStyles.closingQuote}>
                        May Arunachala&apos;s Grace{"\n"}stay with you always.
                      </Text>
                      <View style={cardStyles.diyaWrap}>
                        <MaterialCommunityIcons name="lamp" size={26} color="#FFB347" />
                      </View>

                      {/* Share row */}
                      <View style={cardStyles.shareDivider}>
                        <View style={cardStyles.thinLine} />
                        <Text style={cardStyles.shareLabel}>SHARE YOUR JOURNEY</Text>
                        <View style={cardStyles.thinLine} />
                      </View>
                      <View style={cardStyles.socialRow}>
                        <Pressable
                          onPress={() => openSocial("whatsapp")}
                          style={cardStyles.socialBtn}
                          accessibilityRole="button"
                          accessibilityLabel="Share on WhatsApp"
                        >
                          <Ionicons name="logo-whatsapp" size={20} color="#FFD98A" />
                        </Pressable>
                        <Pressable
                          onPress={() => openSocial("instagram")}
                          style={cardStyles.socialBtn}
                          accessibilityRole="button"
                          accessibilityLabel="Share on Instagram"
                        >
                          <Ionicons name="logo-instagram" size={20} color="#FFD98A" />
                        </Pressable>
                        <Pressable
                          onPress={() => openSocial("facebook")}
                          style={cardStyles.socialBtn}
                          accessibilityRole="button"
                          accessibilityLabel="Share on Facebook"
                        >
                          <Ionicons name="logo-facebook" size={20} color="#FFD98A" />
                        </Pressable>
                        <Pressable
                          onPress={() => openSocial("share")}
                          style={cardStyles.socialBtn}
                          accessibilityRole="button"
                          accessibilityLabel="More share options"
                        >
                          <Ionicons name="share-social-outline" size={20} color="#FFD98A" />
                        </Pressable>
                      </View>

                      {/* Hashtag footer */}
                      <View style={cardStyles.hashRow}>
                        <Text style={cardStyles.hashText}>#Girivalam</Text>
                        <Text style={cardStyles.hashText}>#Arunachala</Text>
                      </View>
                    </LinearGradient>
                  </View>

                  {/* Close button below the card */}
                  <Pressable
                    onPress={endWalk}
                    style={cardStyles.closeBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Close walk"
                  >
                    <Text style={cardStyles.closeBtnText}>Close</Text>
                  </Pressable>
                  <Text style={cardStyles.helperText}>
                    Take a screenshot of this card to share on WhatsApp Status or Instagram Story.
                  </Text>
                </ScrollView>
              </View>
            );
          })()}

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
                  {/* CINEMATIC-V1: glassmorphism wash behind the temple sheet */}
                  {CINEMATIC_V1 && (
                    <BlurView
                      intensity={40}
                      tint="dark"
                      style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" }]}
                      pointerEvents="none"
                    />
                  )}
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
    <ScreenBadge n={7} label="Girivalam (Route Map)" />
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
          {showFirstWalkPrep && (
            <View style={dStyles.prepWrap}>
              <Text style={dStyles.prepKicker}>BEFORE YOUR FIRST WALK</Text>
              <Text style={dStyles.prepIntro}>
                A few things to know — shown only this once.
              </Text>

              <View style={dStyles.prepCard}>
                <View style={dStyles.prepCardHead}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={GOLD} />
                  <Text style={dStyles.prepCardTitle}>What to carry</Text>
                </View>
                <Text style={dStyles.prepItem}>• Water bottle (0.5 L is enough — taps along the path)</Text>
                <Text style={dStyles.prepItem}>• Walk barefoot — most pilgrims do. Keep padded socks in a bag.</Text>
                <Text style={dStyles.prepItem}>• Light cotton clothes, a small towel</Text>
                <Text style={dStyles.prepItem}>• Pace: 14 km · 3.5 to 4.5 hours · walk slow, no rush</Text>
              </View>

              <View style={dStyles.prepCard}>
                <View style={dStyles.prepCardHead}>
                  <Ionicons name="time-outline" size={18} color={GOLD} />
                  <Text style={dStyles.prepCardTitle}>Best time to start</Text>
                </View>
                <Text style={dStyles.prepItem}>• Pre-dawn (4–5 AM): coolest, most silent — classic</Text>
                <Text style={dStyles.prepItem}>• Sunset (5–6 PM): beautiful light, busy on Pournami</Text>
                <Text style={dStyles.prepItem}>• Avoid midday (11 AM–3 PM): heat & hard tar road</Text>
                <Text style={dStyles.prepItem}>• Pournami nights: huge crowd — go early or wait a day</Text>
              </View>

              <View style={dStyles.prepCard}>
                <View style={dStyles.prepCardHead}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={GOLD} />
                  <Text style={dStyles.prepCardTitle}>Stay safe</Text>
                </View>
                <Text style={dStyles.prepItem}>• At night use a small torch</Text>
                <Text style={dStyles.prepItem}>• Don't feed or tease monkeys; hold bags close</Text>
                <Text style={dStyles.prepItem}>• Walk on the inside edge, away from traffic</Text>
                <Text style={dStyles.prepItem}>• Carry a phone with you for emergencies</Text>
              </View>

              <View style={dStyles.prepDivider} />
            </View>
          )}

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
      {/* Hill overview illustration — single-glance view of the path & 8 lingams */}
      <View style={styles.hillCard}>
        <Image
          source={require("../../assets/images/girivalam-hill-overview.png")}
          style={styles.hillImage}
          resizeMode="cover"
          accessibilityLabel="Illustration of Arunachala Hill with the 14 km Girivalam path and the 8 sacred lingam shrines around it"
        />
        <View style={styles.hillCaption}>
          <Text style={styles.hillCaptionTitle}>Arunachala — the Hill of Fire</Text>
          <Text style={styles.hillCaptionText}>
            Shiva is said to have appeared here as an endless column of light. The 14 km path circles the hill clockwise, passing through 8 directional shrines — one for each of the 8 cardinal directions.
          </Text>
        </View>
      </View>

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
                Tap to enter walk mode · map · emergency
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
        </LinearGradient>
      </Pressable>

      <Text style={styles.sectionTitle}>8 Sacred Lingams</Text>
      <Text style={styles.sectionDesc}>
        The Girivalam path passes through 8 directional shrines representing the 8 cardinal directions
      </Text>

      {LINGAMS.map((lingam) => {
        const isOpen = expandedLingams.has(lingam.number);
        return (
          <Pressable
            key={lingam.number}
            style={styles.lingamRow}
            onPress={() => toggleLingam(lingam.number)}
            accessibilityRole="button"
            accessibilityLabel={`${lingam.name}, ${isOpen ? "tap to collapse" : "tap to read more"}`}
          >
            <View style={styles.lingamNumber}>
              <Text style={styles.lingamNumberText}>{lingam.number}</Text>
            </View>
            <View style={styles.lingamContent}>
              <View style={styles.lingamHeader}>
                <Text style={styles.lingamName}>{lingam.name}</Text>
                <Text style={styles.lingamDistance}>{lingam.distance}</Text>
                <View style={styles.lingamChevron}>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={Colors.saffron}
                  />
                </View>
              </View>
              <Text style={styles.lingamDirection}>{lingam.direction} · {lingam.element}</Text>

              {isOpen && (
                <View style={styles.lingamExpanded}>
                  <Text style={styles.lingamDesc}>{lingam.description}</Text>

                  <View style={styles.lingamDetailGrid}>
                    <View style={styles.lingamDetailRow}>
                      <Text style={styles.lingamDetailLabel}>Deity</Text>
                      <Text style={styles.lingamDetailValue}>{lingam.deity}</Text>
                    </View>
                    <View style={styles.lingamDetailRow}>
                      <Text style={styles.lingamDetailLabel}>Planet</Text>
                      <Text style={styles.lingamDetailValue}>{lingam.planet}</Text>
                    </View>
                    <View style={styles.lingamDetailRow}>
                      <Text style={styles.lingamDetailLabel}>Mantra</Text>
                      <Text style={[styles.lingamDetailValue, styles.lingamMantraValue]}>{lingam.mantra}</Text>
                    </View>
                  </View>

                  <Text style={styles.lingamBlessingLabel}>Blessing</Text>
                  <Text style={styles.lingamBlessingText}>{lingam.benefit}</Text>

                  <Text style={styles.lingamBlessingLabel}>Specialty</Text>
                  <Text style={styles.lingamBlessingText}>{lingam.specialty}</Text>

                  <View style={styles.lingamMeaningStripe}>
                    <Text style={styles.lingamMeaningText}>“{lingam.meaning}”</Text>
                  </View>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}

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
  lingamDirection: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.textLight, marginTop: 2 },
  lingamChevron: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.overlayLight, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  lingamExpanded: { marginTop: 8 },
  lingamDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMid, lineHeight: 17 },
  hillCard: { backgroundColor: Colors.white, borderRadius: 16, overflow: "hidden", marginBottom: 14, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.9, shadowRadius: 8, elevation: 3 },
  hillImage: { width: "100%", height: 260, backgroundColor: Colors.overlayLight },
  hillCaption: { padding: 16 },
  hillCaptionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: Colors.brown, marginBottom: 6 },
  hillCaptionText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMid, lineHeight: 19 },
  lingamDetailGrid: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.overlayLight, gap: 6 },
  lingamDetailRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  lingamDetailLabel: { width: 58, fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.textLight, letterSpacing: 0.5, textTransform: "uppercase", paddingTop: 1 },
  lingamDetailValue: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 18 },
  lingamMantraValue: { fontFamily: "Inter_600SemiBold", color: Colors.primary, fontStyle: "italic" },
  lingamBlessingLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.textLight, letterSpacing: 0.8, textTransform: "uppercase", marginTop: 12, marginBottom: 4 },
  lingamBlessingText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 19 },
  lingamMeaningStripe: { marginTop: 14, padding: 12, borderRadius: 10, backgroundColor: Colors.overlayLight, borderLeftWidth: 3, borderLeftColor: Colors.saffron },
  lingamMeaningText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMid, lineHeight: 19, fontStyle: "italic" },

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
    // CINEMATIC-V1: serif display (glow removed per user request)
    fontFamily: CINEMATIC_V1 ? SERIF_DISPLAY : "Inter_700Bold",
    fontWeight: CINEMATIC_V1 ? ("700" as const) : ("400" as const),
    fontSize: CINEMATIC_V1 ? 38 : 32,
    color: CINEMATIC_V1 ? "#FFE7AE" : "white",
    letterSpacing: -0.5,
    lineHeight: CINEMATIC_V1 ? 44 : 36,
  },
  kmUnit: { fontFamily: "Inter_500Medium", fontSize: 14, color: TEXT_DIM, letterSpacing: 1 },
  kmLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: TEXT_DIM, letterSpacing: 1.5, marginTop: 2 },
  kmLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  walkNumPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: "rgba(255,217,138,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,217,138,0.4)",
  },
  walkNumPillText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10.5,
    color: "#FFD98A",
    letterSpacing: 0.3,
  },
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 4,
    paddingRight: 9,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "rgba(12,8,4,0.88)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  utilPinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  utilPinText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "rgba(255,255,255,0.92)",
    letterSpacing: 0.2,
  },
  utilColumn: {
    position: "absolute",
    left: 4,
    top: 12,
    gap: 6,
  },
  utilColumnBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(12,8,4,0.75)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
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
    // CINEMATIC-V1: serif + soft gold glow on completion number
    fontFamily: CINEMATIC_V1 ? SERIF_DISPLAY : "Inter_700Bold",
    fontWeight: CINEMATIC_V1 ? ("700" as const) : ("400" as const),
    fontSize: 60,
    color: CINEMATIC_V1 ? "#FFE7AE" : "white",
    marginTop: 6,
    letterSpacing: -1,
    textShadowColor: CINEMATIC_V1 ? "rgba(255,217,138,0.55)" : "transparent",
    textShadowRadius: CINEMATIC_V1 ? 18 : 0,
    textShadowOffset: { width: 0, height: 0 },
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
  ritualBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 32,
  },
  ritualBtn: {
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
  ritualShareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GOLD,
  },
  ritualShareBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: GOLD,
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

  // First-walk prep (shown only on first open) ────────────────────────────
  prepWrap: {
    marginBottom: 24,
  },
  prepKicker: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: GOLD,
    letterSpacing: 2.5,
    textAlign: "center",
  },
  prepIntro: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: TEXT_DIM,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
    fontStyle: "italic",
  },
  prepCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: HAIRLINE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  prepCardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  prepCardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: "white",
    letterSpacing: 0.3,
  },
  prepItem: {
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 19,
    marginTop: 3,
  },
  prepDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,217,138,0.25)",
    marginTop: 18,
    marginBottom: 6,
  },
});

// ── End-of-walk sacred completion card (matches reference design) ──────
const CARD_GOLD = "#C47A1E";
const CARD_GOLD_LIGHT = "#FFD98A";
const CARD_CREAM = "#F4E5C2";
const CARD_BG = "#0A0604";

const cardStyles = StyleSheet.create({
  scrollPad: {
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 56,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.55,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  cardBg: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
    alignItems: "center",
    position: "relative",
  },
  borderOuter: {
    position: "absolute",
    top: 8, left: 8, right: 8, bottom: 8,
    borderWidth: 1,
    borderColor: "rgba(196,122,30,0.7)",
    borderRadius: 8,
  },
  borderInner: {
    position: "absolute",
    top: 12, left: 12, right: 12, bottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(196,122,30,0.45)",
    borderRadius: 6,
  },
  corner: { position: "absolute", width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  cornerTL: { top: 4, left: 4 },
  cornerTR: { top: 4, right: 4 },
  cornerBL: { bottom: 4, left: 4 },
  cornerBR: { bottom: 4, right: 4 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontFamily: SERIF_DISPLAY,
    fontSize: 18,
    color: CARD_CREAM,
    letterSpacing: 4,
    fontWeight: "600",
  },
  headerSub: {
    fontSize: 8,
    color: CARD_GOLD_LIGHT,
    letterSpacing: 2.5,
    marginTop: 2,
  },

  hillWrap: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 4,
    position: "relative",
    backgroundColor: "#1A0A05",
  },
  hillImage: {
    width: "100%",
    height: "100%",
  },

  completedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: -38,
    paddingHorizontal: 20,
  },
  thinLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: CARD_GOLD,
    opacity: 0.7,
    maxWidth: 60,
  },
  completedText: {
    color: CARD_GOLD_LIGHT,
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: "600",
  },
  bigTitle: {
    fontFamily: SERIF_DISPLAY,
    fontSize: 40,
    color: CARD_GOLD_LIGHT,
    letterSpacing: 4,
    marginTop: 2,
    textAlign: "center",
    ...(Platform.OS === "web" ? ({ textShadow: "0 0 22px rgba(196,122,30,0.6)" } as any) : {}),
  },
  sharanamRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  sharanam: {
    color: CARD_CREAM,
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "500",
  },
  lingamIconWrap: {
    marginTop: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(196,122,30,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(196,122,30,0.5)",
  },

  openQuote: {
    fontFamily: SERIF_DISPLAY,
    fontSize: 32,
    color: CARD_GOLD,
    marginTop: 10,
    marginBottom: -10,
    lineHeight: 32,
  },
  quoteText: {
    fontFamily: SERIF_DISPLAY,
    fontSize: 15,
    color: CARD_CREAM,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
    marginTop: 4,
  },
  quoteAttribution: {
    fontSize: 11,
    color: "rgba(244,229,194,0.65)",
    marginTop: 6,
    letterSpacing: 0.5,
  },

  nameCursive: {
    fontFamily: SERIF_DISPLAY,
    fontSize: 32,
    color: CARD_CREAM,
    marginTop: 18,
    textAlign: "center",
    fontStyle: "italic",
    minWidth: 220,
    paddingVertical: 2,
    letterSpacing: 0.5,
  },
  embracedText: {
    fontSize: 12,
    color: "rgba(244,229,194,0.75)",
    textAlign: "center",
    lineHeight: 18,
    marginTop: 6,
    paddingHorizontal: 12,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(196,122,30,0.4)",
    width: "100%",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2,
  },
  statHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontFamily: SERIF_DISPLAY,
    fontSize: 13,
    color: CARD_CREAM,
    marginTop: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 8,
    color: CARD_GOLD,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(196,122,30,0.3)",
    marginVertical: 2,
  },

  polaroidStrip: {
    marginTop: 16,
    width: "100%",
  },
  polaroidStripPad: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    gap: 6,
  },
  polaroid: {
    width: 86,
    backgroundColor: "#F4E5C2",
    padding: 4,
    paddingBottom: 14,
    marginHorizontal: 2,
    borderRadius: 2,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  polaroidImage: {
    width: "100%",
    height: 86,
    borderRadius: 1,
    backgroundColor: "#1A0A05",
  },
  polaroidCaption: {
    fontSize: 7,
    color: "#5A2A00",
    textAlign: "center",
    marginTop: 3,
    letterSpacing: 0.3,
  },
  noPhotosBox: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(196,122,30,0.08)",
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(196,122,30,0.25)",
  },
  noPhotosText: {
    flex: 1,
    fontSize: 10,
    color: "rgba(244,229,194,0.6)",
    fontStyle: "italic",
  },

  sankalpaBox: {
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(196,122,30,0.08)",
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: CARD_GOLD,
    width: "100%",
  },
  sankalpaLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: CARD_GOLD,
    fontWeight: "700",
  },
  sankalpaText: {
    fontFamily: SERIF_DISPLAY,
    fontSize: 13,
    color: CARD_CREAM,
    marginTop: 4,
    lineHeight: 18,
    fontStyle: "italic",
  },

  closingQuote: {
    fontFamily: SERIF_DISPLAY,
    fontSize: 16,
    color: CARD_CREAM,
    marginTop: 18,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 22,
  },
  diyaWrap: {
    marginTop: 10,
    ...(Platform.OS === "web" ? ({ textShadow: "0 0 18px rgba(255,179,71,0.8)" } as any) : {}),
  },

  shareDivider: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    justifyContent: "center",
  },
  shareLabel: {
    color: "rgba(244,229,194,0.7)",
    fontSize: 9,
    letterSpacing: 3,
    fontWeight: "600",
  },
  socialRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 12,
  },
  socialBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(196,122,30,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,217,138,0.5)",
  },
  hashRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 14,
    paddingHorizontal: 4,
  },
  hashText: {
    fontSize: 9,
    color: "rgba(196,122,30,0.7)",
    letterSpacing: 0.5,
  },

  closeBtn: {
    marginTop: 18,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,217,138,0.4)",
  },
  closeBtnText: {
    color: "rgba(255,217,138,0.8)",
    fontSize: 13,
    letterSpacing: 1,
  },
  helperText: {
    fontSize: 11,
    color: "rgba(255,217,138,0.7)",
    textAlign: "center",
    marginTop: 14,
    paddingHorizontal: 24,
    lineHeight: 16,
  },
});
