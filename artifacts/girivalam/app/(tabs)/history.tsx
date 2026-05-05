import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { getDailyQuote } from "@/lib/sacred-time";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BREATH_PHASES = [
  { label: "Breathe In", duration: 4000, instruction: "Slowly inhale through your nose" },
  { label: "Hold", duration: 2000, instruction: "Gently hold your breath" },
  { label: "Breathe Out", duration: 6000, instruction: "Slowly exhale through your mouth" },
  { label: "Rest", duration: 2000, instruction: "Pause in stillness" },
];

const HISTORY_SECTIONS = [
  {
    id: "arunachala",
    title: "Arunachala — The Sacred Hill",
    icon: "flame" as const,
    content:
      'Arunachala, also known as Annamalai, is considered the embodiment of Lord Shiva himself — a column of fire (Jyotirlinga) that took form as a hill. The name means "the Hill of Light" or "Red Mountain."\n\nWhen Brahma and Vishnu quarreled over supremacy, Shiva appeared as an infinite pillar of fire. Unable to find its top or bottom, they surrendered. Shiva then manifested as Arunachala — a lasting symbol of divine light. Even gazing at the hill is said to grant liberation.',
  },
  {
    id: "girivalam",
    title: "The Sacred Practice of Girivalam",
    icon: "walk" as const,
    content:
      "Girivalam (Pradakshina) is the act of walking clockwise around Arunachala Hill — approximately 14 km. The path passes through the 8 Shivalingams, sacred temples, water tanks, and ashrams.\n\nThe practice is mentioned in ancient Tamil texts like Tevaram and Thiruvachagam. Saints including Ramana Maharshi, Seshadri Swamigal, and thousands of sages walked this path. Each step taken in surrender is considered a prayer.",
  },
  {
    id: "pournami",
    title: "Pournami — The Full Moon Night",
    icon: "moon" as const,
    content:
      "On Pournami (full moon), hundreds of thousands of pilgrims walk together from dusk to dawn. The atmosphere is extraordinary — oil lamps, incense, chanting, and a river of devotees moving as one.\n\nKarthigai Deepam draws millions when a massive fire beacon is lit atop Arunachala, visible from miles away, symbolizing Shiva as the original column of light.",
  },
  {
    id: "ramana",
    title: "Ramana Maharshi & Arunachala",
    icon: "person" as const,
    content:
      "Sri Ramana Maharshi (1879–1950) arrived at age 16 following a spontaneous spiritual awakening. He spent 54 years at Arunachala, teaching the path of Self-inquiry: 'Who am I?'\n\nRamana described Arunachala as the spiritual heart of the world and walked the Girivalam regularly. His ashram at the foot of the hill welcomes all visitors. He taught that simply being near Arunachala destroys the ego.",
  },
  {
    id: "temple",
    title: "Arunachaleswarar Temple",
    icon: "business" as const,
    content:
      "One of the largest Hindu temples in the world, covering 10 hectares with 4 majestic gopurams. The tallest eastern tower stands at 66 meters. The main deity is Lord Shiva as Annamalaiyar and Goddess Parvati as Unnamalai Amman.\n\nBuilt over centuries by Chola and Vijayanagara kings. Open to all, with pujas held 6 times daily. Entry is free.",
  },
];

function BreathingGuide() {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const circleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);
  const phaseRef = useRef(0);

  function runPhase(index: number) {
    if (!runningRef.current) return;
    const phase = BREATH_PHASES[index % BREATH_PHASES.length];
    phaseRef.current = index % BREATH_PHASES.length;
    setPhaseIndex(index % BREATH_PHASES.length);

    const toValue = index % 4 === 0 ? 1 : index % 4 === 2 ? 0 : circleAnim._value as number;

    if (index % 4 === 0) {
      Animated.parallel([
        Animated.timing(circleAnim, { toValue: 1, duration: phase.duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: phase.duration, useNativeDriver: true }),
      ]).start();
    } else if (index % 4 === 2) {
      Animated.parallel([
        Animated.timing(circleAnim, { toValue: 0, duration: phase.duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0.5, duration: phase.duration, useNativeDriver: true }),
      ]).start();
    }

    timerRef.current = setTimeout(() => {
      const next = index + 1;
      if (next % BREATH_PHASES.length === 0) {
        setCycleCount((c) => c + 1);
      }
      runPhase(next);
    }, phase.duration);
  }

  function start() {
    setIsRunning(true);
    runningRef.current = true;
    setCycleCount(0);
    runPhase(0);
  }

  function stop() {
    runningRef.current = false;
    setIsRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(circleAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0.6, duration: 600, useNativeDriver: true }),
    ]).start();
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const scale = circleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] });
  const phase = BREATH_PHASES[phaseIndex];

  return (
    <View style={styles.breathCard}>
      <View style={styles.breathHeader}>
        <MaterialCommunityIcons name="meditation" size={18} color={Colors.primary} />
        <Text style={styles.breathTitle}>Breathing Meditation</Text>
        {cycleCount > 0 && (
          <View style={styles.cycleBadge}>
            <Text style={styles.cycleBadgeText}>{cycleCount} cycles</Text>
          </View>
        )}
      </View>

      <View style={styles.breathCircleWrap}>
        <Animated.View style={[styles.breathOuter, { opacity: opacityAnim, transform: [{ scale }] }]}>
          <View style={styles.breathInner}>
            <MaterialCommunityIcons name="om" size={28} color={Colors.white} />
          </View>
        </Animated.View>
        {isRunning && (
          <View style={styles.breathLabelWrap}>
            <Text style={styles.breathPhaseLabel}>{phase.label}</Text>
            <Text style={styles.breathInstruction}>{phase.instruction}</Text>
          </View>
        )}
        {!isRunning && (
          <View style={styles.breathLabelWrap}>
            <Text style={styles.breathInstruction}>
              4 sec inhale · 2 sec hold{"\n"}6 sec exhale · 2 sec rest
            </Text>
          </View>
        )}
      </View>

      <Pressable
        style={[styles.breathBtn, isRunning && styles.breathBtnStop]}
        onPress={isRunning ? stop : start}
        accessibilityRole="button"
      >
        <Ionicons
          name={isRunning ? "stop-circle" : "play-circle"}
          size={20}
          color={Colors.white}
        />
        <Text style={styles.breathBtnText}>
          {isRunning ? "Stop Meditation" : "Begin Breathing Guide"}
        </Text>
      </Pressable>
    </View>
  );
}

