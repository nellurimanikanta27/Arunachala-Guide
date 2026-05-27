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
  return load<Walk[]>(K.walks, []);
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
  return load<Moment[]>(K.moments, []);
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
  return load<Story[]>(K.stories, []);
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
  return load<Bookmark[]>(K.bookmarks, []);
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
  const list = await load<InnerNote[]>(K.innerNotes, []);
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

export async function addInnerNote(input: Omit<InnerNote, "id" | "createdAt">): Promise<InnerNote> {
  return withKeyLock(K.innerNotes, async () => {
    const list = await load<InnerNote[]>(K.innerNotes, []);
    const n: InnerNote = { ...input, id: makeId("n"), createdAt: Date.now() };
    await save(K.innerNotes, [...list, n]);
    return n;
  });
}

export async function removeInnerNote(id: string): Promise<void> {
  return withKeyLock(K.innerNotes, async () => {
    const list = await load<InnerNote[]>(K.innerNotes, []);
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

// ── Wipe everything ─────────────────────────────────────────────────────
export async function clearAllPilgrimageData(): Promise<void> {
  await AsyncStorage.multiRemove([K.walks, K.moments, K.stories, K.settings, K.bookmarks, K.innerNotes]);
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
