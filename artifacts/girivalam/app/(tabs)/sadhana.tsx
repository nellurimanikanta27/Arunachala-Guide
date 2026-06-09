import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PRACTICES, ROUTINES } from "@/lib/sadhana-practices";
import {
  getSadhanaData,
  getSadhanaStreak,
  type SadhanaData,
} from "@/lib/pilgrimage-store";

const G = "#C2A24E";
const GF = "rgba(194,162,78,0.10)";
const GB = "rgba(194,162,78,0.20)";

function todayDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getThisWeekCount(data: SadhanaData): number {
  const now = new Date();
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (data.log[k]?.practiced) count++;
  }
  return count;
}

export default function SadhanaScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const [sadhana, setSadhana] = useState<SadhanaData>({ log: {}, totalMalas: 0, totalMinutes: 0, sessions: [] });

  useFocusEffect(useCallback(() => {
    getSadhanaData().then(setSadhana).catch(() => {});
  }, []));

  const streak = getSadhanaStreak(sadhana);
  const todayKey = todayDateKey();
  const todayDay = sadhana.log[todayKey];
  const todayMins = todayDay?.minutes ?? 0;
  const totalMins = sadhana.totalMinutes ?? 0;
  const weekCount = getThisWeekCount(sadhana);
  const missedYesterday = (() => {
    const yd = new Date(); yd.setDate(yd.getDate() - 1);
    const yk = `${yd.getFullYear()}-${String(yd.getMonth() + 1).padStart(2, "0")}-${String(yd.getDate()).padStart(2, "0")}`;
    return streak === 0 && !sadhana.log[yk]?.practiced;
  })();

  // Suggested practice: first one not done today, or daily rotation
  const donePractices = new Set(todayDay?.practices ?? []);
  const suggestedPractice = PRACTICES.find((p) => !donePractices.has(p.id)) ?? PRACTICES[new Date().getDay() % PRACTICES.length];

  function goToPractice(practiceId: string) {
    router.push({ pathname: "/sadhana-practice", params: { practiceId } } as any);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: bottomInset + 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topInset + 16 }]}>
        <Text style={styles.greeting}>Begin where you are.</Text>
        <Text style={styles.subtitle}>
          Daily practice to carry Arunachala within.
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{streak}</Text>
            <Text style={styles.statLabel}>day streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{weekCount}/7</Text>
            <Text style={styles.statLabel}>this week</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{totalMins}</Text>
            <Text style={styles.statLabel}>total mins</Text>
          </View>
        </View>

        {/* Gentle message */}
        {missedYesterday && (
          <View style={styles.gentleNotice}>
            <Ionicons name="heart-outline" size={13} color={G} />
            <Text style={styles.gentleText}>
              Begin again. Arunachala does not count your failures.
            </Text>
          </View>
        )}
        {!missedYesterday && (
          <Text style={styles.softReminder}>
            No pressure. Return gently.
          </Text>
        )}

        {todayMins > 0 && (
          <View style={styles.todayDone}>
            <Ionicons name="checkmark-circle" size={14} color={G} />
            <Text style={styles.todayDoneText}>{todayMins} minutes practiced today</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {/* ── Start Today's Sadhana ───────────────────────────────── */}
        <Pressable
          style={styles.ctaBtn}
          onPress={() => goToPractice(suggestedPractice.id)}
          accessibilityRole="button"
        >
          <View style={styles.ctaLeft}>
            <Text style={styles.ctaEmoji}>{suggestedPractice.emoji}</Text>
            <View>
              <Text style={styles.ctaLabel}>Start Today's Sadhana</Text>
              <Text style={styles.ctaName}>{suggestedPractice.name}</Text>
            </View>
          </View>
          <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.9)" />
        </Pressable>

        {/* ── Daily Routines ─────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>DAILY ROUTINES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.routineScroll}
        >
          {ROUTINES.map((r) => (
            <Pressable
              key={r.name}
              style={styles.routineCard}
              onPress={() => goToPractice(r.practices[0].id)}
              accessibilityRole="button"
            >
              <Ionicons name={r.icon as any} size={18} color={G} />
              <Text style={styles.routineMins}>{r.totalMins} min</Text>
              <Text style={styles.routineName}>{r.name}</Text>
              <Text style={styles.routineDesc}>{r.description}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Practice Library ───────────────────────────────────── */}
        <Text style={styles.sectionLabel}>PRACTICE LIBRARY</Text>
        <View style={styles.practiceGrid}>
          {PRACTICES.map((p) => {
            const done = donePractices.has(p.id);
            return (
              <Pressable
                key={p.id}
                style={[styles.practiceCard, done && styles.practiceCardDone]}
                onPress={() => goToPractice(p.id)}
                accessibilityRole="button"
              >
                <Text style={styles.practiceEmoji}>{p.emoji}</Text>
                <Text style={[styles.practiceName, done && styles.practiceNameDone]}>
                  {p.name}
                </Text>
                <Text style={styles.practiceDur}>{p.defaultDurationMins} min</Text>
                {done && (
                  <Ionicons name="checkmark-circle" size={14} color={G} style={styles.practiceCheck} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ── History strip ──────────────────────────────────────── */}
        {(sadhana.sessions ?? []).length > 0 && (
          <>
            <Text style={styles.sectionLabel}>RECENT SESSIONS</Text>
            <View style={styles.historyCard}>
              {(sadhana.sessions ?? []).slice(0, 5).map((s) => (
                <View key={s.id} style={styles.historyRow}>
                  <Text style={styles.historyEmoji}>
                    {PRACTICES.find((p) => p.id === s.practiceId)?.emoji ?? "🕯️"}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyName}>{s.practiceName}</Text>
                    <Text style={styles.historyMeta}>{s.date} · {s.durationMins} min</Text>
                  </View>
                  {s.reflection && (
                    <Ionicons name="create-outline" size={14} color={G} />
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerQuote}>
            "Even five minutes of practice can change the quality of your day."
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#FAFAF7",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  greeting: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#888",
    lineHeight: 20,
    marginBottom: 18,
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.07)",
    paddingVertical: 14,
    marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#1A1A1A" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#999", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "rgba(0,0,0,0.07)", marginVertical: 4 },

  gentleNotice: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: GF, borderRadius: 10, borderWidth: 1, borderColor: GB,
    marginBottom: 6,
  },
  gentleText: {
    flex: 1, fontSize: 12, fontFamily: "Inter_400Regular",
    color: "#8B6914", lineHeight: 17, fontStyle: "italic",
  },
  softReminder: {
    fontSize: 12, fontFamily: "Inter_400Regular",
    color: "#AAA", fontStyle: "italic", marginBottom: 6,
  },
  todayDone: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4,
  },
  todayDoneText: { fontSize: 12, fontFamily: "Inter_500Medium", color: G },

  content: { padding: 14, gap: 8 },

  ctaBtn: {
    backgroundColor: G,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  ctaLeft: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  ctaEmoji: { fontSize: 28 },
  ctaLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.75)", letterSpacing: 0.5, textTransform: "uppercase" },
  ctaName: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginTop: 2 },

  sectionLabel: {
    fontSize: 10, fontFamily: "Inter_700Bold",
    color: "#BBB", letterSpacing: 1.5, marginTop: 10, marginLeft: 2,
  },

  routineScroll: { gap: 10, paddingBottom: 4, paddingRight: 4 },
  routineCard: {
    width: 140, padding: 14, borderRadius: 16,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(0,0,0,0.07)",
    gap: 4,
  },
  routineMins: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1A1A1A", marginTop: 6 },
  routineName: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#1A1A1A" },
  routineDesc: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#999", lineHeight: 14 },

  practiceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  practiceCard: {
    width: "47%",
    padding: 14, borderRadius: 16,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(0,0,0,0.07)",
    gap: 4, position: "relative",
  },
  practiceCardDone: { backgroundColor: GF, borderColor: GB },
  practiceEmoji: { fontSize: 22 },
  practiceName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1A1A1A", marginTop: 4 },
  practiceNameDone: { color: "#8B6914" },
  practiceDur: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#999" },
  practiceCheck: { position: "absolute", top: 10, right: 10 },

  historyCard: {
    backgroundColor: "#FFFFFF", borderRadius: 16,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.07)",
    overflow: "hidden",
  },
  historyRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.04)",
  },
  historyEmoji: { fontSize: 18 },
  historyName: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#1A1A1A" },
  historyMeta: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#999", marginTop: 1 },

  footer: { alignItems: "center", paddingVertical: 20 },
  footerQuote: {
    fontSize: 12, fontFamily: "Inter_400Regular",
    color: "#CCC", textAlign: "center", lineHeight: 18, fontStyle: "italic",
  },
});