function ExpandableSection({ section }: { section: typeof HISTORY_SECTIONS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };
  return (
    <Pressable style={styles.historyCard} onPress={toggle} accessibilityRole="button">
      <View style={styles.historyCardHeader}>
        <View style={styles.historyIconWrap}>
          <Ionicons name={section.icon as any} size={18} color={Colors.primary} />
        </View>
        <Text style={styles.historyCardTitle}>{section.title}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.textLight} />
      </View>
      {expanded && <Text style={styles.historyCardContent}>{section.content}</Text>}
    </Pressable>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;
  const quote = getDailyQuote();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.quoteCard}>
        <Text style={styles.quoteEmoji}>🕯️</Text>
        <Text style={styles.quoteText}>"{quote}"</Text>
        <Text style={styles.quoteAuthor}>— Sri Ramana Maharshi</Text>
      </View>

      <BreathingGuide />

      <Text style={styles.sectionTitle}>Self-Inquiry Practice</Text>
      <View style={styles.inquiryCard}>
        <Text style={styles.inquiryQuestion}>Who am I?</Text>
        <Text style={styles.inquiryText}>
          Sit quietly. Ask yourself this question — not to find a word-answer, but to turn attention inward toward the source of the question itself.{"\n\n"}Notice what remains when thought becomes still. That silent, aware presence is your true nature.{"\n\n"}Return to this question whenever the mind wanders. This is the direct path taught by Ramana at Arunachala.
        </Text>
        <View style={styles.inquiryMantras}>
          <Text style={styles.inquiryMantraTitle}>Walking Mantras</Text>
          <Text style={styles.inquiryMantra}>🔸 Om Namah Shivaya</Text>
          <Text style={styles.inquiryMantra}>🔸 Arunachala Shiva, Arunachala Shiva</Text>
          <Text style={styles.inquiryMantra}>🔸 Shiva, Shiva (one chant per step)</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 8 }]}>History & Significance</Text>
      <Text style={styles.sectionDesc}>Tap any section to expand</Text>
      {HISTORY_SECTIONS.map((section) => (
        <ExpandableSection key={section.id} section={section} />
      ))}

      <Pressable
        style={styles.videoBtn}
        onPress={() =>
          Linking.openURL("https://www.youtube.com/results?search_query=Arunachala+Girivalam+meditation").catch(() =>
            Alert.alert("Cannot open link", "Please check your internet connection.")
          )
        }
        accessibilityRole="button"
      >
        <Ionicons name="play-circle" size={22} color={Colors.white} />
        <View style={{ flex: 1 }}>
          <Text style={styles.videoBtnTitle}>Watch & Listen</Text>
          <Text style={styles.videoBtnSub}>Girivalam videos & meditation audio on YouTube</Text>
        </View>
        <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.65)" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.warmWhite },
  content: { padding: 14, gap: 10 },

  quoteCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  quoteEmoji: { fontSize: 28 },
  quoteText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.88)",
    lineHeight: 22,
    fontStyle: "italic",
    textAlign: "center",
  },
  quoteAuthor: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.amberLight,
  },

  breathCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    gap: 16,
  },
  breathHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  breathTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  cycleBadge: {
    backgroundColor: Colors.primaryFaint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cycleBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  breathCircleWrap: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
  },
  breathOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  breathInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  breathLabelWrap: { alignItems: "center", gap: 4 },
  breathPhaseLabel: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },
  breathInstruction: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 18,
  },
  breathBtn: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  breathBtnStop: { backgroundColor: Colors.textMid },
  breathBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },

  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 2,
  },
  sectionDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    marginBottom: 6,
  },

  inquiryCard: {
    backgroundColor: Colors.cream,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    gap: 10,
  },
  inquiryQuestion: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    textAlign: "center",
    paddingVertical: 6,
  },
  inquiryText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMid,
    lineHeight: 21,
  },
  inquiryMantras: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  inquiryMantraTitle: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inquiryMantra: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },

  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  historyCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  historyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: Colors.primaryFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  historyCardTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  historyCardContent: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMid,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },

  videoBtn: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  videoBtnTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  videoBtnSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
  },
});
