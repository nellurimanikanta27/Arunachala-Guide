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
import {
  getDailyQuote,
  getMoonPhase,
  getPournamiCountdown,
  getPournamiDate,
  getTithi,
} from "@/lib/sacred-time";

type FeatureRoute = "route-map" | "history" | "local-guide" | "ai-guide" | "translator";

interface Feature {
  id: FeatureRoute;
  title: string;
  subtitle: string;
  icon: string;
  iconFamily: "Ionicons" | "MaterialCommunityIcons";
}

const FEATURES: Feature[] = [
  { id: "route-map", title: "Girivalam Route", subtitle: "14 km path · live map · 8 lingams", icon: "map", iconFamily: "Ionicons" },
  { id: "history", title: "History & Meditation", subtitle: "Breathing guide · Ramana teachings", icon: "om", iconFamily: "MaterialCommunityIcons" },
  { id: "local-guide", title: "Local Guide", subtitle: "Temples, ashrams, food & stay", icon: "compass", iconFamily: "Ionicons" },
  { id: "ai-guide", title: "AI Guide", subtitle: "Ask anything about Girivalam", icon: "chatbubble-ellipses", iconFamily: "Ionicons" },
  { id: "translator", title: "Translator", subtitle: "Translate across pilgrim languages", icon: "language", iconFamily: "Ionicons" },
];

function SacredMomentCard() {
  const moon = getMoonPhase();
  const tithi = getTithi();
  const pournami = getPournamiCountdown();
  const quote = getDailyQuote();
  const pournamiDate = getPournamiDate();

  return (
    <View style={styles.sacredCard}>
      <View style={styles.sacredTop}>
        <View style={styles.moonBlock}>
          <Text style={styles.moonEmoji}>{moon.emoji}</Text>
          <View>
            <Text style={styles.moonName}>{moon.name}</Text>
            <Text style={styles.moonSub}>
              {tithi.paksha} {tithi.name}
            </Text>
          </View>
        </View>
        <View style={[styles.pournamiPill, pournami.isToday && styles.pournamiPillActive]}>
          <Text style={[styles.pournamiPillText, pournami.isToday && styles.pournamiPillTextActive]}>
            {pournami.isToday ? "🌕 Pournami Today!" : pournami.days <= 1 ? `🌔 ${pournami.label}` : `${pournami.label} · ${pournamiDate}`}
          </Text>
        </View>
      </View>
      <View style={styles.quoteDivider} />
      <Text style={styles.quoteText}>"{quote}"</Text>
      <Text style={styles.quoteAuthor}>— Sri Ramana Maharshi</Text>
    </View>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 20 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 20 }).start();
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
            <View style={styles.heroRow}>
              <View style={styles.heroIconWrap}>
                <Ionicons name="map" size={28} color={Colors.primary} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.heroTitle}>Girivalam Route</Text>
                <Text style={styles.heroSubtitle}>{feature.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
            </View>
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
                <Ionicons name={feature.icon as any} size={20} color={Colors.primary} />
              ) : (
                <MaterialCommunityIcons name={feature.icon as any} size={20} color={Colors.primary} />
              )}
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={15} color={Colors.textFaint} />
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
        colors={[Colors.primaryDark, Colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topInset + 14 }]}
      >
        <View style={styles.headerTop}>
          <MaterialCommunityIcons name="om" size={18} color="rgba(255,255,255,0.6)" />
          <Text style={styles.headerTag}>Arunachala Pilgrimage Guide</Text>
        </View>
        <Text style={styles.headerTitle}>Girivalam</Text>
        <Text style={styles.headerSub}>Tiruvannamalai, Tamil Nadu</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <SacredMomentCard />

        <Text style={styles.sectionLabel}>FEATURES</Text>
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.id} feature={feature} index={index} />
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>ॐ नमः शिवाय · Arunachala Shiva</Text>
          <Text style={styles.footerCredit}>by Manikanta Nelluri</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.warmWhite },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },
  headerTag: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingTop: 14, gap: 8 },

  sacredCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  sacredTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  moonBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  moonEmoji: { fontSize: 28 },
  moonName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  moonSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    marginTop: 1,
  },
  pournamiPill: {
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pournamiPillActive: {
    backgroundColor: Colors.amber,
    borderColor: Colors.amber,
  },
  pournamiPillText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  pournamiPillTextActive: { color: Colors.white },
  quoteDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMid,
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: 6,
  },
  quoteAuthor: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },

  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textFaint,
    letterSpacing: 1.5,
    marginLeft: 2,
    marginBottom: 2,
  },
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: Colors.primaryFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: { flex: 1 },
  heroTitle: {
    fontSize: 16,
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
    flexDirection: "row",
    backgroundColor: Colors.cream,
    borderRadius: 12,
    paddingVertical: 11,
  },
  heroStatItem: { flex: 1, alignItems: "center" },
  heroStatValue: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  heroStatLabel: {
    fontSize: 10,
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
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: Colors.primaryFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textFaint,
    letterSpacing: 0.4,
  },
  footerCredit: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textFaint,
    letterSpacing: 0.3,
    marginTop: 6,
    opacity: 0.7,
  },
});
