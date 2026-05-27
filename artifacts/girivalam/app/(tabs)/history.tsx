import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import {
  addInnerNote,
  getInnerNotes,
  removeInnerNote,
  type InnerNote,
} from "@/lib/pilgrimage-store";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Temple parchment palette — sandstone walls, brass lamps, ghee light ───
const W = {
  bg: "#FBF1DC",                          // warm parchment / temple wall
  bgSoft: "#F5E6C4",                      // deeper cream, like turmeric-stained cloth
  card: "#FFFAEC",                        // ghee-lamp glow
  cardBorder: "rgba(155, 92, 20, 0.22)",  // dark brass outline
  gold: "#9B5C14",                        // burnished brass (readable on cream)
  goldLight: "#B8761C",                   // brighter brass for accents
  goldFaint: "rgba(196, 122, 30, 0.10)",  // soft saffron wash
  text: "#3D1F08",                        // sandalwood-dark sacred ink
  textMid: "#6B3A14",                     // ochre brown
  textFaint: "#A07A50",                   // faded copper
  accent: "#C8501C",                      // sindoor / kumkum red-orange
};

// ── Content seeds ──────────────────────────────────────────────────────────
const DAILY_QUOTES = [
  { q: "Your own Self-realization is the greatest service you can render the world.", a: "Ramana Maharshi" },
  { q: "Silence is also conversation.", a: "Ramana Maharshi" },
  { q: "Happiness is your nature. It is not wrong to desire it. What is wrong is seeking it outside.", a: "Ramana Maharshi" },
  { q: "The mind is a bundle of thoughts. The thoughts arise because there is the thinker. The thinker is the ego.", a: "Ramana Maharshi" },
  { q: "Wanting to reform the world without discovering one's true self is like trying to cover the world with leather to avoid the pain of walking on stones and thorns.", a: "Ramana Maharshi" },
  { q: "There is no greater mystery than this: being Reality ourselves, we seek to gain Reality.", a: "Ramana Maharshi" },
  { q: "Arunachala is truly the holy place. Of all holy places it is the most sacred.", a: "Ramana Maharshi" },
];

const DAILY_QUESTIONS = [
  "Who is the one that is reading this?",
  "Where do thoughts arise from?",
  "What remains when the mind is silent?",
  "Who is aware of your breathing right now?",
  "What is it that does not change in you?",
  "If you are not your thoughts, who are you?",
  "Who would you be without your story?",
];

const DAILY_PRACTICES = [
  "Sit for 5 minutes. Whenever a thought arises, gently ask: 'To whom does this thought come?'",
  "Walk slowly for 10 minutes. With every step, silently chant: Arunachala Shiva.",
  "Before sleeping tonight, recall one moment of stillness from the day.",
  "Drink water mindfully — feel each sip. Notice the one who is drinking.",
  "Speak less today. In every silence, listen to what is underneath.",
];

const EMOTIONS: { key: string; label: string; teaching: string; passage: string }[] = [
  {
    key: "anxiety",
    label: "Anxiety",
    teaching: "Anxiety is the mind running ahead. The Self is always here.",
    passage:
      "Ramana said: 'The future is uncertain. The present is here. Stay with what is, not with what may come. Ask — to whom is this anxiety arising? Pursue that thread inward.'",
  },
  {
    key: "confusion",
    label: "Confusion",
    teaching: "Confusion ends when the mind stops trying to know and begins to be.",
    passage:
      "When confusion arises, drop the question for one breath. The clarity you seek is the silence underneath the question.",
  },
  {
    key: "fear",
    label: "Fear",
    teaching: "Fear is the shadow of the small self. The Self has nothing to fear.",
    passage:
      "Ask: 'Who is afraid?' Hold that question gently. The fear will not vanish at once, but you will see it is not who you are.",
  },
  {
    key: "loneliness",
    label: "Loneliness",
    teaching: "You are never alone. Arunachala is always here.",
    passage:
      "Even from a thousand miles away, simply turning the heart toward Arunachala is enough. The hill listens.",
  },
  {
    key: "overthinking",
    label: "Overthinking",
    teaching: "Thoughts are like clouds. The sky does not move.",
    passage:
      "Do not fight thoughts. Watch them. Ask: 'For whom do these thoughts arise?' Each enquiry is one step home.",
  },
  {
    key: "pain",
    label: "Emotional pain",
    teaching: "Pain met with awareness becomes the doorway to the heart.",
    passage:
      "Do not push pain away. Sit with it as a mother sits with a crying child. In time, the child becomes quiet.",
  },
  {
    key: "purpose",
    label: "Lack of purpose",
    teaching: "The deepest purpose is to know who you are.",
    passage:
      "Worldly purpose comes and goes. The purpose of life is to recognise the Self — that which is always present, always whole.",
  },
  {
    key: "peace",
    label: "Seeking peace",
    teaching: "Peace is not found. It is uncovered.",
    passage:
      "Peace is your own nature. Stop adding to the mind. What remains, untouched, is peace.",
  },
  {
    key: "curiosity",
    label: "Curiosity",
    teaching: "Curiosity turned inward becomes self-enquiry.",
    passage:
      "Take the same wonder you bring to the world and turn it on the one who wonders. There you will find the source.",
  },
  {
    key: "discovery",
    label: "Self-discovery",
    teaching: "You are not becoming someone. You are unbecoming everyone you are not.",
    passage:
      "Drop one identity at a time. What cannot be dropped — that is you.",
  },
];

