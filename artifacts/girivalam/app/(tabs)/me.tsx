import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
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

type MomentKind = "photo" | "voice" | "note" | "feeling";

interface SavedMoment {
  walkId: string;
  walkDate: string;
  walkLabel: string;
  lingamName: string;
  time: string;
  kind: MomentKind;
  excerpt: string;
}

interface Story {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  walks: number;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

const KIND_META: Record<MomentKind, { icon: string; label: string }> = {
  photo: { icon: "📷", label: "Photo" },
  voice: { icon: "🎙️", label: "Voice note" },
  note: { icon: "✍️", label: "Note" },
  feeling: { icon: "❤️", label: "Feeling" },
};

const SAMPLE_MOMENTS: SavedMoment[] = [
  {
    walkId: "w3",
    walkDate: "23 May 2026",
    walkLabel: "Pournami 🌕",
    lingamName: "Indra Lingam",
    time: "5:42 AM",
    kind: "voice",
    excerpt: "Started in the dark. Cool air. A dog walked with me for the first 100 m.",
  },
  {
    walkId: "w3",
    walkDate: "23 May 2026",
    walkLabel: "Pournami 🌕",
    lingamName: "Agni Lingam",
    time: "6:38 AM",
    kind: "feeling",
    excerpt: "Sat for 8 minutes. Wanted to burn away the impatience.",
  },
  {
    walkId: "w3",
    walkDate: "23 May 2026",
    walkLabel: "Pournami 🌕",
    lingamName: "Yama Lingam",
    time: "7:21 AM",
    kind: "photo",
    excerpt: "Sunrise hit just as I arrived.",
  },
  {
    walkId: "w2",
    walkDate: "23 Apr 2026",
    walkLabel: "Pournami 🌕",
    lingamName: "Varuna Lingam",
    time: "6:14 PM",
    kind: "note",
    excerpt: "Sunset over the tank. The hill turned copper.",
  },
  {
    walkId: "w1",
    walkDate: "24 Mar 2026",
    walkLabel: "First walk",
    lingamName: "Indra Lingam",
    time: "5:10 AM",
    kind: "note",
    excerpt: "First time. Nervous about the distance, but my mother said just keep walking.",
  },
];

const SAMPLE_STORIES: Story[] = [
  {
    id: "s1",
    date: "23 May 2026",
    title: "What stayed with me from this Pournami",
    excerpt:
      "I came in heavy and walked out lighter. Somewhere between Agni and Yama the chatter in my head got quiet — not gone, just quiet — and I noticed the sound my own feet were making for the first time.",
    walks: 3,
  },
];

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MomentRow({ moment, isLast }: { moment: SavedMoment; isLast: boolean }) {
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
          <Text style={styles.momentTime}>{moment.time}</Text>
        </View>
        <Text style={styles.momentExcerpt}>"{moment.excerpt}"</Text>
        <View style={styles.momentTagRow}>
          <Text style={styles.momentTag}>
            {meta.icon} {meta.label}
          </Text>
          <Text style={styles.momentTagFaint}>· {moment.walkDate}</Text>
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

  // Group moments by walk
  const momentsByWalk = SAMPLE_MOMENTS.reduce<
    Record<string, { date: string; label: string; items: SavedMoment[] }>
  >((acc, m) => {
    if (!acc[m.walkId]) acc[m.walkId] = { date: m.walkDate, label: m.walkLabel, items: [] };
    acc[m.walkId].items.push(m);
    return acc;
  }, {});
  const walkIds = Object.keys(momentsByWalk);

  const totalWalks = walkIds.length;
  const totalKm = totalWalks * 14;
  const totalMoments = SAMPLE_MOMENTS.length;

  function comingSoon(what: string, body: string) {
    Alert.alert(what, body);
  }

  function confirmClear() {
    Alert.alert(
      "Clear all pilgrimage data?",
      "This will remove every saved moment, story, and walk from this device. There is no cloud backup — this cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear everything",
          style: "destructive",
          onPress: () =>
            Alert.alert(
              "Coming soon",
              "Local data clearing is being wired to storage in the next pass."
            ),
        },
      ]
    );
  }

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
          <Ionicons name="lock-closed" size={10} color="rgba(255,255,255,0.7)" />
          <Text style={styles.privacyPillText}>Stays on this phone · no account</Text>
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
            <StatBlock value={String(totalWalks)} label="Walks" />
            <View style={styles.statDivider} />
            <StatBlock value={`${totalKm} km`} label="Distance" />
            <View style={styles.statDivider} />
            <StatBlock value="3" label="Malas" />
            <View style={styles.statDivider} />
            <StatBlock value="2" label="Pournamis" />
          </View>
          <View style={styles.statsFootDivider} />
          <Text style={styles.statsFoot}>
            {totalMoments} moments saved · since 24 March 2026
          </Text>
        </View>

        {/* ── ON THIS DAY ─────────────────────────────────── */}
        <View style={styles.onThisDayCard}>
          <Text style={styles.sectionLabelInline}>FROM AN EARLIER WALK</Text>
          <Text style={styles.onThisDayText}>
            Last Pournami you sat at Varuna Lingam at sunset and wrote "the hill turned copper."
          </Text>
          <Pressable
            onPress={() => comingSoon("On this day", "Reading past entries will open in the next pass.")}
            accessibilityRole="button"
            accessibilityLabel="Read what you wrote"
          >
            <Text style={styles.onThisDayLink}>Read what you wrote →</Text>
          </Pressable>
        </View>

        {/* ── TIMELINE ────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>MOMENTS</Text>
        {walkIds.map((wid) => {
          const walk = momentsByWalk[wid];
          return (
            <View key={wid} style={styles.walkCard}>
              <View style={styles.walkHead}>
                <Text style={styles.walkDate}>{walk.date}</Text>
                <Text style={styles.walkLabel}>{walk.label}</Text>
              </View>
              <View style={styles.walkBody}>
                {walk.items.map((m, i) => (
                  <MomentRow key={i} moment={m} isLast={i === walk.items.length - 1} />
                ))}
              </View>
            </View>
          );
        })}

        {/* ── STORIES ─────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>REFLECTIONS</Text>
        {SAMPLE_STORIES.map((s) => (
          <Pressable
            key={s.id}
            style={styles.storyCard}
            onPress={() =>
              comingSoon(
                s.title,
                "Full reflections will open in the next pass — for now this is a preview of what your archive will look like."
              )
            }
            accessibilityRole="button"
            accessibilityLabel={s.title}
          >
            <Text style={styles.storyDate}>{s.date} · after {ordinal(s.walks)} walk</Text>
            <Text style={styles.storyTitle}>{s.title}</Text>
            <Text style={styles.storyExcerpt}>{s.excerpt}</Text>
            <Text style={styles.storyMore}>Read more →</Text>
          </Pressable>
        ))}
        <Pressable
          style={styles.writeBtn}
          onPress={() =>
            comingSoon(
              "Write a reflection",
              "Longer reflections you write after a walk will live here. The editor is being added in the next pass."
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
            icon="language-outline"
            title="Language"
            value="English"
            onPress={() => comingSoon("Language", "Tamil and Hindi are being added in the next pass.")}
          />
          <View style={styles.settingsDivider} />
          <SettingsRow
            icon="speedometer-outline"
            title="Units"
            value="Kilometres"
            onPress={() => comingSoon("Units", "Switching to miles is being added in the next pass.")}
          />
          <View style={styles.settingsDivider} />
          <SettingsRow
            icon="location-outline"
            title="Location permission"
            value="While using app"
            onPress={() =>
              comingSoon(
                "Location permission",
                "This will open the system settings in the next pass. Location is only used while you walk and is never sent off your phone."
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

        <Text style={styles.footerText}>ॐ नमः शिवाय · Arunachala Shiva</Text>
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

  // ── Stats
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
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
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

  // ── On this day
  onThisDayCard: {
    backgroundColor: Colors.amberFaint,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(196,122,30,0.20)",
    marginTop: 4,
  },
  sectionLabelInline: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.amber,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  onThisDayText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textMid,
    lineHeight: 19,
    fontStyle: "italic",
  },
  onThisDayLink: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
    marginTop: 8,
  },

  // ── Section label (matches index)
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textFaint,
    letterSpacing: 1.5,
    marginLeft: 2,
    marginTop: 14,
    marginBottom: 2,
  },

  // ── Walks (timeline)
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
  walkDate: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textMid,
  },
  walkLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
  },
  walkBody: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },

  momentRow: { flexDirection: "row", gap: 10 },
  momentRail: { alignItems: "center", paddingTop: 4, width: 14 },
  momentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  momentLine: {
    width: 1,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 2,
  },
  momentBody: { flex: 1, paddingBottom: 12 },
  momentHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  momentLingam: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
  },
  momentTime: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textFaint,
  },
  momentExcerpt: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMid,
    fontStyle: "italic",
    lineHeight: 17,
  },
  momentTagRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  momentTag: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  momentTagFaint: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textFaint,
    marginLeft: 4,
  },

  // ── Stories
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
  writeBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },

  // ── Settings
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
  settingsDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 44,
  },

  footerText: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textFaint,
    letterSpacing: 0.4,
    marginTop: 16,
    marginBottom: 4,
  },
});
