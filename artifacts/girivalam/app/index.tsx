import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GOLD = "#C47A1E";
const GOLD_LIGHT = "#F4C26A";
const CREAM = "#F4E5C2";
const BG = "#0A0604";
const SURFACE = "#1A0F08";
const BORDER = "rgba(196,122,30,0.35)";

type Pillar = {
  key: string;
  title: string;
  subtitle: string;
  sanskrit: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  route: string;
};

const PILLARS: Pillar[] = [
  {
    key: "pradakshina",
    title: "Pradakshina",
    subtitle: "Begin the sacred 14km walk around Arunachala",
    sanskrit: "प्रदक्षिणा",
    icon: "walk",
    route: "/(tabs)/route-map",
  },
  {
    key: "temples",
    title: "Eight Lingams",
    subtitle: "Discover the temples that mark the path",
    sanskrit: "अष्ट लिङ्गम्",
    icon: "temple-hindu",
    route: "/(tabs)/route-map",
  },
  {
    key: "memories",
    title: "Sacred Memories",
    subtitle: "Your past walks, photos and reflections",
    sanskrit: "स्मृति",
    icon: "book-open-variant",
    route: "/(tabs)/history",
  },
  {
    key: "wisdom",
    title: "Wisdom & Mantras",
    subtitle: "Chants, translations and quiet teachings",
    sanskrit: "ज्ञानम्",
    icon: "om",
    route: "/(tabs)/translator",
  },
];

export default function MainScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BG, "#15090A", BG]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerWrap}>
          <View style={styles.omBadge}>
            <MaterialCommunityIcons name="om" size={28} color={GOLD_LIGHT} />
          </View>
          <Text style={styles.title}>Girivalam</Text>
          <Text style={styles.subtitle}>
            Pilgrim Guide · Tiruvannamalai
          </Text>
          <Text style={styles.chant}>ॐ अरुणाचलाय नमः</Text>
        </View>

        {/* Four Pillars */}
        <Text style={styles.sectionLabel}>THE FOUR PILLARS</Text>
        <View style={styles.pillarsGrid}>
          {PILLARS.map((p) => (
            <Pressable
              key={p.key}
              onPress={() => router.push(p.route as never)}
              style={({ pressed }) => [
                styles.pillarCard,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
              ]}
              accessibilityRole="button"
              accessibilityLabel={p.title}
            >
              <View style={styles.pillarIconWrap}>
                <MaterialCommunityIcons
                  name={p.icon}
                  size={28}
                  color={GOLD_LIGHT}
                />
              </View>
              <Text style={styles.pillarSanskrit}>{p.sanskrit}</Text>
              <Text style={styles.pillarTitle}>{p.title}</Text>
              <Text style={styles.pillarSub} numberOfLines={2}>
                {p.subtitle}
              </Text>
              <View style={styles.pillarArrow}>
                <Ionicons name="arrow-forward" size={14} color={GOLD} />
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.footer}>
          A companion for the eternal walk around the holy hill
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 20, gap: 12 },

  headerWrap: {
    alignItems: "center",
    gap: 8,
    marginBottom: 28,
  },
  omBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: SURFACE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 34,
    color: CREAM,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(244,229,194,0.65)",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 2,
  },
  chant: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: GOLD_LIGHT,
    marginTop: 10,
    letterSpacing: 0.4,
  },

  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    color: "rgba(244,229,194,0.5)",
    letterSpacing: 2.5,
    marginBottom: 12,
    marginLeft: 4,
  },

  pillarsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  pillarCard: {
    width: "48%",
    minHeight: 180,
    backgroundColor: SURFACE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  pillarIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(196,122,30,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  pillarSanskrit: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: GOLD,
    letterSpacing: 0.3,
  },
  pillarTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: CREAM,
  },
  pillarSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(244,229,194,0.6)",
    lineHeight: 16,
    marginTop: 2,
  },
  pillarArrow: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(196,122,30,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(244,229,194,0.4)",
    textAlign: "center",
    marginTop: 32,
    fontStyle: "italic",
    paddingHorizontal: 30,
    lineHeight: 18,
  },
});
