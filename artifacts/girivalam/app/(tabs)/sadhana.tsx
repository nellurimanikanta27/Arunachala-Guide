import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
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

import Colors from "@/constants/colors";
import {
  addJapaMala,
  getSadhanaData,
  getSadhanaStreak,
  markSadhanaPracticed,
  type SadhanaData,
} from "@/lib/pilgrimage-store";
import { getDailyQuote } from "@/lib/sacred-time";

// ── Palette (white + gold, no dark fills) ─────────────────────────────────
const P = {
  bg: "#FFFFFF",
  card: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
  gold: "#C2A24E",
  goldDark: "#8B6914",
  goldFaint: "rgba(194,162,78,0.10)",
  goldMid: "rgba(194,162,78,0.22)",
  text: "#1A1A1A",
  textMid: "#4A4A4A",
  textLight: "#888888",
};

// ── Practice Plans ────────────────────────────────────────────────────────
interface Plan {
  duration: string;
  label: string;
  steps: { icon: string; name: string; time: string }[];
}

const PLANS: Plan[] = [
  {
    duration: "5 min",
    label: "Morning spark",
    steps: [
      { icon: "leaf-outline", name: "Pranayama", time: "2 min" },
      { icon: "help-circle-outline", name: "Self-enquiry", time: "3 min" },
    ],
  },
  {
    duration: "10 min",
    label: "Daily foundation",
    steps: [
      { icon: "leaf-outline", name: "Pranayama", time: "3 min" },
      { icon: "radio-button-on", name: "Japa — 1 mala", time: "4 min" },
      { icon: "help-circle-outline", name: "Self-enquiry", time: "3 min" },
    ],
  },
  {
    duration: "20 min",
    label: "Deep practice",
    steps: [
      { icon: "leaf-outline", name: "Pranayama", time: "5 min" },
      { icon: "radio-button-on", name: "Japa — 2 malas", time: "8 min" },
      { icon: "help-circle-outline", name: "Self-enquiry", time: "5 min" },
      { icon: "moon-outline", name: "Silence", time: "2 min" },
    ],
  },
  {
    duration: "60 min",
    label: "Full sadhana",
    steps: [
      { icon: "leaf-outline", name: "Pranayama", time: "10 min" },
      { icon: "radio-button-on", name: "Japa — 5 malas", time: "20 min" },
      { icon: "help-circle-outline", name: "Self-enquiry", time: "15 min" },
      { icon: "walk-outline", name: "Walking meditation", time: "10 min" },
      { icon: "moon-outline", name: "Silence", time: "5 min" },
    ],
  },
];

// ── Breathing / Pranayama ─────────────────────────────────────────────────
const BREATH_PHASES = [
  { label: "Breathe In", duration: 4000, instruction: "Slowly inhale through your nose" },
  { label: "Hold", duration: 2000, instruction: "Gently hold your breath" },
  { label: "Breathe Out", duration: 6000, instruction: "Slowly exhale through your mouth" },
  { label: "Rest", duration: 2000, instruction: "Pause in stillness" },
];

function PranayamaSection({ onComplete }: { onComplete: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const circleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);

  function runPhase(index: number) {
    if (!runningRef.current) return;
    const phase = BREATH_PHASES[index % BREATH_PHASES.length];
    setPhaseIndex(index % BREATH_PHASES.length);
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
        setCycleCount((c) => {
          const newCount = c + 1;
          if (newCount >= 3) onComplete();
          return newCount;
        });
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
      Animated.timing(opacityAnim, { toValue: 0.5, duration: 600, useNativeDriver: true }),
    ]).start();
  }

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const scale = circleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] });
  const phase = BREATH_PHASES[phaseIndex];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <Ionicons name="leaf-outline" size={18} color={P.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Pranayama</Text>
          <Text style={styles.cardSub}>4-2-6-2 breathing pattern</Text>
        </View>
        {cycleCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cycleCount} cycles</Text>
          </View>
        )}
      </View>

      <View style={styles.breathCircleWrap}>
        <Animated.View style={[styles.breathOuter, { opacity: opacityAnim, transform: [{ scale }] }]}>
          <View style={styles.breathInner}>
            <MaterialCommunityIcons name="om" size={26} color={P.card} />
          </View>
        </Animated.View>
        <View style={styles.breathLabels}>
          {isRunning ? (
            <>
              <Text style={styles.breathPhase}>{phase.label}</Text>
              <Text style={styles.breathInstruction}>{phase.instruction}</Text>
            </>
          ) : (
            <Text style={styles.breathInstruction}>
              4 sec in · 2 hold · 6 out · 2 rest
            </Text>
          )}
        </View>
      </View>

      <Pressable
        style={[styles.primaryBtn, isRunning && styles.stopBtn]}
        onPress={isRunning ? stop : start}
        accessibilityRole="button"
      >
        <Ionicons name={isRunning ? "stop-circle" : "play-circle"} size={18} color={P.card} />
        <Text style={styles.primaryBtnText}>
          {isRunning ? "Stop" : "Begin Pranayama"}
        </Text>
      </Pressable>
    </View>
  );
}