const RAMANA_TIMELINE = [
  { year: "1879", title: "Birth in Tiruchuzhi", body: "Venkataraman Iyer was born on 30 December in Tamil Nadu. As a boy he was ordinary in studies but unusually deep in sleep — a quality the sages later said pointed to his future absorption in the Self." },
  { year: "1896", title: "The Death Experience at Age 16", body: "Sitting alone in his uncle's house in Madurai, a sudden fear of death gripped him. Instead of fleeing it, he investigated it: 'Who is the one that dies?' In that single enquiry, the small self fell away and the Self alone remained. He never came back from that moment." },
  { year: "1896", title: "Arrival at Arunachala", body: "Weeks later he left home with no money, journeyed to Tiruvannamalai, and walked straight into the temple. He never left the hill again. Arunachala had called, and he had come home." },
  { year: "1896 – 1922", title: "Caves of the Hill", body: "He lived in silence — first at Patala Lingam under the temple, then Virupaksha Cave, then Skandashram higher up the slope. Devotees gathered around him in stillness. He spoke rarely; his presence taught." },
  { year: "1922 – 1950", title: "Sri Ramanasramam", body: "After his mother attained mahasamadhi at his feet, the ashram formed around her shrine at the southern base of Arunachala. For 28 years he sat there, available to anyone, teaching one path: enquire 'Who am I?'" },
  { year: "1950", title: "Mahasamadhi", body: "On 14 April, as devotees wept, he reassured them: 'They say I am going away. But where can I go? I am here.' His body left; his presence at Arunachala remained, and remains." },
];

const LIBRARY = [
  { id: "wai", title: "Who Am I?", author: "Sri Ramana Maharshi", kind: "Core teaching", minutes: 12, summary: "The shortest and most direct of Bhagavan's teachings — written answers to a devotee's questions about Self-enquiry. The complete path in 30 pages." },
  { id: "us", title: "Upadesa Saram", author: "Sri Ramana Maharshi", kind: "Sacred verse", minutes: 8, summary: "Thirty verses on the essence of teaching. Action, devotion, knowledge, meditation, enquiry — all woven into the path back to the Heart." },
  { id: "talks", title: "Talks with Sri Ramana Maharshi", author: "Recorded by Munagala Venkataramiah", kind: "Daily dialogues", minutes: 0, summary: "Four years of conversations recorded at the ashram. Read one short talk a day — let it sit in you for a week." },
  { id: "fv", title: "Forty Verses on Reality", author: "Sri Ramana Maharshi", kind: "Philosophical verse", minutes: 20, summary: "Ulladu Narpadu — Bhagavan's own metaphysical poem on the nature of the Self, the world, and God. Slow reading, deep returns." },
  { id: "aks", title: "Aksharamanamalai", author: "Sri Ramana Maharshi", kind: "Devotional hymn", minutes: 25, summary: "The Marital Garland of Letters to Arunachala — 108 verses pouring out a child's longing for the Hill. Sing it. Don't just read." },
  { id: "letters", title: "Letters from Sri Ramanasramam", author: "Suri Nagamma", kind: "Memoir", minutes: 0, summary: "A devotee's letters home, capturing daily life at the ashram — the cows, the squirrels, the silent darshan. Wisdom through the everyday." },
  { id: "atb", title: "Be As You Are", author: "Edited by David Godman", kind: "Beginner-friendly", minutes: 0, summary: "The clearest modern introduction to Ramana's teaching. Organised by question, easy to dip in and out of." },
  { id: "muruganar", title: "Padamalai — Teachings of Sri Ramana", author: "Sri Muruganar", kind: "Devotee verse", minutes: 0, summary: "Bhagavan's closest poet-devotee captured thousands of his sayings in Tamil verse. Distilled and luminous." },
];

