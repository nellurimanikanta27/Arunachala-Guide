import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenBadge from "@/components/ScreenBadge";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Modal,
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
  getContinue,
  getDownloads,
  getMoments,
  getSettings,
  getStats,
  getStories,
  getWalks,
  removeDownload,
  type DownloadItem,
  type LibraryProgress,
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

function formatDuration(ms: number): string {
  const mins = Math.max(1, Math.round(ms / 60000));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
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
  const meta = KIND_META[moment.kind] ?? KIND_META.note;
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
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const [loaded, setLoaded] = useState(false);
  const [walks, setWalks] = useState<Walk[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [continueRead, setContinueRead] = useState<LibraryProgress[]>([]);
  const [continueListen, setContinueListen] = useState<LibraryProgress[]>([]);
  const [photoPreview, setPhotoPreview] = useState<Moment | null>(null);

  const reload = useCallback(async () => {
    const [w, m, s, st, statsData, dl, cr, cl] = await Promise.all([
      getWalks(),
      getMoments(),
      getStories(),
      getSettings(),
      getStats(),
      getDownloads(),
      getContinue("read"),
      getContinue("listen"),
    ]);
    setWalks(w);
    setMoments(m);
    setStories(s);
    setSettings(st);
    setStats(statsData);
    setDownloads(dl);
    setContinueRead(cr);
    setContinueListen(cl);
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

  async function handleRemoveDownload(item: DownloadItem) {
    Alert.alert(
      "Remove download?",
      `"${item.title}" will no longer be available offline. You can download it again later.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removeDownload(item.id);
            setDownloads(await getDownloads());
          },
        },
      ]
    );
  }

  // Photos captured at the lingams (Camera Roll)
  const photoMoments = moments
    .filter((m) => m.kind === "photo" && !!m.uri)
    .sort((a, b) => b.savedAt - a.savedAt);

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
      <ScreenBadge n={8} label="My Pilgrimage" />
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

        {/* ── WALK HISTORY ────────────────────────────────── */}
        {walks.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>WALKS</Text>
            {[...walks]
              .sort((a, b) => b.startedAt - a.startedAt)
              .map((w) => {
                const momentCount = moments.filter((m) => m.walkId === w.id).length;
                const ongoing = w.endedAt == null;
                return (
                  <View key={w.id} style={styles.walkHistoryCard}>
                    <View style={styles.walkHistoryHead}>
                      <Text style={styles.walkHistoryDate}>{formatDate(w.startedAt)}</Text>
                      <Text style={styles.walkHistoryTime}>{formatTime(w.startedAt)}</Text>
                    </View>
                    <View style={styles.walkHistoryMetaRow}>
                      <View style={styles.walkHistoryMetaItem}>
                        <Ionicons name="time-outline" size={12} color={Colors.textLight} />
                        <Text style={styles.walkHistoryMetaText}>
                          {ongoing
                            ? "In progress"
                            : w.endedAt
                              ? formatDuration(w.endedAt - w.startedAt)
                              : "—"}
                        </Text>
                      </View>
                      {w.silent ? (
                        <View style={styles.walkHistoryMetaItem}>
                          <Ionicons name="moon-outline" size={12} color={Colors.textLight} />
                          <Text style={styles.walkHistoryMetaText}>Silent</Text>
                        </View>
                      ) : null}
                      {w.label ? (
                        <View style={styles.walkHistoryMetaItem}>
                          <Ionicons name="bookmark-outline" size={12} color={Colors.textLight} />
                          <Text style={styles.walkHistoryMetaText}>{w.label}</Text>
                        </View>
                      ) : null}
                      <View style={styles.walkHistoryMetaItem}>
                        <Ionicons name="ellipse" size={6} color={Colors.primary} />
                        <Text style={styles.walkHistoryMetaText}>
                          {momentCount} moment{momentCount === 1 ? "" : "s"}
                        </Text>
                      </View>
                    </View>
                    {w.sankalpa ? (
                      <Text style={styles.walkHistorySankalpa}>"{w.sankalpa}"</Text>
                    ) : null}
                  </View>
                );
              })}
          </>
        )}

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

        {/* ── CAMERA ROLL ─────────────────────────────────── */}
        <Text style={styles.sectionLabel}>CAMERA ROLL</Text>
        {photoMoments.length === 0 ? (
          <View style={styles.subEmptyCard}>
            <Ionicons name="images-outline" size={22} color={Colors.textFaint} />
            <Text style={styles.subEmptyText}>
              Photos you capture at the lingams will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.photoGrid}>
            {photoMoments.map((m) => (
              <Pressable
                key={m.id}
                style={styles.photoCell}
                onPress={() => setPhotoPreview(m)}
                accessibilityRole="imagebutton"
                accessibilityLabel={`Photo at ${m.lingamName}`}
              >
                <Image
                  source={{ uri: m.uri }}
                  style={styles.photoThumb}
                  contentFit="cover"
                  transition={150}
                />
                <Text style={styles.photoCaption} numberOfLines={1}>
                  {m.lingamName}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* ── CONTINUE READING / LISTENING ────────────────── */}
        {(continueRead.length > 0 || continueListen.length > 0) && (
          <>
            <Text style={styles.sectionLabel}>CONTINUE</Text>
            {continueRead.map((p) => (
              <Pressable
                key={`read-${p.id}`}
                style={styles.continueCard}
                onPress={() => router.push("/(tabs)/history")}
                accessibilityRole="button"
                accessibilityLabel={`Continue reading ${p.title}`}
              >
                <View style={styles.continueIcon}>
                  <Ionicons name="book-outline" size={16} color={Colors.primary} />
                </View>
                <View style={styles.continueBody}>
                  <Text style={styles.continueKicker}>Continue reading</Text>
                  <Text style={styles.continueTitle} numberOfLines={1}>
                    {p.title}
                  </Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.round(Math.min(1, Math.max(0, p.progress)) * 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.continueMeta}>
                    {p.position ? `${p.position} · ` : ""}
                    {Math.round(Math.min(1, Math.max(0, p.progress)) * 100)}%
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
              </Pressable>
            ))}
            {continueListen.map((p) => (
              <Pressable
                key={`listen-${p.id}`}
                style={styles.continueCard}
                onPress={() => router.push("/(tabs)/history")}
                accessibilityRole="button"
                accessibilityLabel={`Continue listening ${p.title}`}
              >
                <View style={styles.continueIcon}>
                  <Ionicons name="headset-outline" size={16} color={Colors.primary} />
                </View>
                <View style={styles.continueBody}>
                  <Text style={styles.continueKicker}>Continue listening</Text>
                  <Text style={styles.continueTitle} numberOfLines={1}>
                    {p.title}
                  </Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.round(Math.min(1, Math.max(0, p.progress)) * 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.continueMeta}>
                    {p.position ? `${p.position} · ` : ""}
                    {Math.round(Math.min(1, Math.max(0, p.progress)) * 100)}%
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textFaint} />
              </Pressable>
            ))}
          </>
        )}

        {/* ── DOWNLOADS ───────────────────────────────────── */}
        <Text style={styles.sectionLabel}>DOWNLOADS</Text>
        {downloads.length === 0 ? (
          <View style={styles.subEmptyCard}>
            <Ionicons name="cloud-offline-outline" size={22} color={Colors.textFaint} />
            <Text style={styles.subEmptyText}>No offline downloads yet.</Text>
          </View>
        ) : (
          <View style={styles.settingsGroup}>
            {downloads.map((d, i) => (
              <View key={d.id}>
                {i > 0 ? <View style={styles.settingsDivider} /> : null}
                <View style={styles.downloadRow}>
                  <Ionicons
                    name={d.kind === "map" ? "map-outline" : "document-text-outline"}
                    size={18}
                    color={Colors.textMid}
                  />
                  <View style={styles.downloadBody}>
                    <Text style={styles.downloadTitle} numberOfLines={1}>
                      {d.title}
                    </Text>
                    <Text style={styles.downloadMeta}>
                      {d.kind}
                      {d.sizeLabel ? ` · ${d.sizeLabel}` : ""}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleRemoveDownload(d)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove download ${d.title}`}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.primary} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
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
              <Text style={styles.storyExcerpt}>{(s.body ?? "").slice(0, 180)}</Text>
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

      <Modal
        visible={photoPreview != null}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoPreview(null)}
      >
        <Pressable style={styles.previewBackdrop} onPress={() => setPhotoPreview(null)}>
          <Pressable
            style={styles.previewClose}
            onPress={() => setPhotoPreview(null)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close photo"
          >
            <Ionicons name="close" size={26} color={Colors.white} />
          </Pressable>
          {photoPreview?.uri ? (
            <Image
              source={{ uri: photoPreview.uri }}
              style={styles.previewImage}
              contentFit="contain"
              transition={150}
            />
          ) : null}
          {photoPreview ? (
            <View style={styles.previewCaptionWrap}>
              <Text style={styles.previewCaptionTitle}>{photoPreview.lingamName}</Text>
              <Text style={styles.previewCaptionMeta}>
                {formatDate(photoPreview.savedAt)} · {formatTime(photoPreview.savedAt)}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </Modal>
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

  walkHistoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 6,
  },
  walkHistoryHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  walkHistoryDate: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  walkHistoryTime: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textFaint },
  walkHistoryMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },
  walkHistoryMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  walkHistoryMetaText: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textLight },
  walkHistorySankalpa: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMid,
    fontStyle: "italic",
    marginTop: 8,
    lineHeight: 17,
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

  subEmptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    gap: 8,
  },
  subEmptyText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 18,
  },

  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  photoCell: {
    width: "31.5%",
  },
  photoThumb: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  photoCaption: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.textLight,
    marginTop: 4,
  },

  continueCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  continueIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBody: { flex: 1 },
  continueKicker: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: Colors.textFaint,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  continueTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginBottom: 6,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  continueMeta: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    marginTop: 4,
  },

  downloadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  downloadBody: { flex: 1 },
  downloadTitle: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.text,
  },
  downloadMeta: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    marginTop: 2,
    textTransform: "capitalize",
  },

  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  previewClose: {
    position: "absolute",
    top: 48,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  previewImage: {
    width: "100%",
    height: "75%",
  },
  previewCaptionWrap: {
    position: "absolute",
    bottom: 56,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  previewCaptionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  previewCaptionMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
});