// ── Japa Counter ──────────────────────────────────────────────────────────
function JapaCounter({ todayMalas, totalMalas, onMalaComplete }: {
  todayMalas: number;
  totalMalas: number;
  onMalaComplete: () => void;
}) {
  const [count, setCount] = useState(0);
  const [malas, setMalas] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  function pulse() {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  }

  async function handleTap() {
    pulse();
    const next = count + 1;
    if (next >= 108) {
      setCount(0);
      const newMalas = malas + 1;
      setMalas(newMalas);
      onMalaComplete();
      await addJapaMala();
      Alert.alert(
        "🕉️ Mala complete",
        `One mala of 108 completed.\n${newMalas} mala${newMalas === 1 ? "" : "s"} today.`,
        [{ text: "Continue", style: "default" }]
      );
    } else {
      setCount(next);
    }
  }

  function reset() {
    setCount(0);
  }

  const filled = count;
  const beadsPerRow = 12;
  const rows = Math.ceil(108 / beadsPerRow);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <MaterialCommunityIcons name="circle-multiple" size={18} color={P.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Japa — Mala Counter</Text>
          <Text style={styles.cardSub}>Om Namah Shivaya · 108 beads</Text>
        </View>
        {todayMalas + malas > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{todayMalas + malas} today</Text>
          </View>
        )}
      </View>

      {/* Bead grid */}
      <View style={styles.beadGrid}>
        {Array.from({ length: 108 }).map((_, i) => (
          <View
            key={i}
            style={[styles.bead, i < filled && styles.beadFilled]}
          />
        ))}
      </View>

      {/* Count display + tap target */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Pressable
          style={styles.japaCountBtn}
          onPress={handleTap}
          accessibilityRole="button"
          accessibilityLabel={`Japa count ${count} of 108. Tap to count.`}
        >
          <Text style={styles.japaCountNum}>{count}</Text>
          <Text style={styles.japaCountOf}>of 108</Text>
          <Text style={styles.japaTapHint}>TAP TO COUNT</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.japaStats}>
        <View style={styles.japaStatItem}>
          <Text style={styles.japaStatVal}>{todayMalas + malas}</Text>
          <Text style={styles.japaStatLabel}>Today</Text>
        </View>
        <View style={styles.japaStatDivider} />
        <View style={styles.japaStatItem}>
          <Text style={styles.japaStatVal}>{totalMalas}</Text>
          <Text style={styles.japaStatLabel}>All time</Text>
        </View>
        <View style={styles.japaStatDivider} />
        <View style={styles.japaStatItem}>
          <Text style={styles.japaStatVal}>{(totalMalas * 108).toLocaleString()}</Text>
          <Text style={styles.japaStatLabel}>Repetitions</Text>
        </View>
      </View>

      {count > 0 && (
        <Pressable style={styles.ghostBtn} onPress={reset} accessibilityRole="button">
          <Text style={styles.ghostBtnText}>Reset this mala</Text>
        </Pressable>
      )}

      <Text style={styles.mantraHint}>
        Om Namah Shivaya · Arunachala Shiva · Om Namo Bhagavate Sri Ramanaya
      </Text>
    </View>
  );
}

// ── Silence Timer ─────────────────────────────────────────────────────────
const SILENCE_DURATIONS = [
  { label: "5 min", secs: 300 },
  { label: "10 min", secs: 600 },
  { label: "15 min", secs: 900 },
  { label: "20 min", secs: 1200 },
  { label: "30 min", secs: 1800 },
];

