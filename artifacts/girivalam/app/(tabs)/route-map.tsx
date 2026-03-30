import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

const GOOGLE_MAPS_GIRIVALAM =
  "https://www.google.com/maps/dir/Arunachaleswarar+Temple,+Tiruvannamalai/@12.2330,79.0674,14z";

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
        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map-marker-path" size={56} color={Colors.saffronLight} />
          <Text style={styles.mapTitle}>Girivalam Path</Text>
          <Text style={styles.mapSubtitle}>
            14 km sacred circumambulation around{"\n"}Arunachala Hill, Tiruvannamalai
          </Text>
        </View>

        <View style={styles.mapButtonRow}>
          <Pressable
            style={[styles.mapBtn, styles.mapBtnPrimary]}
            onPress={() => openMaps(GOOGLE_MAPS_GIRIVALAM)}
            accessibilityRole="button"
            accessibilityLabel="View Route on Google Maps"
          >
            <Ionicons name="map" size={20} color={Colors.white} />
            <Text style={styles.mapBtnText}>View Route</Text>
          </Pressable>
          <Pressable
            style={[styles.mapBtn, styles.mapBtnSecondary]}
            onPress={() => openMaps(GOOGLE_MAPS_NAVIGATION)}
            accessibilityRole="button"
            accessibilityLabel="Start Navigation"
          >
            <Ionicons name="navigate" size={20} color={Colors.saffron} />
            <Text style={[styles.mapBtnText, styles.mapBtnTextSecondary]}>Navigate</Text>
          </Pressable>
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
  mapPlaceholder: {
    backgroundColor: Colors.creamDark,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mapTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.saffronDark,
  },
  mapSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 19,
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
});
