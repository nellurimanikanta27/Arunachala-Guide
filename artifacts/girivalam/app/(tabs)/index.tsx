import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

type FeatureRoute = "route-map" | "history" | "local-guide" | "ai-guide" | "translator";

interface Feature {
  id: FeatureRoute;
  title: string;
  subtitle: string;
  icon: string;
  iconFamily: "Ionicons" | "MaterialCommunityIcons";
  color: string;
  gradientStart: string;
  gradientEnd: string;
}

const FEATURES: Feature[] = [
  {
    id: "route-map",
    title: "Girivalam Route",
    subtitle: "14 km sacred path around Arunachala",
    icon: "map",
    iconFamily: "Ionicons",
    color: Colors.saffron,
    gradientStart: "#E8620A",
    gradientEnd: "#B84C06",
  },
  {
    id: "history",
    title: "History & Meditation",
    subtitle: "Spiritual significance & guided practice",
    icon: "om",
    iconFamily: "MaterialCommunityIcons",
    color: Colors.purple,
    gradientStart: "#7B4FA0",
    gradientEnd: "#4A2070",
  },
  {
    id: "local-guide",
    title: "Local Guide",
    subtitle: "Temples, restaurants & stay options",
    icon: "compass",
    iconFamily: "Ionicons",
    color: Colors.teal,
    gradientStart: "#1A8A78",
    gradientEnd: "#0E5A50",
  },
  {
    id: "ai-guide",
    title: "AI Guide",
    subtitle: "Ask questions about Girivalam & temples",
    icon: "chatbubble-ellipses",
    iconFamily: "Ionicons",
    color: Colors.blue,
    gradientStart: "#1A6FCC",
    gradientEnd: "#0E4A8A",
  },
  {
    id: "translator",
    title: "Translator",
    subtitle: "Translate across pilgrim languages",
    icon: "language",
    iconFamily: "Ionicons",
    color: Colors.green,
    gradientStart: "#1E8A4A",
    gradientEnd: "#0E5A30",
  },
];

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <Pressable
        onPress={() => router.push(`/(tabs)/${feature.id}` as any)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={feature.title}
      >
        <LinearGradient
          colors={[feature.gradientStart, feature.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardIconContainer}>
            {feature.iconFamily === "Ionicons" ? (
              <Ionicons
                name={feature.icon as any}
                size={36}
                color={Colors.white}
              />
            ) : (
              <MaterialCommunityIcons
                name={feature.icon as any}
                size={36}
                color={Colors.white}
              />
            )}
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="rgba(255,255,255,0.7)"
          />
        </LinearGradient>
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
        colors={[Colors.saffron, Colors.saffronDark, Colors.brown]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={[styles.header, { paddingTop: topInset + 20 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerBadge}>
            <MaterialCommunityIcons name="fire" size={16} color={Colors.amberLight} />
            <Text style={styles.headerBadgeText}>Pournami & Daily Girivalam</Text>
          </View>
          <Text style={styles.headerDesc}>
            An all-in-one companion providing navigation, local guidance, and support to make your spiritual journey simple, safe, and meaningful.
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>14 km</Text>
            <Text style={styles.statLabel}>Circumambulation</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Lingams</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>~4 hrs</Text>
            <Text style={styles.statLabel}>Walk Time</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomInset + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>FEATURES</Text>
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.id} feature={feature} index={index} />
        ))}

        <View style={styles.footer}>
          <MaterialCommunityIcons name="om" size={20} color={Colors.textFaint} />
          <Text style={styles.footerText}>
            Om Namah Shivaya  •  Arunachala Shiva
          </Text>
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
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  headerContent: {
    marginBottom: 20,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  headerBadgeText: {
    color: Colors.amberLight,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  headerTitle: {
    fontSize: 42,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    lineHeight: 46,
  },
  headerSubtitle: {
    fontSize: 20,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 10,
  },
  headerDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    lineHeight: 19,
    maxWidth: 280,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textFaint,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    gap: 14,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.78)",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textFaint,
    textAlign: "center",
  },
});