const MICRO_READS = [
  { id: "m1", title: "One Breath", body: "Take one breath, slowly. While you are breathing, you cannot also be your thoughts. That is the doorway." },
  { id: "m2", title: "The Witness", body: "Notice that you are aware. Now notice — you are aware of being aware. That noticing is the Self." },
  { id: "m3", title: "Surrender", body: "Surrender is not giving up. It is letting Arunachala carry what you were never meant to hold alone." },
  { id: "m4", title: "Stillness", body: "Stillness is not absence of movement. It is the unmoving ground in which movement appears." },
  { id: "m5", title: "Walking", body: "Each step on Girivalam is a prayer the feet make on behalf of the heart." },
  { id: "m6", title: "Silence", body: "Bhagavan's deepest teaching was silence. When you are quiet enough, you can still hear him." },
];

const ASK_QUESTIONS: { q: string; a: string }[] = [
  { q: "Why do I suffer?", a: "Suffering arises when the mind insists reality should be other than it is. Ramana said: 'Pain is the price of identifying with the body and mind. Find who suffers, and the sufferer disappears.'" },
  { q: "How do I stop overthinking?", a: "Don't try to stop thoughts — that only adds another thought. Instead ask: 'To whom do these thoughts come?' The mind quiets when its source is sought." },
  { q: "What is ego?", a: "Ego is the false 'I' that says 'I am this body, this name, this story.' It is a thought that pretends to be a person. Investigate it and it dissolves." },
  { q: "How do I find peace?", a: "Peace is not somewhere else. Peace is what remains when seeking stops. Ramana: 'Your own Self is peace. Why do you go in search of it?'" },
  { q: "What is self-enquiry?", a: "Self-enquiry is the practice of turning attention inward to its source. When any thought, feeling, or sensation arises, ask: 'Who is experiencing this?' Hold the question, don't answer it. The questioner is what you seek." },
  { q: "Who am I?", a: "Not the body, which changes. Not the mind, which sleeps. Not the thoughts, which come and go. What remains when all of these are set aside — that, Bhagavan said, is the answer. Find it for yourself." },
];

const ASHRAM_STORIES = [
  { id: "a1", icon: "moon" as const, title: "The Caves of Arunachala", body: "Patala Lingam, Virupaksha, Skandashram — three caves on the eastern slope where the young Ramana sat in silence for years. The rock still holds the warmth of his stillness. Pilgrims climb daily and sit where he sat." },
  { id: "a2", icon: "leaf" as const, title: "The Ashram Life", body: "At Sri Ramanasramam, the day begins before dawn with Vedaparayanam. There is no entry fee. Anyone may sit in the Old Hall where Bhagavan lived. The ashram feeds every visitor at noon — a tradition unbroken for nearly a century." },
  { id: "a3", icon: "flame" as const, title: "Karthigai Deepam", body: "Once a year, on the full moon of Karthigai, a great fire is lit on the summit of Arunachala. It burns for days, visible for miles. Ramana said it is Shiva himself, reminding the world he is the original column of light." },
  { id: "a4", icon: "footsteps" as const, title: "Why Pradakshina?", body: "Walking around the hill is the oldest sadhana of Arunachala. Ramana himself walked it many times. He said: 'Even unintentional Girivalam, done as exercise, purifies the mind. Done with awareness, it grants liberation.'" },
  { id: "a5", icon: "water" as const, title: "The Eight Lingams", body: "Around the 14 km path stand the eight directional lingams — Indra, Agni, Yama, Nirruti, Varuna, Vayu, Kubera, Ishanya. Each is a guardian of one direction, each a doorway to a different quality of the Self." },
  { id: "a6", icon: "musical-notes" as const, title: "The Silent Teachings", body: "Bhagavan's most powerful teaching was through silence. Visitors entered the hall agitated and left peaceful, without a word exchanged. The teaching, he said, is transmitted heart to heart — words are only the after-glow." },
];

