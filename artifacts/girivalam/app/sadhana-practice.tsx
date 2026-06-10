import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DURATION_OPTIONS, PRACTICES, getPracticeById } from "@/lib/sadhana-practices";

const G = "#D46A1E";
const GF = "rgba(212,106,30,0.14)";

type Phase = "detail" | "timer";

// ── Breathing circle animation ─────────────────────────────────────────────
function BreathCircle({ practiceId }: { practiceId: string }) {
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  const isBreath = practiceId === "pranayama";
  const cycleDuration = isBreath ? 14000 : 12000;
  const expandDur = isBreath ? 4000 : 5000;
  const holdDur = isBreath ? 2000 : 1000;
  const contractDur = isBreath ? 6000 : 5000;
  const restDur = isBreath ? 2000 : 1000;

  useEffect(() => {
    let mounted = true;
    function cycle() {
      if (!mounted) return;
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 1, duration: expandDur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: expandDur, useNativeDriver: true }),
        ]),
        Animated.delay(holdDur),
        Animated.parallel([
          Animated.timing(scaleAnim, { toValue: 0.75, duration: contractDur, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.6, duration: contractDur, useNativeDriver: true }),
        ]),
        Animated.delay(restDur),
      ]).start(() => cycle());
    }
    cycle();
    return () => { mounted = false; };
  }, []);

  return (
    <Animated.View style={[styles.breathCircle, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.breathInner}>
        <Text style={styles.breathOm}>🕉</Text>
      </View>
    </Animated.View>
  );
}

