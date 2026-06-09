import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Local pilgrimage archive — stays on this phone only.
 *
 * Storage shape (v1):
 *   @girivalam/v1/walks      → Walk[]
 *   @girivalam/v1/moments    → Moment[]
 *   @girivalam/v1/stories    → Story[]
 *   @girivalam/v1/settings   → Settings
 *
 * Cloud backup is intentionally a separate (later) layer that reads from
 * these same keys and syncs them under a user identity, only if the
 * pilgrim opts in. Until then, everything here is device-local.
 */

const NS = "@girivalam/v1";
const K = {
  walks: `${NS}/walks`,
  moments: `${NS}/moments`,
  stories: `${NS}/stories`,
  settings: `${NS}/settings`,
  bookmarks: `${NS}/bookmarks`,
  innerNotes: `${NS}/inner-notes`,
  libraryProgress: `${NS}/library-progress`,
  recents: `${NS}/recents`,
  downloads: `${NS}/downloads`,
  visited: `${NS}/visited`,
  sadhana: `${NS}/sadhana`,
};

export type MomentKind = "photo" | "voice" | "note" | "feeling";

export interface Walk {
  id: string;
  startedAt: number; // ms epoch
  endedAt?: number;
  label?: string;    // e.g. "Pournami", "First walk"
  sankalpa?: string; // why the pilgrim is walking today
  silent?: boolean;  // walked in silent mode
}

export interface Moment {
  id: string;
  walkId: string;
  lingamIdx: number;
  lingamName: string;
  kind: MomentKind;
  savedAt: number;
  note?: string;
  uri?: string; // for photo moments — local image URI on device
}

export async function getMomentsForWalk(walkId: string): Promise<Moment[]> {
  const all = await getMoments();
  return all.filter((m) => m.walkId === walkId);
}

export interface Story {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  walksAtTime: number;
}

export interface Settings {
  language: "en" | "ta" | "hi";
  units: "km" | "mi";
  backupOptIn: boolean;
  firstOpenedAt: number;
  pilgrimName?: string;
}

const DEFAULT_SETTINGS: Settings = {
  language: "en",
  units: "km",
  backupOptIn: false,
  firstOpenedAt: Date.now(),
};

const ONBOARDED_KEY = `${NS}/onboarded`;
export async function hasOnboarded(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDED_KEY)) === "1";
  } catch {
    return false;
  }
}
export async function markOnboarded(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDED_KEY, "1");
  } catch {
    /* non-fatal */
  }
}

// ── Generic helpers ─────────────────────────────────────────────────────
async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Defensive array loader. Persisted data can be from an older app version,
// partially written, or corrupted. A non-array value here (or items that
// aren't objects) would crash any consumer that does [...list], .sort, .map,
// or item.field access during render. Always return a clean array of objects
// so a bad payload degrades to "empty" instead of crashing the whole app.
async function loadList<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is T => item != null && typeof item === "object"
    );
  } catch {
    return [];
  }
}

async function save<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// Per-key serial mutex so concurrent read-modify-write callers don't
// trample each other (AsyncStorage offers no transactions).
const chains: Record<string, Promise<unknown>> = {};
function withKeyLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = chains[key] ?? Promise.resolve();
  const next = prev.then(fn, fn);
  chains[key] = next.catch(() => undefined);
  return next;
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Walks ───────────────────────────────────────────────────────────────
export async function getWalks(): Promise<Walk[]> {
  return loadList<Walk>(K.walks);
}

export async function startWalk(label?: string): Promise<Walk> {
  return withKeyLock(K.walks, async () => {
    const walks = await getWalks();
    const w: Walk = { id: makeId("w"), startedAt: Date.now(), label };
    await save(K.walks, [...walks, w]);
    return w;
  });
}

export async function finishWalk(id: string): Promise<void> {
  return withKeyLock(K.walks, async () => {
    const walks = await getWalks();
    const next = walks.map((w) => (w.id === id ? { ...w, endedAt: Date.now() } : w));
    await save(K.walks, next);
  });
}

export async function updateWalk(id: string, patch: Partial<Walk>): Promise<void> {
  return withKeyLock(K.walks, async () => {
    const walks = await getWalks();
    const next = walks.map((w) => (w.id === id ? { ...w, ...patch } : w));
    await save(K.walks, next);
  });
}

