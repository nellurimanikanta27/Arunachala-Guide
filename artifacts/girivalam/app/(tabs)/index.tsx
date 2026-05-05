import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

type FeatureRoute = "route-map" | "history" | "local-guide" | "ai-guide" | "translator";

interface Feature {
  id: FeatureRoute;
  title: string;
  subtitle: string;
  icon: string;
  iconFamily: "Ionicons" | "MaterialCommunityIcons";
}

const FEATURES: Feature[] = [
  {
    id: "route-map",
    title: "Girivalam Route",
    subtitle: "14 km sacred path · live map · 8 lingams",
    icon: "map",
    iconFamily: "Ionicons",
  },
  {
    id: "history",
    title: "History & Meditation",
    subtitle: "Spiritual significance & guided practice",
    icon: "om",
    iconFamily: "MaterialCommunityIcons",
  },
  {
    id: "local-guide",
    title: "Local Guide",
    subtitle: "Temples, ashrams, food & stay",
    icon: "compass",
    iconFamily: "Ionicons",
  },
  {
    id: "ai-guide",
    title: "AI Guide",
    subtitle: "Ask anything about Girivalam",
    icon: "chatbubble-ellipses",
    iconFamily: "Ionicons",
  },
  {
    id: "translator",
    title: "Translator",
    subtitle: "Translate across pilgrim languages",
    icon: "language",
    iconFamily: "Ionicons",
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 20 }).start();

  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 20 }).start();

  const isFirst = index === 0;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={() => router.push(`/(tabs)/${feature.id}` as any)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={feature.title}
      >
        {isFirst ? (
          <View style={styles.heroCard}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="map" size={30} color={Colors.primary} />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Girivalam Route</Text>
              <Text style={styles.heroSubtitle}>14 km sacred path · live map · 8 lingams</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textFaint} />

            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>14 km</Text>
                <Text style={styles.heroStatLabel}>Distance</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>8</Text>
                <Text style={styles.heroStatLabel}>Lingams</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatValue}>~4 hrs</Text>
                <Text style={styles.heroStatLabel}>Walk Time</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.cardIconWrap}>
              {feature.iconFamily === "Ionicons" ? (
                <Ionicons name={feature.icon as any} size={22} color={Colors.primary} />
              ) : (
                <MaterialCommunityIcons name={feature.icon as any} size={22} color={Colors.primary} />
              )}
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topInset + 16 }]}
      >
        <View style={styles.headerTop}>
          <MaterialCommunityIcons name="om" size={22} color="rgba(255,255,255,0.7)" />
          <Text style={styles.headerTag}>Pournami & Daily Girivalam</Text>
        </View>
        <Text style={styles.headerTitle}>Girivalam</Text>
        <Text style={styles.headerSub}>Arunachala Pilgrimage Guide</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>FEATURES</Text>
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.id} feature={feature} index={index} />
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>ॐ नमः शिवाय · Om Namah Shivaya</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  headerTag: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.72)",
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textFaint,
    letterSpacing: 1.5,
    marginBottom: 4,
    marginLeft: 2,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
  },
  heroStats: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: Colors.cream,
    borderRadius: 12,
    paddingVertical: 12,
  },
  heroStatItem: {
    flex: 1,
    alignItems: "center",
  },
  heroStatValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  heroStatLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primaryFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    lineHeight: 17,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 4,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textFaint,
    letterSpacing: 0.3,
  },
});
