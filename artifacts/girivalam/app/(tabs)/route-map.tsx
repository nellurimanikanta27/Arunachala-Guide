import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

interface Lingam {
  number: number;
  name: string;
  direction: string;
  description: string;
  distance: string;
}

const LINGAMS: Lingam[] = [
  { number: 1, name: "Indra Lingam", direction: "East", description: "Near the main Arunachaleswarar Temple entrance", distance: "0 km" },
  { number: 2, name: "Agni Lingam", direction: "South-East", description: "Associated with fire element, near Kottai area", distance: "2 km" },
  { number: 3, name: "Yama Lingam", direction: "South", description: "South direction shrine", distance: "3.5 km" },
  { number: 4, name: "Niruthi Lingam", direction: "South-West", description: "Marking the south-west quarter of the hill", distance: "5 km" },
  { number: 5, name: "Varuna Lingam", direction: "West", description: "Water element shrine on western path", distance: "7 km" },
  { number: 6, name: "Vayu Lingam", direction: "North-West", description: "Wind element, scenic forest section", distance: "9 km" },
  { number: 7, name: "Kubera Lingam", direction: "North", description: "Prosperity shrine near northern path", distance: "11 km" },
  { number: 8, name: "Isanya Lingam", direction: "North-East", description: "Last major shrine before completing the circle", distance: "13 km" },
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

export default function RouteMapScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;
  const [userLocation, setUserLocation] = useState<UserLoc | null>(null);
  const [tracking, setTracking] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [showStops, setShowStops] = useState(true);
  const watchSubRef = useRef<Location.LocationSubscription | null>(null);
  const webWatchIdRef = useRef<number | null>(null);
  const [japaCount, setJapaCount] = useState(0);
  const [japaTarget, setJapaTarget] = useState(108);

  useEffect(() => {
    return () => {
      watchSubRef.current?.remove();
      watchSubRef.current = null;
      if (
        Platform.OS === "web" &&
        webWatchIdRef.current !== null &&
        typeof navigator !== "undefined" &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(webWatchIdRef.current);
        webWatchIdRef.current = null;
      }
    };
  }, []);

  async function startTracking() {
    if (tracking) {
      stopTracking();
      return;
    }
    setRequesting(true);
    try {
      if (Platform.OS === "web") {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          Alert.alert("Not Supported", "Your browser does not support location tracking.");
          return;
        }
        webWatchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              recenter: !tracking,
            });
            setTracking(true);
          },
          (err) => {
            Alert.alert(
              "Location Unavailable",
              err.message || "Please allow location access in your browser."
            );
            setTracking(false);
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        );
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Needed",
            "Allow location access so we can show your position on the Girivalam path."
          );
          return;
        }
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setUserLocation({
          lat: initial.coords.latitude,
          lng: initial.coords.longitude,
          recenter: true,
        });
        setTracking(true);
        watchSubRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 4000,
            distanceInterval: 5,
          },
          (loc) => {
            setUserLocation({
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              recenter: false,
            });
          }
        );
      }
    } catch (e) {
      Alert.alert("Error", "Could not start location tracking.");
    } finally {
      setRequesting(false);
    }
  }

  function stopTracking() {
    watchSubRef.current?.remove();
    watchSubRef.current = null;
    if (
      Platform.OS === "web" &&
      webWatchIdRef.current !== null &&
      typeof navigator !== "undefined" &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(webWatchIdRef.current);
      webWatchIdRef.current = null;
    }
    setTracking(false);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: bottomInset + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
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
            <Ionicons
              name={showStops ? "eye" : "eye-off"}
              size={14}
              color={showStops ? Colors.white : Colors.saffron}
            />
            <Text
              style={[
                styles.stopsChipText,
                showStops && styles.stopsChipTextActive,
              ]}
            >
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
            style={[
              styles.mapBtn,
              tracking ? styles.mapBtnTracking : styles.mapBtnPrimary,
            ]}
            onPress={startTracking}
            disabled={requesting}
            accessibilityRole="button"
            accessibilityLabel={tracking ? "Stop Live Tracking" : "Start Live Tracking"}
          >
            {requesting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Ionicons
                name={tracking ? "radio-button-on" : "locate"}
                size={20}
                color={Colors.white}
              />
            )}
            <Text style={styles.mapBtnText}>
              {tracking ? "Stop Tracking" : "Track My Location"}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.mapBtn, styles.mapBtnSecondary]}
            onPress={() => openMaps(GOOGLE_MAPS_NAVIGATION)}
            accessibilityRole="button"
            accessibilityLabel="Open Walking Navigation"
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
      <Text style={styles.sectionDesc}>
        Additional sacred Lingams on the Girivalam path
      </Text>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  content: {
    padding: 16,
  },
  mapCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
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
  mapHeaderText: {
    flex: 1,
  },
  mapTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.saffronDark,
  },
  mapSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    marginTop: 2,
  },
  mapLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendDash: {
    width: 14,
    height: 3,
    backgroundColor: Colors.saffron,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.textLight,
  },
  stopsToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  stopsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.saffron,
    backgroundColor: Colors.white,
  },
  stopsChipActive: {
    backgroundColor: Colors.saffron,
  },
  stopsChipText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.saffron,
  },
  stopsChipTextActive: {
    color: Colors.white,
  },
  stopsHint: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
  },
  iconGuide: {
    backgroundColor: Colors.cream,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
  },
  iconGuideTitle: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.saffronDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  iconGuideRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    rowGap: 6,
  },
  iconGuideItem: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
  mapButtonRow: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  mapBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  mapBtnPrimary: {
    backgroundColor: Colors.saffron,
  },
  mapBtnTracking: {
    backgroundColor: "#1E88E5",
  },
  trackingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#1E88E5",
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1E88E5",
  },
  trackingText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#0D47A1",
  },
  mapBtnSecondary: {
    backgroundColor: Colors.cream,
    borderWidth: 1.5,
    borderColor: Colors.saffron,
  },
  mapBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  mapBtnTextSecondary: {
    color: Colors.saffron,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.brown,
    marginBottom: 6,
    marginTop: 8,
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    lineHeight: 19,
    marginBottom: 16,
  },
  lingamRow: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 2,
  },
  lingamNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  lingamNumberText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  lingamContent: {
    flex: 1,
  },
  lingamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  lingamName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.brown,
    flex: 1,
  },
  lingamDistance: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.saffron,
    backgroundColor: Colors.overlayLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lingamDirection: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.textLight,
    marginTop: 2,
    marginBottom: 4,
  },
  lingamDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMid,
    lineHeight: 17,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.overlayLight,
    alignItems: "center",
    justifyContent: "center",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    lineHeight: 20,
    paddingTop: 7,
  },
  specialLingamRow: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 2,
  },
  specialLingamEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.overlayLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  specialLingamEmojiText: {
    fontSize: 20,
  },

  japaCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  japaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  japaHeaderIcon: { fontSize: 18 },
  japaHeaderTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  japaReset: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.primaryFaint,
    borderRadius: 8,
  },
  japaResetText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  japaTapBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 22,
    alignItems: "center",
    gap: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  japaCount: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    lineHeight: 60,
  },
  japaTapLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.5,
  },
  japaComplete: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.amberLight,
    marginTop: 4,
  },
  japaPresets: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  japaPresetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.cream,
  },
  japaPresetActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaint,
  },
  japaPresetText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textLight,
  },
  japaPresetTextActive: { color: Colors.primary },
  japaProgress: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  japaProgressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  japaProgressLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textLight,
    minWidth: 42,
    textAlign: "right",
  },
});