export async function getWalk(id: string): Promise<Walk | undefined> {
  const walks = await getWalks();
  return walks.find((w) => w.id === id);
}

// ── Moments ─────────────────────────────────────────────────────────────
export async function getMoments(): Promise<Moment[]> {
  return loadList<Moment>(K.moments);
}

export async function addMoment(input: Omit<Moment, "id" | "savedAt">): Promise<Moment | null> {
  return withKeyLock(K.moments, async () => {
    const moments = await getMoments();
    // Idempotency: same walk + lingam + kind = one marker. A pilgrim tapping
    // "Photo" twice at the same lingam shouldn't create a duplicate entry.
    const dup = moments.find(
      (m) => m.walkId === input.walkId && m.lingamIdx === input.lingamIdx && m.kind === input.kind
    );
    if (dup) return null;
    const m: Moment = { ...input, id: makeId("m"), savedAt: Date.now() };
    await save(K.moments, [...moments, m]);
    return m;
  });
}

// ── Stories ─────────────────────────────────────────────────────────────
export async function getStories(): Promise<Story[]> {
  return loadList<Story>(K.stories);
}

export async function addStory(input: Omit<Story, "id" | "createdAt">): Promise<Story> {
  return withKeyLock(K.stories, async () => {
    const stories = await getStories();
    const s: Story = { ...input, id: makeId("s"), createdAt: Date.now() };
    await save(K.stories, [...stories, s]);
    return s;
  });
}

// ── Bookmarks (sacred spots saved by the pilgrim) ───────────────────────
export interface Bookmark {
  id: string;
  lat: number;
  lng: number;
  note: string;
  createdAt: number;
}

export async function getBookmarks(): Promise<Bookmark[]> {
  return loadList<Bookmark>(K.bookmarks);
}

export async function addBookmark(input: Omit<Bookmark, "id" | "createdAt">): Promise<Bookmark> {
  return withKeyLock(K.bookmarks, async () => {
    const list = await getBookmarks();
    const b: Bookmark = { ...input, id: makeId("b"), createdAt: Date.now() };
    await save(K.bookmarks, [...list, b]);
    return b;
  });
}

export async function removeBookmark(id: string): Promise<void> {
  return withKeyLock(K.bookmarks, async () => {
    const list = await getBookmarks();
    await save(K.bookmarks, list.filter((b) => b.id !== id));
  });
}

// ── Inner Notes (Wisdom pillar journaling) ──────────────────────────────
export interface InnerNote {
  id: string;
  body: string;
  source?: string;   // e.g. book or teaching that prompted the reflection
  feeling?: string;  // optional emotion tag
  createdAt: number;
}