const SACRED_AUDIO = [
  { id: "s1", icon: "musical-notes" as const, title: "Aksharamanamalai chanting", desc: "108 verses to Arunachala, traditional Tamil cadence", duration: "32 min" },
  { id: "s2", icon: "flame" as const, title: "Temple bells at sunrise", desc: "Arunachaleswarar Temple — first puja of the day", duration: "12 min" },
  { id: "s3", icon: "moon" as const, title: "Cave silence (Virupaksha)", desc: "Ambient stillness recorded inside Bhagavan's cave", duration: "45 min" },
  { id: "s4", icon: "leaf" as const, title: "Hill at dusk", desc: "Wind, distant temple bells, crickets near the base of Arunachala", duration: "28 min" },
  { id: "s5", icon: "water" as const, title: "Om Namah Shivaya — slow chant", desc: "For japa, mala practice, or background while reading", duration: "60 min" },
  { id: "s6", icon: "mic" as const, title: "Talks with Ramana — narrated", desc: "One conversation a day, gently read", duration: "8 min each" },
];

// ── Daily picker (deterministic per calendar day) ──────────────────────────
function dayIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}
function pickDaily<T>(arr: T[]): T {
  return arr[dayIndex() % arr.length];
}

// ── Sub-components ─────────────────────────────────────────────────────────
function GoldDivider() {
  return <View style={styles.divider} />;
}

function SectionHeader({ overline, title, sub }: { overline?: string; title: string; sub?: string }) {
  return (
    <View style={styles.sectionHeader}>
      {overline ? <Text style={styles.overline}>{overline}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
      {sub ? <Text style={styles.sectionSub}>{sub}</Text> : null}
    </View>
  );
}

function DailyWisdomCard() {
  const quote = useMemo(() => pickDaily(DAILY_QUOTES), []);
  const question = useMemo(() => pickDaily(DAILY_QUESTIONS), []);
  const practice = useMemo(() => pickDaily(DAILY_PRACTICES), []);
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroGlow} pointerEvents="none" />
      <Text style={styles.heroDate}>{today.toUpperCase()}</Text>
      <Text style={styles.heroQuote}>&ldquo;{quote.q}&rdquo;</Text>
      <Text style={styles.heroAttribution}>— {quote.a}</Text>

      <GoldDivider />

      <View style={styles.heroRow}>
        <Ionicons name="help-circle-outline" size={16} color={W.goldLight} />
        <Text style={styles.heroRowLabel}>QUESTION OF THE DAY</Text>
      </View>
      <Text style={styles.heroRowBody}>{question}</Text>

      <View style={[styles.heroRow, { marginTop: 16 }]}>
        <Ionicons name="leaf-outline" size={16} color={W.goldLight} />
        <Text style={styles.heroRowLabel}>TODAY&apos;S INNER PRACTICE</Text>
      </View>
      <Text style={styles.heroRowBody}>{practice}</Text>
    </View>
  );
}

