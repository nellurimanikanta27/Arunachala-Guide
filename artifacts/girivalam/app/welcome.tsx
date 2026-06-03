import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getSettings, markOnboarded, updateSettings } from "@/lib/pilgrimage-store";

const { width: SCREEN_W } = Dimensions.get("window");

const BG = "#0A0604";
const CREAM = "#F4E5C2";
const GOLD = "#C47A1E";
const GOLD_LIGHT = "#FFD98A";
const MUTED = "rgba(244,229,194,0.7)";
const FAINT = "rgba(244,229,194,0.45)";

type Slide = {
  kicker: string;
  title: string;
  body: string;
  icon: React.ReactNode;
};

const SLIDES: Slide[] = [
  {
    kicker: "ARRIVAL",
    title: "Welcome, pilgrim",
    body:
      "Arunachala has called you here. This guide walks beside you — quietly, without hurry. Before features, before maps, take one slow breath.",
    icon: <MaterialCommunityIcons name="meditation" size={56} color={GOLD_LIGHT} />,
  },
  {
    kicker: "THE PATH",
    title: "Girivalam, Sadhana, Wisdom & support",
    body:
      "Four pillars hold this app. The sacred walk around the hill. Daily practice. The wisdom of Bhagavan. And quiet, practical help when you need it.",
    icon: <Ionicons name="footsteps-outline" size={56} color={GOLD_LIGHT} />,
  },
  {
    kicker: "THE RETURN",
    title: "Arunachala stays with you",
    body:
      "Every walk, every reflection, every quiet moment is kept on your own device. This is not an app to consume. It is a thread back to the hill.",
    icon: <Ionicons name="flame-outline" size={56} color={GOLD_LIGHT} />,
  },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");

  React.useEffect(() => {
    getSettings().then((s) => {
      if (s.pilgrimName) setName(s.pilgrimName);
    }).catch(() => {});
  }, []);

  const TOTAL_PAGES = SLIDES.length + 1; // + name slide

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (next !== page) setPage(next);
  };

  const next = async () => {
    if (page < TOTAL_PAGES - 1) {
      scrollRef.current?.scrollTo({ x: (page + 1) * SCREEN_W, animated: true });
    } else {
      const trimmed = name.trim();
      if (trimmed.length > 0) {
        try { await updateSettings({ pilgrimName: trimmed }); } catch {}
      }
      await markOnboarded();
      router.replace("/(tabs)" as any);
    }
  };

  const skip = async () => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      try { await updateSettings({ pilgrimName: trimmed }); } catch {}
    }
    await markOnboarded();
    router.replace("/(tabs)" as any);
  };

  const isLast = page === TOTAL_PAGES - 1;
  const isNameSlide = page === TOTAL_PAGES - 1;
  const canContinue = !isNameSlide || name.trim().length > 0;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0A0604", "#1A0A05", "#2A1208"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle glow halo */}
      <View pointerEvents="none" style={styles.glow} />

      {/* Skip — top right */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={skip} hitSlop={10} accessibilityRole="button">
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {SLIDES.map((s, i) => (
            <SlideView key={i} slide={s} />
          ))}
          <NameSlide name={name} onChangeName={setName} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Pagination + Continue */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dots}>
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>

        <Pressable
          onPress={next}
          style={[styles.btn, !canContinue && styles.btnDisabled]}
          accessibilityRole="button"
          disabled={!canContinue}
        >
          <Text style={styles.btnText}>{isLast ? "Enter the path" : "Continue"}</Text>
          <Ionicons name="arrow-forward" size={16} color={BG} />
        </Pressable>
      </View>
    </View>
  );
}

function NameSlide({ name, onChangeName }: { name: string; onChangeName: (s: string) => void }) {
  return (
    <View style={[styles.slide, { width: SCREEN_W }]}>
      <View style={styles.iconHalo}>
        <View style={styles.iconHaloRing} />
        <MaterialCommunityIcons name="hand-heart-outline" size={56} color={GOLD_LIGHT} />
      </View>
      <Text style={styles.kicker}>YOUR NAME</Text>
      <Text style={styles.title}>How shall Arunachala know you?</Text>
      <Text style={styles.body}>
        This name will appear on your Girivalam completion card, the one you share with loved ones. You can change it anytime.
      </Text>
      <TextInput
        value={name}
        onChangeText={onChangeName}
        placeholder="Your name"
        placeholderTextColor={FAINT}
        style={styles.nameInput}
        maxLength={40}
        autoCapitalize="words"
        accessibilityLabel="Your pilgrim name"
        returnKeyType="done"
      />
    </View>
  );
}

function SlideView({ slide }: { slide: Slide }) {
  return (
    <View style={[styles.slide, { width: SCREEN_W }]}>
      <View style={styles.iconHalo}>
        <View style={styles.iconHaloRing} />
        {slide.icon}
      </View>
      <Text style={styles.kicker}>{slide.kicker}</Text>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.body}>{slide.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  glow: {
    position: "absolute",
    top: -180,
    alignSelf: "center",
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: GOLD,
    opacity: 0.08,
  },
  topBar: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    zIndex: 2,
  },
  skip: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: MUTED,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  slide: {
    flex: 1,
    paddingHorizontal: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  iconHalo: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  iconHaloRing: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: "rgba(196,122,30,0.35)",
    backgroundColor: "rgba(196,122,30,0.08)",
  },
  kicker: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: GOLD_LIGHT,
    letterSpacing: 3,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: CREAM,
    textAlign: "center",
    lineHeight: 36,
    letterSpacing: 0.5,
    ...(Platform.OS === "web"
      ? ({ textShadow: `0 0 18px rgba(196,122,30,0.35)` } as any)
      : {}),
  },
  body: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 6,
    maxWidth: 320,
  },

  footer: {
    paddingHorizontal: 28,
    paddingTop: 12,
    alignItems: "center",
    gap: 22,
  },
  dots: { flexDirection: "row", gap: 8 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: FAINT,
  },
  dotActive: { backgroundColor: GOLD_LIGHT, width: 22 },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 100,
    backgroundColor: GOLD_LIGHT,
    minWidth: 220,
    justifyContent: "center",
  },
  btnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: BG,
    letterSpacing: 0.5,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  nameInput: {
    marginTop: 18,
    minWidth: 260,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(244,229,194,0.08)",
    borderWidth: 1,
    borderColor: "rgba(196,122,30,0.45)",
    color: CREAM,
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
