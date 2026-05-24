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
}

const DEFAULT_SETTINGS: Settings = {
  language: "en",
  units: "km",
  backupOptIn: false,
  firstOpenedAt: Date.now(),
};

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
  await AsyncStorage.multiRemove([K.walks, K.moments, K.stories, K.settings]);
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