function EmotionFinder() {
  const [selected, setSelected] = useState<string | null>(null);
  const teaching = useMemo(() => EMOTIONS.find((e) => e.key === selected) ?? null, [selected]);

  const choose = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelected((cur) => (cur === key ? null : key));
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>What are you feeling today?</Text>
      <Text style={styles.cardSub}>Tap one. A teaching will arise.</Text>

      <View style={styles.chipWrap}>
        {EMOTIONS.map((e) => {
          const active = e.key === selected;
          return (
            <Pressable
              key={e.key}
              onPress={() => choose(e.key)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{e.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {teaching ? (
        <View style={styles.teachingBox}>
          <Text style={styles.teachingHead}>{teaching.teaching}</Text>
          <Text style={styles.teachingBody}>{teaching.passage}</Text>
        </View>
      ) : null}
    </View>
  );
}

function TimelineRow({ item, isLast }: { item: typeof RAMANA_TIMELINE[0]; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };
  return (
    <Pressable style={styles.timelineRow} onPress={toggle} accessibilityRole="button">
      <View style={styles.timelineRail}>
        <View style={styles.timelineDot} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineYear}>{item.year}</Text>
        <Text style={styles.timelineTitle}>{item.title}</Text>
        {open ? <Text style={styles.timelineBody}>{item.body}</Text> : null}
      </View>
      <Ionicons name={open ? "chevron-up" : "chevron-down"} size={14} color={W.textFaint} />
    </Pressable>
  );
}

function BookRow({ book }: { book: typeof LIBRARY[0] }) {
  return (
    <View style={styles.bookRow}>
      <View style={styles.bookSpine}>
        <Text style={styles.bookSpineLetter}>{book.title[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.bookTitle}>{book.title}</Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>
        <Text style={styles.bookSummary}>{book.summary}</Text>
        <View style={styles.bookMetaRow}>
          <View style={styles.bookTag}>
            <Text style={styles.bookTagText}>{book.kind}</Text>
          </View>
          {book.minutes > 0 ? (
            <Text style={styles.bookMeta}>· {book.minutes} min read</Text>
          ) : (
            <Text style={styles.bookMeta}>· Dip in & out</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function MicroCard({ item }: { item: typeof MICRO_READS[0] }) {
  return (
    <View style={styles.microCard}>
      <Text style={styles.microTitle}>{item.title}</Text>
      <Text style={styles.microBody}>{item.body}</Text>
      <Text style={styles.microFooter}>2-MIN READ</Text>
    </View>
  );
}

function QARow({ item }: { item: typeof ASK_QUESTIONS[0] }) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };
  return (
    <Pressable style={styles.qaRow} onPress={toggle} accessibilityRole="button">
      <View style={styles.qaHeader}>
        <Ionicons name="help-circle-outline" size={18} color={W.goldLight} />
        <Text style={styles.qaQuestion}>{item.q}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={14} color={W.textFaint} />
      </View>
      {open ? <Text style={styles.qaAnswer}>{item.a}</Text> : null}
    </Pressable>
  );
}

function AudioRow({ item }: { item: typeof SACRED_AUDIO[0] }) {
  return (
    <View style={styles.audioRow}>
      <View style={styles.audioIconWrap}>
        <Ionicons name={item.icon} size={18} color={W.goldLight} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.audioTitle}>{item.title}</Text>
        <Text style={styles.audioDesc}>{item.desc}</Text>
      </View>
      <View style={styles.audioRight}>
        <Text style={styles.audioDuration}>{item.duration}</Text>
        <Ionicons name="play-circle" size={28} color={W.gold} />
      </View>
    </View>
  );
}

function AshramCard({ item }: { item: typeof ASHRAM_STORIES[0] }) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };
  return (
    <Pressable style={styles.ashramCard} onPress={toggle} accessibilityRole="button">
      <View style={styles.ashramHeader}>
        <View style={styles.ashramIconWrap}>
          <Ionicons name={item.icon} size={18} color={W.goldLight} />
        </View>
        <Text style={styles.ashramTitle}>{item.title}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={14} color={W.textFaint} />
      </View>
      {open ? <Text style={styles.ashramBody}>{item.body}</Text> : null}
    </Pressable>
  );
}

function InnerNotesSection() {
  const [notes, setNotes] = useState<InnerNote[]>([]);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const mountedRef = React.useRef(true);

  const refresh = useCallback(async () => {
    const list = await getInnerNotes();
    if (mountedRef.current) setNotes(list);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  const save = async () => {
    const body = draft.trim();
    if (!body || saving) return;
    setSaving(true);
    try {
      await addInnerNote({ body });
      setDraft("");
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await removeInnerNote(id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await refresh();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>My Inner Notes</Text>
      <Text style={styles.cardSub}>
        After a reading, write one realisation. These stay only on your device.
      </Text>

      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="One thing I noticed today…"
        placeholderTextColor={W.textFaint}
        style={styles.noteInput}
        multiline
      />
      <Pressable
        onPress={save}
        disabled={!draft.trim() || saving}
        style={[styles.noteSaveBtn, (!draft.trim() || saving) && { opacity: 0.4 }]}
        accessibilityRole="button"
      >
        <Ionicons name="bookmark" size={14} color={W.bg} />
        <Text style={styles.noteSaveText}>Save reflection</Text>
      </Pressable>

      {notes.length === 0 ? (
        <Text style={styles.notesEmpty}>No reflections yet. The first one is the hardest.</Text>
      ) : (
        <View style={{ marginTop: 16, gap: 10 }}>
          {notes.map((n) => (
            <View key={n.id} style={styles.noteRow}>
              <Text style={styles.noteBody}>{n.body}</Text>
              <View style={styles.noteFooter}>
                <Text style={styles.noteDate}>
                  {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </Text>
                <Pressable onPress={() => remove(n.id)} accessibilityRole="button" hitSlop={8}>
                  <Ionicons name="trash-outline" size={14} color={W.textFaint} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────
export default function WisdomScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.headerWrap}>
        <View style={styles.headerGlowOuter} pointerEvents="none" />
        <Text style={styles.headerOverline}>A SACRED DIGITAL ASHRAM</Text>
        <Text style={styles.headerTitle}>Wisdom</Text>
        <Text style={styles.headerSub}>
          Slow down. Read a little. Sit with it. Return tomorrow.
        </Text>
      </View>

      {/* 1. Daily Wisdom */}
      <DailyWisdomCard />

      {/* 2. Emotion finder */}
      <SectionHeader
        overline="A WISE COMPANION"
        title="The teaching for today's heart"
        sub="The app meets you where you are."
      />
      <EmotionFinder />

      {/* 3. Ramana Knowledge Space */}
      <SectionHeader
        overline="RAMANA MAHARSHI"
        title="The life that became the teaching"
        sub="A short cinematic timeline. Tap each moment."
      />
      <View style={styles.card}>
        {RAMANA_TIMELINE.map((item, idx) => (
          <TimelineRow key={item.year + item.title} item={item} isLast={idx === RAMANA_TIMELINE.length - 1} />
        ))}
      </View>

      {/* 4. Sacred Library */}
      <SectionHeader
        overline="DIGITAL SACRED LIBRARY"
        title="Books that change how you sit"
        sub="Start short. Re-read often."
      />
      <View style={[styles.card, { paddingVertical: 8 }]}>
        {LIBRARY.map((b, i) => (
          <View key={b.id}>
            <BookRow book={b} />
            {i < LIBRARY.length - 1 ? <View style={styles.bookSep} /> : null}
          </View>
        ))}
      </View>

      {/* 5. Micro-reads */}
      <SectionHeader
        overline="ONE INSIGHT TODAY"
        title="Micro-reads"
        sub="For days you have no time. Two minutes is enough."
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.microScroll}
      >
        {MICRO_READS.map((m) => (
          <MicroCard key={m.id} item={m} />
        ))}
      </ScrollView>

      {/* 6. Ask a question */}
      <SectionHeader
        overline="LIVE WISDOM"
        title="Ask a question"
        sub="The questions of every seeker. The answers from the silence."
      />
      <View style={[styles.card, { gap: 6 }]}>
        {ASK_QUESTIONS.map((qa) => (
          <QARow key={qa.q} item={qa} />
        ))}
      </View>

      {/* 7. Sacred Audio */}
      <SectionHeader
        overline="SACRED AUDIO"
        title="The sound of the hill"
        sub="Chanting, cave silence, temple bells. For reading, walking, or sleep."
      />
      <View style={[styles.card, { gap: 4 }]}>
        {SACRED_AUDIO.map((a, i) => (
          <View key={a.id}>
            <AudioRow item={a} />
            {i < SACRED_AUDIO.length - 1 ? <View style={styles.audioSep} /> : null}
          </View>
        ))}
        <Text style={styles.audioFootnote}>Audio playback arrives in the next update.</Text>
      </View>

      {/* 8. Digital Ashram */}
      <SectionHeader
        overline="DIGITAL ASHRAM"
        title="Stories from Arunachala"
        sub="The cave, the temple, the silent teaching."
      />
      <View style={[styles.card, { gap: 6 }]}>
        {ASHRAM_STORIES.map((s) => (
          <AshramCard key={s.id} item={s} />
        ))}
      </View>

      {/* 9. Inner notes / journaling */}
      <SectionHeader
        overline="REFLECTION & JOURNALING"
        title="My Inner Notes"
        sub="Wisdom becomes yours the moment you write it down."
      />
      <InnerNotesSection />

      {/* Closing */}
      <View style={styles.closingWrap}>
        <MaterialCommunityIcons name="meditation" size={22} color={W.gold} />
        <Text style={styles.closingText}>
          Return tomorrow. The hill is patient.
        </Text>
      </View>
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: W.bg },
  content: { padding: 16, gap: 18 },

  // Header
  headerWrap: {
    paddingTop: 20, paddingBottom: 22, alignItems: "center",
    position: "relative", overflow: "hidden", borderRadius: 18,
  },
  headerGlowOuter: {
    position: "absolute", width: 400, height: 400, borderRadius: 200,
    backgroundColor: W.gold, opacity: 0.06,
    top: -260, alignSelf: "center",
  },
  headerOverline: {
    fontSize: 10, color: W.goldLight, letterSpacing: 3,
    fontFamily: "Inter_600SemiBold", marginBottom: 8,
  },
  headerTitle: {
    fontSize: 38, color: W.gold, fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  headerSub: {
    fontSize: 13, color: W.textMid, fontFamily: "Inter_400Regular",
    marginTop: 10, textAlign: "center", maxWidth: 280, lineHeight: 20,
  },

  // Section header
  sectionHeader: { marginTop: 6, marginBottom: -6, paddingHorizontal: 2 },
  overline: {
    fontSize: 10, color: W.goldLight, letterSpacing: 2.5,
    fontFamily: "Inter_600SemiBold", marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 19, color: W.text, fontFamily: "Inter_700Bold", lineHeight: 26,
  },
  sectionSub: {
    fontSize: 12, color: W.textFaint, fontFamily: "Inter_400Regular",
    marginTop: 4, lineHeight: 18,
  },

  // Generic card
  card: {
    backgroundColor: W.card, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: W.cardBorder,
  },
  cardTitle: { fontSize: 15, color: W.text, fontFamily: "Inter_600SemiBold" },
  cardSub: { fontSize: 12, color: W.textFaint, fontFamily: "Inter_400Regular", marginTop: 4 },

  divider: {
    height: 1, backgroundColor: W.cardBorder, marginVertical: 16,
  },

  // Hero / Daily Wisdom
  heroCard: {
    backgroundColor: W.bgSoft, borderRadius: 22, padding: 22,
    borderWidth: 1, borderColor: W.cardBorder,
    position: "relative", overflow: "hidden",
  },
  heroGlow: {
    position: "absolute", top: -120, right: -80, width: 280, height: 280,
    borderRadius: 140, backgroundColor: W.gold, opacity: 0.07,
  },
  heroDate: {
    fontSize: 10, color: W.goldLight, letterSpacing: 2.5,
    fontFamily: "Inter_600SemiBold", marginBottom: 14,
  },
  heroQuote: {
    fontSize: 19, color: W.text, fontFamily: "Inter_400Regular",
    lineHeight: 28, fontStyle: "italic",
  },
  heroAttribution: {
    fontSize: 12, color: W.goldLight, fontFamily: "Inter_600SemiBold",
    marginTop: 10,
  },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroRowLabel: {
    fontSize: 10, color: W.goldLight, letterSpacing: 1.5,
    fontFamily: "Inter_600SemiBold",
  },
  heroRowBody: {
    fontSize: 14, color: W.textMid, fontFamily: "Inter_400Regular",
    lineHeight: 21, marginTop: 6,
  },

  // Emotion chips
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  chip: {
    paddingHorizontal: 13, paddingVertical: 8, borderRadius: 100,
    borderWidth: 1, borderColor: W.cardBorder, backgroundColor: W.goldFaint,
  },
  chipActive: { backgroundColor: W.gold, borderColor: W.gold },
  chipText: { fontSize: 12, color: W.textMid, fontFamily: "Inter_500Medium" },
  chipTextActive: { color: "#FFFAEC", fontFamily: "Inter_600SemiBold" },
  teachingBox: {
    marginTop: 16, padding: 14, borderRadius: 12,
    backgroundColor: W.goldFaint, borderLeftWidth: 2, borderLeftColor: W.gold,
  },
  teachingHead: {
    fontSize: 14, color: W.goldLight, fontFamily: "Inter_600SemiBold",
    lineHeight: 21,
  },
  teachingBody: {
    fontSize: 13, color: W.textMid, fontFamily: "Inter_400Regular",
    lineHeight: 20, marginTop: 8,
  },

  // Timeline
  timelineRow: {
    flexDirection: "row", paddingVertical: 10, gap: 12, alignItems: "flex-start",
  },
  timelineRail: { width: 14, alignItems: "center", paddingTop: 5 },
  timelineDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: W.gold,
    borderWidth: 2, borderColor: W.bgSoft,
  },
  timelineLine: {
    width: 1, flex: 1, minHeight: 24, backgroundColor: W.cardBorder, marginTop: 4,
  },
  timelineContent: { flex: 1, paddingBottom: 4 },
  timelineYear: {
    fontSize: 11, color: W.goldLight, letterSpacing: 1.5,
    fontFamily: "Inter_600SemiBold",
  },
  timelineTitle: {
    fontSize: 14, color: W.text, fontFamily: "Inter_600SemiBold",
    marginTop: 3,
  },
  timelineBody: {
    fontSize: 13, color: W.textMid, fontFamily: "Inter_400Regular",
    lineHeight: 20, marginTop: 8,
  },

  // Books
  bookRow: { flexDirection: "row", gap: 14, paddingVertical: 14 },
  bookSpine: {
    width: 44, height: 64, borderRadius: 4,
    backgroundColor: W.goldFaint, borderWidth: 1, borderColor: W.gold,
    alignItems: "center", justifyContent: "center",
  },
  bookSpineLetter: {
    fontSize: 22, color: W.goldLight, fontFamily: "Inter_700Bold",
  },
  bookTitle: { fontSize: 15, color: W.text, fontFamily: "Inter_600SemiBold" },
  bookAuthor: { fontSize: 11, color: W.textFaint, fontFamily: "Inter_400Regular", marginTop: 2 },
  bookSummary: { fontSize: 12, color: W.textMid, fontFamily: "Inter_400Regular", lineHeight: 18, marginTop: 8 },
  bookMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  bookTag: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
    backgroundColor: W.goldFaint, borderWidth: 1, borderColor: W.cardBorder,
  },
  bookTagText: { fontSize: 10, color: W.goldLight, fontFamily: "Inter_600SemiBold" },
  bookMeta: { fontSize: 11, color: W.textFaint, fontFamily: "Inter_400Regular" },
  bookSep: { height: 1, backgroundColor: W.cardBorder, opacity: 0.5 },

  // Micro-reads
  microScroll: { paddingVertical: 4, paddingRight: 16, gap: 12 },
  microCard: {
    width: 220, padding: 16, borderRadius: 16,
    backgroundColor: W.bgSoft, borderWidth: 1, borderColor: W.cardBorder,
    justifyContent: "space-between", minHeight: 170,
  },
  microTitle: { fontSize: 14, color: W.goldLight, fontFamily: "Inter_600SemiBold" },
  microBody: {
    fontSize: 13, color: W.text, fontFamily: "Inter_400Regular",
    lineHeight: 20, marginTop: 10, fontStyle: "italic",
  },
  microFooter: {
    fontSize: 9, color: W.textFaint, letterSpacing: 1.5,
    fontFamily: "Inter_600SemiBold", marginTop: 12,
  },

  // Q & A
  qaRow: { paddingVertical: 12 },
  qaHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  qaQuestion: { flex: 1, fontSize: 13, color: W.text, fontFamily: "Inter_500Medium" },
  qaAnswer: {
    fontSize: 13, color: W.textMid, fontFamily: "Inter_400Regular",
    lineHeight: 20, marginTop: 10, paddingLeft: 28,
  },

  // Audio
  audioRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  audioIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: W.goldFaint, borderWidth: 1, borderColor: W.cardBorder,
    alignItems: "center", justifyContent: "center",
  },
  audioTitle: { fontSize: 14, color: W.text, fontFamily: "Inter_600SemiBold" },
  audioDesc: { fontSize: 12, color: W.textFaint, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 17 },
  audioRight: { alignItems: "flex-end", gap: 4 },
  audioDuration: { fontSize: 10, color: W.textFaint, fontFamily: "Inter_500Medium", letterSpacing: 0.5 },
  audioSep: { height: 1, backgroundColor: W.cardBorder, opacity: 0.4 },
  audioFootnote: {
    fontSize: 11, color: W.textFaint, fontFamily: "Inter_400Regular",
    textAlign: "center", marginTop: 12, fontStyle: "italic",
  },

  // Ashram
  ashramCard: { paddingVertical: 12 },
  ashramHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  ashramIconWrap: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: W.goldFaint, borderWidth: 1, borderColor: W.cardBorder,
    alignItems: "center", justifyContent: "center",
  },
  ashramTitle: { flex: 1, fontSize: 14, color: W.text, fontFamily: "Inter_600SemiBold" },
  ashramBody: {
    fontSize: 13, color: W.textMid, fontFamily: "Inter_400Regular",
    lineHeight: 20, marginTop: 10, paddingLeft: 44,
  },

  // Inner notes
  noteInput: {
    marginTop: 14, minHeight: 80, padding: 12, borderRadius: 12,
    backgroundColor: W.bgSoft, borderWidth: 1, borderColor: W.cardBorder,
    color: W.text, fontFamily: "Inter_400Regular", fontSize: 14,
    textAlignVertical: "top",
  },
  noteSaveBtn: {
    marginTop: 10, alignSelf: "flex-start", flexDirection: "row",
    alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 100, backgroundColor: W.gold,
  },
  noteSaveText: { fontSize: 13, color: "#FFFAEC", fontFamily: "Inter_600SemiBold" },
  notesEmpty: {
    fontSize: 12, color: W.textFaint, fontFamily: "Inter_400Regular",
    fontStyle: "italic", marginTop: 18, textAlign: "center",
  },
  noteRow: {
    padding: 14, borderRadius: 12, backgroundColor: W.bgSoft,
    borderWidth: 1, borderColor: W.cardBorder,
  },
  noteBody: { fontSize: 13, color: W.text, fontFamily: "Inter_400Regular", lineHeight: 20 },
  noteFooter: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: 10,
  },
  noteDate: { fontSize: 11, color: W.textFaint, fontFamily: "Inter_500Medium" },

  // Closing
  closingWrap: {
    alignItems: "center", gap: 8, marginTop: 12, paddingVertical: 20,
  },
  closingText: {
    fontSize: 13, color: W.textMid, fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
});