// ── Timer screen (full-screen minimal) ────────────────────────────────────
function TimerScreen({
  practiceId,
  practiceName,
  practiceEmoji,
  durationMins,
  timerPrompts,
  onEnd,
}: {
  practiceId: string;
  practiceName: string;
  practiceEmoji: string;
  durationMins: number;
  timerPrompts: string[];
  onEnd: (completedMins: number) => void;
}) {
  const totalSecs = durationMins * 60;
  const [remaining, setRemaining] = useState(totalSecs);
  const [paused, setPaused] = useState(false);
  const [promptIdx, setPromptIdx] = useState(0);
  const pausedRef = useRef(false);
  const elapsedRef = useRef(0);
  const promptAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    interval = setInterval(() => {
      if (pausedRef.current) return;
      elapsedRef.current += 1;
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval);
          onEnd(durationMins);
          return 0;
        }
        return r - 1;
      });
      // Rotate prompts every 20 seconds
      if (elapsedRef.current % 20 === 0) {
        Animated.sequence([
          Animated.timing(promptAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(promptAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();
        setPromptIdx((i) => (i + 1) % timerPrompts.length);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function togglePause() {
    pausedRef.current = !pausedRef.current;
    setPaused((p) => !p);
  }

  function endEarly() {
    const completedMins = Math.max(1, Math.round(elapsedRef.current / 60));
    onEnd(completedMins);
  }

  const pct = (totalSecs - remaining) / totalSecs;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, "0")}`;

  return (
    <View style={styles.timerScreen}>
      <View style={styles.timerTop}>
        <Text style={styles.timerEmoji}>{practiceEmoji}</Text>
        <Text style={styles.timerPracticeName}>{practiceName}</Text>
      </View>

      <View style={styles.timerCenter}>
        <BreathCircle practiceId={practiceId} />

        <View style={styles.timerTimeWrap}>
          <Text style={styles.timerTime}>{timeStr}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct * 100}%` as any }]} />
          </View>
        </View>

        <Animated.Text style={[styles.timerPrompt, { opacity: promptAnim }]}>
          {timerPrompts[promptIdx]}
        </Animated.Text>
      </View>

      <View style={styles.timerActions}>
        <Pressable
          style={styles.timerPauseBtn}
          onPress={togglePause}
          accessibilityRole="button"
        >
          <Ionicons name={paused ? "play" : "pause"} size={20} color={G} />
          <Text style={styles.timerPauseBtnText}>{paused ? "Resume" : "Pause"}</Text>
        </Pressable>
        <Pressable
          style={styles.timerEndBtn}
          onPress={endEarly}
          accessibilityRole="button"
        >
          <Text style={styles.timerEndBtnText}>End Session</Text>
        </Pressable>
      </View>

      {paused && (
        <View style={styles.pausedOverlay}>
          <Text style={styles.pausedText}>Paused</Text>
          <Text style={styles.pausedHint}>Tap Resume when ready</Text>
        </View>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────
export default function SadhanaPracticeScreen() {
  const { practiceId } = useLocalSearchParams<{ practiceId: string }>();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const practice = getPracticeById(practiceId ?? "") ?? PRACTICES[0];
  const [selectedDuration, setSelectedDuration] = useState(practice.defaultDurationMins);
  const [phase, setPhase] = useState<Phase>("detail");

  function startTimer() {
    setPhase("timer");
  }

  function handleEnd(completedMins: number) {
    router.replace({
      pathname: "/sadhana-complete",
      params: {
        practiceId: practice.id,
        practiceName: practice.name,
        practiceEmoji: practice.emoji,
        durationMins: String(completedMins),
      },
    } as any);
  }

  if (phase === "timer") {
    return (
      <View style={{ flex: 1, backgroundColor: "#151515", paddingTop: topInset, paddingBottom: bottomInset }}>
        <TimerScreen
          practiceId={practice.id}
          practiceName={practice.name}
          practiceEmoji={practice.emoji}
          durationMins={selectedDuration}
          timerPrompts={practice.timerPrompts}
          onEnd={handleEnd}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#151515" }}>
      {/* Back button */}
      <View style={[styles.navBar, { paddingTop: topInset + 8 }]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={22} color="#F7F4ED" />
          <Text style={styles.backLabel}>Sadhana</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.detailContent, { paddingBottom: bottomInset + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{practice.emoji}</Text>
          <Text style={styles.heroName}>{practice.name}</Text>
          <Text style={styles.heroMeaning}>{practice.meaning}</Text>
        </View>

        {/* How to */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>How to practice</Text>
          {practice.steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Duration */}
        <View style={styles.durationCard}>
          <Text style={styles.durationTitle}>Choose duration</Text>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map((d) => (
              <Pressable
                key={d}
                style={[styles.durationChip, selectedDuration === d && styles.durationChipActive]}
                onPress={() => setSelectedDuration(d)}
                accessibilityRole="button"
              >
                <Text style={[styles.durationChipText, selectedDuration === d && styles.durationChipTextActive]}>
                  {d} min
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Begin */}
        <Pressable
          style={styles.beginBtn}
          onPress={startTimer}
          accessibilityRole="button"
        >
          <Ionicons name="play-circle" size={22} color="#FFFFFF" />
          <Text style={styles.beginBtnText}>Begin {practice.name}</Text>
        </Pressable>

        <Text style={styles.beginHint}>
          {selectedDuration} minutes · You can end early at any time
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(247,244,237,0.08)",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingVertical: 6,
  },
  backLabel: { fontSize: 15, fontFamily: "Inter_500Medium", color: "#F7F4ED" },

  detailContent: { padding: 16, gap: 16 },

  hero: { alignItems: "center", paddingVertical: 24, gap: 10 },
  heroEmoji: { fontSize: 56 },
  heroName: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#F7F4ED" },
  heroMeaning: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "#968D7E", textAlign: "center", lineHeight: 22,
    fontStyle: "italic", paddingHorizontal: 16,
  },

  stepsCard: {
    backgroundColor: "#1E1A15", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(247,244,237,0.10)",
    padding: 16, gap: 14,
  },
  stepsTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#F7F4ED", letterSpacing: 0.3 },
  stepRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: GF, borderWidth: 1, borderColor: "rgba(212,106,30,0.30)",
    alignItems: "center", justifyContent: "center", marginTop: 1,
  },
  stepNumText: { fontSize: 11, fontFamily: "Inter_700Bold", color: G },
  stepText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: "#C7BFAF", lineHeight: 21 },

  durationCard: {
    backgroundColor: "#1E1A15", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(247,244,237,0.10)",
    padding: 16, gap: 12,
  },
  durationTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#F7F4ED" },
  durationRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  durationChip: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(247,244,237,0.12)",
    backgroundColor: "#262019",
  },
  durationChipActive: { backgroundColor: GF, borderColor: G },
  durationChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#968D7E" },
  durationChipTextActive: { color: "#F7D98B", fontFamily: "Inter_700Bold" },

  beginBtn: {
    backgroundColor: G, borderRadius: 16,
    paddingVertical: 16, paddingHorizontal: 24,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  beginBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  beginHint: {
    fontSize: 11, fontFamily: "Inter_400Regular",
    color: "#6E665B", textAlign: "center", fontStyle: "italic",
  },

  // Timer screen
  timerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  timerTop: { alignItems: "center", gap: 6 },
  timerEmoji: { fontSize: 32 },
  timerPracticeName: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#F7F4ED" },

  timerCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: 32 },

  breathCircle: {
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: G,
    alignItems: "center", justifyContent: "center",
    shadowColor: G,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  breathInner: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  breathOm: { fontSize: 36 },

  timerTimeWrap: { alignItems: "center", gap: 10 },
  timerTime: {
    fontSize: 68, fontFamily: "Inter_700Bold",
    color: "#F7F4ED", letterSpacing: -3, lineHeight: 74,
  },
  progressBar: {
    width: 200, height: 3, backgroundColor: "rgba(247,244,237,0.12)",
    borderRadius: 2, overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: G, borderRadius: 2 },

  timerPrompt: {
    fontSize: 18, fontFamily: "Inter_400Regular",
    color: "#968D7E", textAlign: "center",
    lineHeight: 26, fontStyle: "italic",
    paddingHorizontal: 20,
  },

  timerActions: {
    width: "100%", gap: 10,
  },
  timerPauseBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: G, backgroundColor: GF,
  },
  timerPauseBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: G },
  timerEndBtn: {
    paddingVertical: 12, alignItems: "center",
  },
  timerEndBtnText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6E665B" },

  pausedOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(10,8,6,0.82)",
    alignItems: "center", justifyContent: "center",
    gap: 8,
  },
  pausedText: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#F7F4ED" },
  pausedHint: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#968D7E", fontStyle: "italic" },
});