function SilenceTimer({ onComplete }: { onComplete: () => void }) {
  const [selectedSecs, setSelectedSecs] = useState(600);
  const [remaining, setRemaining] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function start() {
    setRemaining(selectedSecs);
    Animated.timing(fadeAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }).start();
  }

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRemaining(null);
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0) {
      stop();
      onComplete();
      Alert.alert("🔔 Silence complete", "Your practice is done. Return gently.", [{ text: "Om" }]);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((r) => (r != null ? r - 1 : null));
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [remaining]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  const isRunning = remaining !== null;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <Ionicons name="moon-outline" size={18} color={P.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Silence Practice</Text>
          <Text style={styles.cardSub}>Sit. Do nothing. Just be.</Text>
        </View>
      </View>

      {!isRunning && (
        <View style={styles.durationRow}>
          {SILENCE_DURATIONS.map((d) => (
            <Pressable
              key={d.secs}
              style={[styles.durationChip, selectedSecs === d.secs && styles.durationChipActive]}
              onPress={() => setSelectedSecs(d.secs)}
              accessibilityRole="button"
            >
              <Text style={[styles.durationChipText, selectedSecs === d.secs && styles.durationChipTextActive]}>
                {d.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <Animated.View style={[styles.timerDisplay, { opacity: isRunning ? fadeAnim : 1 }]}>
        <Text style={styles.timerTime}>
          {isRunning ? formatTime(remaining!) : formatTime(selectedSecs)}
        </Text>
        {isRunning && (
          <Text style={styles.timerSubtext}>Remain still. Let thoughts pass.</Text>
        )}
      </Animated.View>

      <Pressable
        style={[styles.primaryBtn, isRunning && styles.stopBtn]}
        onPress={isRunning ? stop : start}
        accessibilityRole="button"
      >
        <Ionicons name={isRunning ? "stop-circle" : "play-circle"} size={18} color={P.card} />
        <Text style={styles.primaryBtnText}>
          {isRunning ? "End silence" : "Begin silence"}
        </Text>
      </Pressable>

      <Text style={styles.silenceHint}>
        Bhagavan's deepest teaching was silence. When you are quiet enough, you can still hear him.
      </Text>
    </View>
  );
}

// ── Self-Enquiry ──────────────────────────────────────────────────────────
function SelfEnquirySection() {
  const [expanded, setExpanded] = useState(false);

  const QUESTIONS = [
    "Who is the one who is anxious?",
    "Who is the one who is thinking right now?",
    "What remains when all thought stops?",
    "Who am I, beneath every role I play?",
    "Where does the sense of 'I' arise from?",
  ];

  const today = new Date().getDay();
  const question = QUESTIONS[today % QUESTIONS.length];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <Ionicons name="help-circle-outline" size={18} color={P.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Self-Enquiry</Text>
          <Text style={styles.cardSub}>The direct path of Ramana Maharshi</Text>
        </View>
      </View>

      <View style={styles.enquiryQuestion}>
        <Text style={styles.enquiryQuestionText}>{question}</Text>
      </View>

      <Text style={styles.enquiryBody}>
        Sit quietly. Ask this question — not to find a word-answer, but to turn attention inward toward the source of the question itself.{"\n\n"}
        Notice what remains when thought becomes still. That silent, aware presence is your true nature.
      </Text>

      <Pressable
        style={styles.ghostBtn}
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
      >
        <Text style={styles.ghostBtnText}>{expanded ? "Hide mantras" : "Walking mantras"}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={14} color={P.gold} />
      </Pressable>

      {expanded && (
        <View style={styles.mantrasBox}>
          {[
            "Om Namah Shivaya",
            "Arunachala Shiva, Arunachala Shiva",
            "Shiva, Shiva (one chant per step)",
            "Om Namo Bhagavate Sri Ramanaya",
          ].map((m) => (
            <View key={m} style={styles.mantraRow}>
              <View style={styles.mantraDot} />
              <Text style={styles.mantraText}>{m}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Walking Meditation ────────────────────────────────────────────────────
function WalkingMeditationSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const STEPS = [
    { icon: "footsteps-outline", title: "Set your intention", body: "Before the first step, pause. Bring hands together. Say inwardly: 'I walk in awareness. May each step be a prayer.' Let go of the destination." },
    { icon: "radio-button-on-outline", title: "Feel each step", body: "Walk slowly. As each foot meets the ground, feel the contact — heel, arch, toes. Do not rush. The hill receives every step." },
    { icon: "musical-note-outline", title: "Anchor with mantra", body: "With each step, repeat Om Namah Shivaya — one syllable per step: Om (left) Na (right) Mah (left) Shi (right) Va (left) Ya (right). Let the mantra match your pace, not the other way around." },
    { icon: "eye-outline", title: "Rest the gaze", body: "Look about 6 feet ahead, eyes soft and relaxed — not looking for anything. When the mind pulls toward scenery or distraction, return to the breath and the step." },
    { icon: "leaf-outline", title: "Pause at each lingam", body: "At every Ashta Lingam, stop. Stand in silence for 30 seconds. Feel the specific quality of that direction — the teaching that lingam embodies. Then continue." },
    { icon: "heart-outline", title: "Close in gratitude", body: "At journey's end, stand still. Place hands on heart. Say internally: 'Arunachala received my steps. I am grateful.' Bow to the hill." },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrap}>
          <Ionicons name="walk-outline" size={18} color={P.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Walking Meditation</Text>
          <Text style={styles.cardSub}>Conscious Girivalam — step by step</Text>
        </View>
      </View>

      <Text style={styles.walkingIntro}>
        Walking can be meditation. Ramana said: 'Even unintentional Girivalam purifies. Done with awareness, it grants liberation.' These six steps turn the walk into a moving practice.
      </Text>

      <View style={styles.walkingSteps}>
        {STEPS.map((step, i) => (
          <Pressable
            key={i}
            style={styles.walkStep}
            onPress={() => setActiveStep(activeStep === i ? null : i)}
            accessibilityRole="button"
          >
            <View style={styles.walkStepLeft}>
              <View style={styles.walkStepNum}>
                <Text style={styles.walkStepNumText}>{i + 1}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={styles.walkStepLine} />}
            </View>
            <View style={styles.walkStepContent}>
              <View style={styles.walkStepHeader}>
                <Ionicons name={step.icon as any} size={16} color={P.gold} />
                <Text style={styles.walkStepTitle}>{step.title}</Text>
                <Ionicons
                  name={activeStep === i ? "chevron-up" : "chevron-down"}
                  size={13}
                  color={P.textLight}
                />
              </View>
              {activeStep === i && (
                <Text style={styles.walkStepBody}>{step.body}</Text>
              )}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────
export default function SadhanaScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const quote = getDailyQuote();
  const [sadhana, setSadhana] = useState<SadhanaData>({ log: {}, totalMalas: 0 });
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const reload = useCallback(async () => {
    const data = await getSadhanaData();
    setSadhana(data);
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const streak = getSadhanaStreak(sadhana);
  const todayKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();
  const todayMalas = sadhana.log[todayKey]?.malas ?? 0;

  async function handlePracticed() {
    const updated = await markSadhanaPracticed();
    setSadhana(updated);
  }

  async function handleMalaComplete() {
    const updated = await getSadhanaData();
    setSadhana(updated);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: P.bg }]}
      contentContainerStyle={{ paddingBottom: bottomInset + 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: topInset + 12 }]}>
        <View>
          <Text style={styles.screenTitle}>Sadhana</Text>
          <Text style={styles.screenSub}>Your daily spiritual practice</Text>
        </View>
        {streak > 0 && (
          <View style={styles.streakPill}>
            <Ionicons name="flame" size={14} color={P.gold} />
            <Text style={styles.streakText}>{streak} day streak</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* ── Daily quote ── */}
        <View style={styles.quoteCard}>
          <Ionicons name="sunny-outline" size={16} color={P.gold} />
          <Text style={styles.quoteText}>"{quote}"</Text>
          <Text style={styles.quoteAuthor}>— Sri Ramana Maharshi</Text>
        </View>

        {/* ── Practice Plans ── */}
        <Text style={styles.sectionLabel}>CHOOSE YOUR PRACTICE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.plansScroll}
        >
          {PLANS.map((plan, i) => (
            <Pressable
              key={plan.duration}
              style={[styles.planCard, selectedPlan === i && styles.planCardActive]}
              onPress={() => setSelectedPlan(selectedPlan === i ? null : i)}
              accessibilityRole="button"
            >
              <Text style={[styles.planDuration, selectedPlan === i && styles.planDurationActive]}>
                {plan.duration}
              </Text>
              <Text style={styles.planLabel}>{plan.label}</Text>
              {selectedPlan === i && (
                <View style={styles.planSteps}>
                  {plan.steps.map((step, si) => (
                    <View key={si} style={styles.planStep}>
                      <Ionicons name={step.icon as any} size={12} color={P.gold} />
                      <Text style={styles.planStepText}>{step.name}</Text>
                      <Text style={styles.planStepTime}>{step.time}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Pranayama ── */}
        <Text style={styles.sectionLabel}>PRANAYAMA</Text>
        <PranayamaSection onComplete={handlePracticed} />

        {/* ── Japa ── */}
        <Text style={styles.sectionLabel}>JAPA — MALA COUNTING</Text>
        <JapaCounter
          todayMalas={todayMalas}
          totalMalas={sadhana.totalMalas}
          onMalaComplete={handleMalaComplete}
        />

        {/* ── Silence ── */}
        <Text style={styles.sectionLabel}>SILENCE PRACTICE</Text>
        <SilenceTimer onComplete={handlePracticed} />

        {/* ── Self-Enquiry ── */}
        <Text style={styles.sectionLabel}>SELF-ENQUIRY</Text>
        <SelfEnquirySection />

        {/* ── Walking meditation ── */}
        <Text style={styles.sectionLabel}>WALKING MEDITATION</Text>
        <WalkingMeditationSection />

        {/* ── Mark practiced ── */}
        {!sadhana.log[todayKey]?.practiced && (
          <Pressable
            style={styles.markDoneBtn}
            onPress={handlePracticed}
            accessibilityRole="button"
          >
            <Ionicons name="checkmark-circle" size={20} color={P.card} />
            <Text style={styles.markDoneBtnText}>Mark today's practice complete</Text>
          </Pressable>
        )}
        {sadhana.log[todayKey]?.practiced && (
          <View style={styles.doneCard}>
            <Ionicons name="checkmark-circle" size={20} color={P.gold} />
            <Text style={styles.doneText}>Practice complete for today 🙏</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  screenTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: P.text },
  screenSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: P.textLight, marginTop: 2 },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: P.goldFaint,
    borderWidth: 1,
    borderColor: P.gold,
    marginTop: 6,
  },
  streakText: { fontSize: 12, fontFamily: "Inter_700Bold", color: P.gold },

  content: { paddingHorizontal: 14, paddingTop: 6, gap: 8 },

  quoteCard: {
    backgroundColor: P.goldFaint,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${P.gold}33`,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  quoteText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: P.text,
    lineHeight: 22,
    fontStyle: "italic",
    textAlign: "center",
  },
  quoteAuthor: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: P.gold },

  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: P.textLight,
    letterSpacing: 1.5,
    marginTop: 8,
    marginLeft: 2,
  },

  // Plan cards
  plansScroll: { gap: 10, paddingBottom: 4, paddingRight: 4 },
  planCard: {
    width: 130,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: P.border,
    backgroundColor: P.card,
    padding: 14,
    gap: 6,
  },
  planCardActive: { borderColor: P.gold, backgroundColor: P.goldFaint },
  planDuration: { fontSize: 20, fontFamily: "Inter_700Bold", color: P.text },
  planDurationActive: { color: P.gold },
  planLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: P.textLight },
  planSteps: { gap: 6, marginTop: 6 },
  planStep: { flexDirection: "row", alignItems: "center", gap: 6 },
  planStepText: { flex: 1, fontSize: 11, fontFamily: "Inter_500Medium", color: P.text },
  planStepTime: { fontSize: 10, fontFamily: "Inter_400Regular", color: P.textLight },

  // Shared card
  card: {
    backgroundColor: P.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: P.border,
    padding: 16,
    gap: 12,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: P.goldFaint,
    alignItems: "center", justifyContent: "center",
  },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: P.text },
  cardSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: P.textLight, marginTop: 1 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    backgroundColor: P.goldFaint, borderWidth: 1, borderColor: `${P.gold}44`,
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: P.gold },

  // Pranayama
  breathCircleWrap: { alignItems: "center", gap: 14, paddingVertical: 4 },
  breathOuter: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: P.gold,
    alignItems: "center", justifyContent: "center",
  },
  breathInner: {
    width: 66, height: 66, borderRadius: 33,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  breathLabels: { alignItems: "center", gap: 4 },
  breathPhase: { fontSize: 16, fontFamily: "Inter_700Bold", color: P.text },
  breathInstruction: { fontSize: 12, fontFamily: "Inter_400Regular", color: P.textLight, textAlign: "center", lineHeight: 18 },

  // Buttons
  primaryBtn: {
    backgroundColor: P.gold,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 13, borderRadius: 12,
  },
  stopBtn: { backgroundColor: P.textMid ?? "#666" },
  primaryBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: P.card },
  ghostBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 9,
    borderWidth: 1, borderColor: P.gold,
    borderRadius: 10, backgroundColor: P.goldFaint,
  },
  ghostBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: P.gold },

  // Japa
  beadGrid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: 4, paddingVertical: 4,
  },
  bead: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: P.border,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.06)",
  },
  beadFilled: { backgroundColor: P.gold, borderColor: P.gold },
  japaCountBtn: {
    alignSelf: "center",
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: P.goldFaint,
    borderWidth: 2, borderColor: P.gold,
    alignItems: "center", justifyContent: "center",
    gap: 2,
  },
  japaCountNum: { fontSize: 44, fontFamily: "Inter_700Bold", color: P.text, lineHeight: 50 },
  japaCountOf: { fontSize: 12, fontFamily: "Inter_400Regular", color: P.textLight },
  japaTapHint: { fontSize: 9, fontFamily: "Inter_700Bold", color: P.gold, letterSpacing: 1.5, marginTop: 4 },
  japaStats: { flexDirection: "row", gap: 0 },
  japaStatItem: { flex: 1, alignItems: "center" },
  japaStatVal: { fontSize: 18, fontFamily: "Inter_700Bold", color: P.text },
  japaStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: P.textLight, marginTop: 2 },
  japaStatDivider: { width: 1, backgroundColor: P.border, marginVertical: 4 },
  mantraHint: {
    fontSize: 11, fontFamily: "Inter_400Regular", color: P.textLight,
    textAlign: "center", fontStyle: "italic", lineHeight: 17,
  },

  // Silence timer
  durationRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  durationChip: {
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: P.border, backgroundColor: P.card,
  },
  durationChipActive: { backgroundColor: P.goldFaint, borderColor: P.gold },
  durationChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: P.textMid },
  durationChipTextActive: { color: P.gold, fontFamily: "Inter_700Bold" },
  timerDisplay: { alignItems: "center", gap: 6, paddingVertical: 8 },
  timerTime: { fontSize: 52, fontFamily: "Inter_700Bold", color: P.text, letterSpacing: -2 },
  timerSubtext: { fontSize: 12, fontFamily: "Inter_400Regular", color: P.textLight, fontStyle: "italic" },
  silenceHint: {
    fontSize: 12, fontFamily: "Inter_400Regular", color: P.textLight,
    textAlign: "center", fontStyle: "italic", lineHeight: 18,
  },

  // Self-enquiry
  enquiryQuestion: {
    backgroundColor: P.goldFaint,
    borderRadius: 12, padding: 14,
    borderLeftWidth: 3, borderLeftColor: P.gold,
  },
  enquiryQuestionText: {
    fontSize: 18, fontFamily: "Inter_700Bold", color: P.text, textAlign: "center",
  },
  enquiryBody: {
    fontSize: 13, fontFamily: "Inter_400Regular", color: P.textMid, lineHeight: 21,
  },
  mantrasBox: {
    backgroundColor: "#FAFAF8", borderRadius: 10, padding: 12, gap: 10,
    borderWidth: 1, borderColor: P.border,
  },
  mantraRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  mantraDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: P.gold,
  },
  mantraText: { fontSize: 13, fontFamily: "Inter_500Medium", color: P.text },

  // Walking meditation
  walkingIntro: {
    fontSize: 13, fontFamily: "Inter_400Regular", color: P.textMid, lineHeight: 20,
  },
  walkingSteps: { gap: 0 },
  walkStep: { flexDirection: "row", gap: 10, paddingVertical: 4 },
  walkStepLeft: { alignItems: "center", width: 28 },
  walkStepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: P.goldFaint, borderWidth: 1, borderColor: P.gold,
    alignItems: "center", justifyContent: "center",
  },
  walkStepNumText: { fontSize: 11, fontFamily: "Inter_700Bold", color: P.gold },
  walkStepLine: { flex: 1, width: 1, backgroundColor: P.border, marginVertical: 2 },
  walkStepContent: { flex: 1, paddingBottom: 12 },
  walkStepHeader: { flexDirection: "row", alignItems: "center", gap: 7, flex: 1 },
  walkStepTitle: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold", color: P.text },
  walkStepBody: {
    fontSize: 13, fontFamily: "Inter_400Regular", color: P.textMid,
    lineHeight: 20, marginTop: 6,
  },

  // Bottom CTAs
  markDoneBtn: {
    backgroundColor: P.gold,
    borderRadius: 14, padding: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, marginTop: 8,
  },
  markDoneBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: P.card },
  doneCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 16,
    borderRadius: 14, borderWidth: 1, borderColor: P.gold,
    backgroundColor: P.goldFaint, marginTop: 8,
  },
  doneText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: P.goldDark },
});
