import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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
import {
  clearAllPilgrimageData,
  getMoments,
  getSettings,
  getStats,
  getStories,
  getWalks,
  type Moment,
  type MomentKind,
  type Settings,
  type Stats,
  type Story,
  type Walk,
  updateSettings,
} from "@/lib/pilgrimage-store";

const KIND_META: Record<MomentKind, { icon: string; label: string }> = {
  photo: { icon: "📷", label: "Photo" },
  voice: { icon: "🎙️", label: "Voice note" },
  note: { icon: "✍️", label: "Note" },
  feeling: { icon: "❤️", label: "Feeling" },
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MomentRow({ moment, isLast }: { moment: Moment; isLast: boolean }) {
  const meta = KIND_META[moment.kind];
  return (
    <View style={styles.momentRow}>
      <View style={styles.momentRail}>
        <View style={styles.momentDot} />
        {!isLast && <View style={styles.momentLine} />}
      </View>
      <View style={styles.momentBody}>
        <View style={styles.momentHead}>
          <Text style={styles.momentLingam}>{moment.lingamName}</Text>
          <Text style={styles.momentTime}>{formatTime(moment.savedAt)}</Text>
        </View>
        {moment.note ? (
          <Text style={styles.momentExcerpt}>"{moment.note}"</Text>
        ) : (
          <Text style={styles.momentExcerptFaint}>Marked at this lingam</Text>
        )}
        <View style={styles.momentTagRow}>
          <Text style={styles.momentTag}>
            {meta.icon} {meta.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

function SettingsRow({
  icon,
  title,
  value,
  onPress,
  destructive,
}: {
  icon: string;
  title: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      style={styles.settingsRow}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Ionicons name={icon as any} size={18} color={destructive ? Colors.primary : Colors.textMid} />
      <Text style={[styles.settingsTitle, destructive && { color: Colors.primary }]}>{title}</Text>
      {value ? <Text style={styles.settingsValue}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={14} color={Colors.textFaint} />
    </Pressable>
  );
}

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const [loaded, setLoaded] = useState(false);
  const [walks, setWalks] = useState<Walk[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const reload = useCallback(async () => {
    const [w, m, s, st, statsData] = await Promise.all([
      getWalks(),
      getMoments(),
      getStories(),
      getSettings(),
      getStats(),
    ]);
    setWalks(w);
    setMoments(m);
    setStories(s);
    setSettings(st);
    setStats(statsData);
    setLoaded(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  function comingSoon(what: string, body: string) {
    Alert.alert(what, body);
  }

  function confirmClear() {
    Alert.alert(
      "Clear all pilgrimage data?",
      "This will remove every saved moment, walk, story, and setting from this device. There is no cloud backup — this cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear everything",
          style: "destructive",
          onPress: async () => {
            await clearAllPilgrimageData();
            await reload();
            Alert.alert("Cleared", "Your pilgrimage archive on this device is now empty.");
          },
        },
      ]
    );
  }

  async function toggleBackup() {
    if (!settings) return;
    if (!settings.backupOptIn) {
      Alert.alert(
        "Cloud backup",
        "Turning on backup will need a one-time sign-in (Google or email) so your archive can survive a phone change.\n\nThe sign-in flow is being added in the next pass. For now, your pilgrimage stays on this phone only.",
        [{ text: "OK" }]
      );
      return;
    }
    const next = await updateSettings({ backupOptIn: false });
    setSettings(next);
  }

  // Group moments under their walk
  const walkById = new Map(walks.map((w) => [w.id, w]));
  const momentsByWalk = new Map<string, Moment[]>();
  for (const m of moments) {
    const list = momentsByWalk.get(m.walkId) ?? [];
    list.push(m);
    momentsByWalk.set(m.walkId, list);
  }
  // Sort walks newest first
  const walkIdsOrdered = [...momentsByWalk.keys()].sort((a, b) => {
    const wa = walkById.get(a)?.startedAt ?? 0;
    const wb = walkById.get(b)?.startedAt ?? 0;
    return wb - wa;
  });

  const hasAnyData = moments.length > 0 || walks.length > 0 || stories.length > 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primaryDark, Colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topInset + 14 }]}
      >
        <View style={styles.headerTop}>
          <MaterialCommunityIcons name="foot-print" size={16} color="rgba(255,255,255,0.6)" />
          <Text style={styles.headerTag}>Your Pilgrimage</Text>
        </View>
        <Text style={styles.headerTitle}>My walks around{"\n"}Arunachala</Text>
        <View style={styles.privacyPill}>
          <Ionicons
            name={settings?.backupOptIn ? "cloud-done" : "lock-closed"}
            size={10}
            color="rgba(255,255,255,0.7)"
          />
          <Text style={styles.privacyPillText}>
            {settings?.backupOptIn ? "Backed up to cloud" : "Stays on this phone · no account"}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── STATS ───────────────────────────────────────── */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <StatBlock value={String(stats?.walks ?? 0)} label="Walks" />
            <View style={styles.statDivider} />
            <StatBlock value={`${stats?.distanceKm ?? 0} km`} label="Distance" />
            <View style={styles.statDivider} />
            <StatBlock value={String(stats?.malas ?? 0)} label="Malas" />
            <View style={styles.statDivider} />
            <StatBlock value={String(stats?.pournamis ?? 0)} label="Pournamis" />
          </View>
          <View style={styles.statsFootDivider} />
          <Text style={styles.statsFoot}>
            {stats && stats.totalMoments > 0
              ? `${stats.totalMoments} moment${stats.totalMoments === 1 ? "" : "s"} saved${stats.firstWalkAt ? ` · since ${formatDate(stats.firstWalkAt)}` : ""}`
              : "No moments saved yet"}
          </Text>
        </View>

        {/* ── EMPTY STATE or TIMELINE ─────────────────────── */}
        {loaded && !hasAnyData ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="foot-print" size={36} color={Colors.textFaint} />
            <Text style={styles.emptyTitle}>Your archive is empty</Text>
            <Text style={styles.emptyText}>
              When you walk and save a moment at a lingam — a note, a feeling, a photo — it will appear here, kept only on this phone.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>MOMENTS</Text>
            {walkIdsOrdered.map((wid) => {
              const walk = walkById.get(wid);
              const items = momentsByWalk.get(wid) ?? [];
              return (
                <View key={wid} style={styles.walkCard}>
                  <View style={styles.walkHead}>
                    <Text style={styles.walkDate}>
                      {walk ? formatDate(walk.startedAt) : "Walk"}
                    </Text>
                    {walk?.label ? <Text style={styles.walkLabel}>{walk.label}</Text> : null}
                  </View>
                  <View style={styles.walkBody}>
                    {items
                      .sort((a, b) => a.savedAt - b.savedAt)
                      .map((m, i) => (
                        <MomentRow key={m.id} moment={m} isLast={i === items.length - 1} />
                      ))}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ── REFLECTIONS ─────────────────────────────────── */}
        <Text style={styles.sectionLabel}>REFLECTIONS</Text>
        {stories.length === 0 ? (
          <Text style={styles.softHint}>
            Longer reflections you write after a walk will appear here.
          </Text>
        ) : (
          stories.map((s) => (
            <Pressable
              key={s.id}
              style={styles.storyCard}
              onPress={() =>
                comingSoon(
                  s.title,
                  "Reading and editing full reflections is being added in the next pass."
                )
              }
              accessibilityRole="button"
              accessibilityLabel={s.title}
            >
              <Text style={styles.storyDate}>
                {formatDate(s.createdAt)} · after {ordinal(s.walksAtTime)} walk
              </Text>
              <Text style={styles.storyTitle}>{s.title}</Text>
              <Text style={styles.storyExcerpt}>{s.body.slice(0, 180)}</Text>
              <Text style={styles.storyMore}>Read more →</Text>
            </Pressable>
          ))
        )}
        <Pressable
          style={styles.writeBtn}
          onPress={() =>
            comingSoon(
              "Write a reflection",
              "The editor for longer reflections is being added in the next pass."
            )
          }
          accessibilityRole="button"
          accessibilityLabel="Write a new reflection"
        >
          <Ionicons name="create-outline" size={16} color={Colors.primary} />
          <Text style={styles.writeBtnText}>Write a reflection</Text>
        </Pressable>

        {/* ── SETTINGS ────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <View style={styles.settingsGroup}>
          <SettingsRow
            icon={settings?.backupOptIn ? "cloud-done-outline" : "cloud-offline-outline"}
            title="Cloud backup"
            value={settings?.backupOptIn ? "On" : "Off"}
            onPress={toggleBackup}
          />
          <View style={styles.settingsDivider} />
          <SettingsRow
            icon="language-outline"
            title="Language"
            value={
              settings?.language === "ta" ? "தமிழ்" : settings?.language === "hi" ? "हिन्दी" : "English"
            }
            onPress={() => comingSoon("Language", "Tamil and Hindi are being added in the next pass.")}
          />
          <View style={styles.settingsDivider} />
          <SettingsRow
            icon="speedometer-outline"
            title="Units"
            value={settings?.units === "mi" ? "Miles" : "Kilometres"}
            onPress={async () => {
              if (!settings) return;
              const next = await updateSettings({ units: settings.units === "km" ? "mi" : "km" });
              setSettings(next);
            }}
          />
          <View style={styles.settingsDivider} />
          <SettingsRow
            icon="location-outline"
            title="Location permission"
            value="While using app"
            onPress={() =>
              comingSoon(
                "Location permission",
                "Location is only used while you walk and is never sent off your phone. System settings link is being added in the next pass."
              )
            }
          />
          <View style={styles.settingsDivider} />
          <SettingsRow
            icon="trash-outline"
            title="Clear all my data"
            onPress={confirmClear}
            destructive
          />
        </View>

        <Text style={styles.storageNote}>
          {settings?.backupOptIn
            ? "Your pilgrimage is kept on this phone and quietly backed up."
            : "Your pilgrimage is kept only on this phone. Uninstalling the app or losing the phone will lose this archive — turn on Cloud backup to protect it."}
        </Text>

        <Text style={styles.footerText}>ॐ नमः शिवाय · Arunachala Shiva</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.warmWhite },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 10 },
  headerTag: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  privacyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.18)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 12,
  },
  privacyPillText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.75)",
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingTop: 14, gap: 8 },

  statsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statBlock: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.primary },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    marginTop: 2,
  },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.border },
  statsFootDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginTop: 14,
    marginBottom: 10,
  },
  statsFoot: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    textAlign: "center",
  },

  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 22,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 18,
  },

  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textFaint,
    letterSpacing: 1.5,
    marginLeft: 2,
    marginTop: 14,
    marginBottom: 2,
  },

  walkCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  walkHead: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  walkDate: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textMid },
  walkLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textLight },
  walkBody: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },

  momentRow: { flexDirection: "row", gap: 10 },
  momentRail: { alignItems: "center", paddingTop: 4, width: 14 },
  momentDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  momentLine: { width: 1, flex: 1, backgroundColor: Colors.border, marginTop: 2 },
  momentBody: { flex: 1, paddingBottom: 12 },
  momentHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  momentLingam: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  momentTime: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textFaint },
  momentExcerpt: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMid,
    fontStyle: "italic",
    lineHeight: 17,
  },
  momentExcerptFaint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textFaint,
    fontStyle: "italic",
  },
  momentTagRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  momentTag: { fontSize: 10, fontFamily: "Inter_500Medium", color: Colors.primary },

  softHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    fontStyle: "italic",
    paddingHorizontal: 6,
    paddingVertical: 8,
  },

  storyCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  storyDate: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.textFaint,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  storyTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginBottom: 6,
  },
  storyExcerpt: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMid,
    lineHeight: 18,
    fontStyle: "italic",
  },
  storyMore: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
    marginTop: 8,
  },
  writeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    backgroundColor: Colors.primaryFaint,
  },
  writeBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.primary },

  settingsGroup: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  settingsTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
  settingsValue: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
  },
  settingsDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 44 },

  storageNote: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 12,
    paddingHorizontal: 16,
  },

  footerText: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textFaint,
    letterSpacing: 0.4,
    marginTop: 12,
    marginBottom: 4,
  },
});