export async function getInnerNotes(): Promise<InnerNote[]> {
  const list = await loadList<InnerNote>(K.innerNotes);
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

export async function addInnerNote(input: Omit<InnerNote, "id" | "createdAt">): Promise<InnerNote> {
  return withKeyLock(K.innerNotes, async () => {
    const list = await loadList<InnerNote>(K.innerNotes);
    const n: InnerNote = { ...input, id: makeId("n"), createdAt: Date.now() };
    await save(K.innerNotes, [...list, n]);
    return n;
  });
}

export async function removeInnerNote(id: string): Promise<void> {
  return withKeyLock(K.innerNotes, async () => {
    const list = await loadList<InnerNote>(K.innerNotes);
    await save(K.innerNotes, list.filter((n) => n.id !== id));
  });
}

// ── Settings ────────────────────────────────────────────────────────────
export async function getSettings(): Promise<Settings> {
  const s = await load<Partial<Settings> | null>(K.settings, null);
  if (!s) {
    await save(K.settings, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return { ...DEFAULT_SETTINGS, ...s };
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  return withKeyLock(K.settings, async () => {
    const current = await getSettings();
    const next = { ...current, ...patch };
    await save(K.settings, next);
    return next;
  });
}

// ── Wisdom library: reading/listening progress, recents, downloads ──────
export type LibraryKind =
  | "book"
  | "audiobook"
  | "teaching"
  | "story"
  | "quote"
  | "video"
  | "chanting"
  | "article";

export interface LibraryProgress {
  id: string;            // stable content id
  title: string;
  kind: LibraryKind;
  mode: "read" | "listen";
  progress: number;      // 0..1
  position?: string;     // e.g. "Page 12" or "12:34"
  updatedAt: number;
}

export async function getLibraryProgress(): Promise<LibraryProgress[]> {
  const list = await loadList<LibraryProgress>(K.libraryProgress);
  return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function upsertLibraryProgress(
  input: Omit<LibraryProgress, "updatedAt">
): Promise<LibraryProgress> {
  return withKeyLock(K.libraryProgress, async () => {
    const list = await loadList<LibraryProgress>(K.libraryProgress);
    const entry: LibraryProgress = { ...input, updatedAt: Date.now() };
    const next = [entry, ...list.filter((p) => p.id !== input.id)];
    await save(K.libraryProgress, next);
    return entry;
  });
}

export async function getContinue(mode: "read" | "listen"): Promise<LibraryProgress[]> {
  const all = await getLibraryProgress();
  return all.filter((p) => p.mode === mode && p.progress < 1);
}

// ── Recently opened library items ───────────────────────────────────────
export interface RecentItem {
  id: string;
  title: string;
  kind: LibraryKind;
  openedAt: number;
}

export async function getRecentlyOpened(): Promise<RecentItem[]> {
  const list = await loadList<RecentItem>(K.recents);
  return [...list].sort((a, b) => b.openedAt - a.openedAt);
}

export async function recordOpened(input: Omit<RecentItem, "openedAt">): Promise<void> {
  return withKeyLock(K.recents, async () => {
    const list = await loadList<RecentItem>(K.recents);
    const entry: RecentItem = { ...input, openedAt: Date.now() };
    const next = [entry, ...list.filter((r) => r.id !== input.id)].slice(0, 30);
    await save(K.recents, next);
  });
}

// ── Downloads (offline library + maps) ──────────────────────────────────
export interface DownloadItem {
  id: string;
  title: string;
  kind: LibraryKind | "map";
  sizeLabel?: string;
  downloadedAt: number;
}

export async function getDownloads(): Promise<DownloadItem[]> {
  const list = await loadList<DownloadItem>(K.downloads);
  return [...list].sort((a, b) => b.downloadedAt - a.downloadedAt);
}

export async function addDownload(input: Omit<DownloadItem, "downloadedAt">): Promise<DownloadItem> {
  return withKeyLock(K.downloads, async () => {
    const list = await loadList<DownloadItem>(K.downloads);
    const entry: DownloadItem = { ...input, downloadedAt: Date.now() };
    const next = [entry, ...list.filter((d) => d.id !== input.id)];
    await save(K.downloads, next);
    return entry;
  });
}

export async function removeDownload(id: string): Promise<void> {
  return withKeyLock(K.downloads, async () => {
    const list = await loadList<DownloadItem>(K.downloads);
    await save(K.downloads, list.filter((d) => d.id !== id));
  });
}

export async function isDownloaded(id: string): Promise<boolean> {
  const list = await getDownloads();
  return list.some((d) => d.id === id);
}

// ── Visited sacred points (Map flow geofence sheet) ─────────────────────
export interface VisitedPoint {
  key: string;   // stable point identifier (e.g. lingam index or stop title)
  name: string;
  visitedAt: number;
}

export async function getVisitedPoints(): Promise<VisitedPoint[]> {
  const list = await loadList<VisitedPoint>(K.visited);
  return [...list].sort((a, b) => b.visitedAt - a.visitedAt);
}

export async function isVisited(key: string): Promise<boolean> {
  const list = await getVisitedPoints();
  return list.some((v) => v.key === key);
}

export async function markVisited(key: string, name: string): Promise<VisitedPoint> {
  return withKeyLock(K.visited, async () => {
    const list = await loadList<VisitedPoint>(K.visited);
    const existing = list.find((v) => v.key === key);
    if (existing) return existing;
    const entry: VisitedPoint = { key, name, visitedAt: Date.now() };
    await save(K.visited, [...list, entry]);
    return entry;
  });
}

export async function unmarkVisited(key: string): Promise<void> {
  return withKeyLock(K.visited, async () => {
    const list = await loadList<VisitedPoint>(K.visited);
    await save(K.visited, list.filter((v) => v.key !== key));
  });
}

// ── Sadhana log ─────────────────────────────────────────────────────────
export interface SadhanaDay {
  date: string;   // "YYYY-MM-DD"
  malas: number;  // japa malas completed that day
  practiced: boolean;
}

export interface SadhanaData {
  log: Record<string, SadhanaDay>; // keyed by "YYYY-MM-DD"
  totalMalas: number;
}

const DEFAULT_SADHANA: SadhanaData = { log: {}, totalMalas: 0 };

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function getSadhanaData(): Promise<SadhanaData> {
  return load<SadhanaData>(K.sadhana, DEFAULT_SADHANA);
}

export async function markSadhanaPracticed(): Promise<SadhanaData> {
  return withKeyLock(K.sadhana, async () => {
    const data = await load<SadhanaData>(K.sadhana, DEFAULT_SADHANA);
    const key = todayKey();
    const day: SadhanaDay = data.log[key] ?? { date: key, malas: 0, practiced: false };
    const next: SadhanaData = {
      ...data,
      log: { ...data.log, [key]: { ...day, practiced: true } },
    };
    await save(K.sadhana, next);
    return next;
  });
}

export async function addJapaMala(): Promise<SadhanaData> {
  return withKeyLock(K.sadhana, async () => {
    const data = await load<SadhanaData>(K.sadhana, DEFAULT_SADHANA);
    const key = todayKey();
    const day: SadhanaDay = data.log[key] ?? { date: key, malas: 0, practiced: false };
    const next: SadhanaData = {
      totalMalas: data.totalMalas + 1,
      log: { ...data.log, [key]: { ...day, malas: day.malas + 1, practiced: true } },
    };
    await save(K.sadhana, next);
    return next;
  });
}

export function getSadhanaStreak(data: SadhanaData): number {
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let i = 0; i < 366; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (data.log[key]?.practiced) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

// ── Wipe everything ─────────────────────────────────────────────────────
export async function clearAllPilgrimageData(): Promise<void> {
  await AsyncStorage.multiRemove([
    K.walks,
    K.moments,
    K.stories,
    K.settings,
    K.bookmarks,
    K.innerNotes,
    K.libraryProgress,
    K.recents,
    K.downloads,
    K.visited,
  ]);
}

// ── Derived stats ───────────────────────────────────────────────────────
export interface Stats {
  walks: number;
  distanceKm: number;
  malas: number;
  pournamis: number;
  firstWalkAt?: number;
  totalMoments: number;
}

export interface WalkProgress {
  completedWalks: number;
  currentStreak: number; // consecutive calendar months ending now with ≥1 completed walk
}

export async function getWalkProgress(now: Date = new Date()): Promise<WalkProgress> {
  const walks = await getWalks();
  const completed = walks.filter((w) => w.endedAt != null);
  if (completed.length === 0) return { completedWalks: 0, currentStreak: 0 };

  // Set of "YYYY-M" keys for months in which a walk was completed.
  // Bucket by endedAt (when the walk was finished), not startedAt — a walk
  // that crosses midnight at month-end should count toward the finishing month.
  const monthKeys = new Set<string>();
  for (const w of completed) {
    const d = new Date(w.endedAt!);
    monthKeys.add(`${d.getFullYear()}-${d.getMonth()}`);
  }

  // Walk backward from the current month while each month is present.
  let streak = 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), 1);
  while (monthKeys.has(`${cursor.getFullYear()}-${cursor.getMonth()}`)) {
    streak += 1;
    cursor.setMonth(cursor.getMonth() - 1);
  }

  return { completedWalks: completed.length, currentStreak: streak };
}

export async function getStats(): Promise<Stats> {
  const [walks, moments] = await Promise.all([getWalks(), getMoments()]);
  const completed = walks.filter((w) => w.endedAt != null);
  const pournamis = walks.filter((w) => w.label?.toLowerCase().includes("pournami")).length;
  return {
    walks: walks.length,
    distanceKm: completed.length * 14,
    malas: 0, // wired when japa persistence lands
    pournamis,
    firstWalkAt: walks[0]?.startedAt,
    totalMoments: moments.length,
  };
}
