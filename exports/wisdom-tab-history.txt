import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutAnimation,
  Modal,
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
  addDownload,
  addInnerNote,
  getContinue,
  getDownloads,
  getInnerNotes,
  getRecentlyOpened,
  recordOpened,
  removeDownload,
  removeInnerNote,
  upsertLibraryProgress,
  type DownloadItem,
  type InnerNote,
  type LibraryKind,
  type LibraryProgress,
  type RecentItem,
} from "@/lib/pilgrimage-store";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ── Clean white palette — white paper, soft brass lamps, charcoal ink ─────
const W = {
  bg: "#FFFFFF",                          // white paper
  bgSoft: "#F2F2F2",                      // light gray fill
  card: "#FFFFFF",                        // white card
  cardBorder: "rgba(0, 0, 0, 0.10)",      // soft gray outline
  gold: "#836418",                        // deep brass accent (AA on white)
  goldLight: "#C49B3D",                   // brighter brass for accents
  goldFaint: "rgba(131, 100, 24, 0.08)",  // soft brass wash
  text: "#1C1C1E",                        // near-black ink
  textMid: "#48484A",                     // dark gray
  textFaint: "#6E6E73",                   // mid gray (AA-readable)
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

interface Situation {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub: string;
  quotes: { text: string; attr: string }[];
  teaching: string;
  practice: string;
  reflectionPrompt: string;
}

const SITUATIONS: Situation[] = [
  {
    key: "anxiety",
    icon: "pulse-outline",
    label: "Anxiety",
    sub: "Racing mind, restless body",
    quotes: [
      { text: "Happiness is your nature. It is not wrong to desire it. What is wrong is seeking it outside.", attr: "Ramana Maharshi" },
      { text: "The future is uncertain. The present is here. Stay with what is, not with what may come.", attr: "Ramana Maharshi" },
    ],
    teaching: "Anxiety is the mind projecting itself into a future that has not yet arrived. The root teaching: return to now. Ask — 'To whom is this anxiety arising?' Follow that thread inward, away from the imagined future, back to the one who is always still.",
    practice: "Sit. Take three slow breaths. With each breath, say silently: 'I am here.' Let the next breath come on its own. Do nothing else for two minutes.",
    reflectionPrompt: "What future am I most afraid of right now? And what is here, right now, that fear cannot touch?",
  },
  {
    key: "fear",
    icon: "thunderstorm-outline",
    label: "Fear",
    sub: "Dread, worst-case thinking",
    quotes: [
      { text: "Fear is the mind's shadow cast by forgetting what you truly are.", attr: "Ramana Maharshi" },
      { text: "Who is afraid? Pursue that question. You will not find the one you are looking for.", attr: "Ramana Maharshi" },
    ],
    teaching: "Fear belongs to the small self that believes it can be destroyed. The Self — the awareness behind all thought — cannot be harmed. Ask 'Who is afraid?' with genuine curiosity, not to answer it, but to see that the one who fears is itself a thought.",
    practice: "Place both hands on your chest. Feel the warmth. Breathe slowly. Say internally: 'This too is known by something quiet.' Rest there.",
    reflectionPrompt: "What is the worst thing I am imagining? If it happened, what is the deepest part of me that would still remain?",
  },
  {
    key: "anger",
    icon: "flame-outline",
    label: "Anger",
    sub: "Frustration, resentment, irritation",
    quotes: [
      { text: "The degree of freedom from unwanted thoughts and the degree of concentration on a single thought are the measures to gauge spiritual progress.", attr: "Ramana Maharshi" },
      { text: "If you are not happy for any reason whatsoever, there must be a 'you' who is unhappy. Find out who that is.", attr: "Ramana Maharshi" },
    ],
    teaching: "Anger burns the one who holds it, not the one it is aimed at. Behind every anger is a want — something that should have been, wasn't. Ask: 'Who is the one who feels this should be different?' That is the ego-self claiming authority over what it cannot control. See it. The anger softens.",
    practice: "Don't speak. Don't act. Sit with the fire. Watch it the way you'd watch a forest burn on the horizon — real, but not you. Let it move through without adding fuel.",
    reflectionPrompt: "What exactly did I want that I didn't get? Is the anger about this moment — or about something older?",
  },
  {
    key: "loneliness",
    icon: "person-outline",
    label: "Loneliness",
    sub: "Disconnection, feeling unseen",
    quotes: [
      { text: "Solitude is in the mind. One might be in the thick of the world and yet maintain perfect serenity of mind.", attr: "Ramana Maharshi" },
      { text: "Even from a thousand miles, simply turning the heart toward Arunachala is enough. The hill listens.", attr: "Ramana Maharshi" },
    ],
    teaching: "Loneliness arises when we seek completion in another person. But the Self is already whole. There is a loneliness that is simply the soul remembering its true home — not a person, not a place, but a depth within. Arunachala is always present. Turn toward it.",
    practice: "Go outside if you can. Sit under the sky. Feel the ground beneath you. You are held by something that has never left you. Let that land.",
    reflectionPrompt: "What am I truly seeking from other people? Is there any part of that which only I can give myself?",
  },
  {
    key: "stress",
    icon: "timer-outline",
    label: "Stress",
    sub: "Overwhelm, too much to carry",
    quotes: [
      { text: "There is no greater mystery than this: being Reality ourselves, we seek to gain Reality.", attr: "Ramana Maharshi" },
      { text: "Whatever is destined not to happen will not happen. Whatever is destined to happen will happen. The best thing is to remain silent.", attr: "Ramana Maharshi" },
    ],
    teaching: "Stress is the sign that the mind believes it is responsible for outcomes it cannot fully control. Bhagavan often reminded devotees: your duty is the action, not the result. Act with full attention. Then, let go. Arunachala carries what you were never meant to hold alone.",
    practice: "Write down three things worrying you. Then write: 'I have done what I can today.' Close the notebook. Don't open it again until morning.",
    reflectionPrompt: "What am I trying to control that I cannot? What would change if I trusted, just for today, that things are unfolding as they must?",
  },
  {
    key: "attachment",
    icon: "link-outline",
    label: "Attachment",
    sub: "Clinging, not wanting to let go",
    quotes: [
      { text: "The world is illusory. Brahman alone is real. Brahman is the world.", attr: "Ramana Maharshi" },
      { text: "Letting go is not abandonment. It is the deepest act of love — releasing what was never yours to keep.", attr: "Ramana Maharshi" },
    ],
    teaching: "Attachment is not love. Love says 'I want what is best for you.' Attachment says 'I need you to remain unchanged for my peace.' The path is not to stop caring — it is to love without the grip. Hold gently. What is truly yours will stay. What leaves was on loan.",
    practice: "Think of what you are clinging to. Now hold it in your open palm, not a fist. Say: 'I love this. I release it to its own nature.' Breathe.",
    reflectionPrompt: "What am I afraid of losing? If I lost it, what quality within me would I still have? Where does that quality come from?",
  },
  {
    key: "grief",
    icon: "heart-outline",
    label: "Grief",
    sub: "Loss, mourning, sorrow",
    quotes: [
      { text: "Where have those who have gone, gone? They have gone to the Source from which we all came.", attr: "Ramana Maharshi" },
      { text: "Grief is love with nowhere to go. Let it go to the Self, where it becomes peace.", attr: "Ramana Maharshi" },
    ],
    teaching: "Grief is the price of love, and it is therefore sacred. Ramana said of death: 'Where have they gone? To the Source.' What we mourn is the form — but the love that filled that form does not die. Let your grief be a prayer. It already is.",
    practice: "Light a lamp or candle if you can. Sit with the one you grieve in your heart. Don't talk. Don't explain. Just let them be present with you, in the silence.",
    reflectionPrompt: "What is the most beautiful thing I received from what I lost? How can I carry that forward in how I live today?",
  },
  {
    key: "confusion",
    icon: "help-circle-outline",
    label: "Confusion",
    sub: "Indecision, unclear direction",
    quotes: [
      { text: "There is no need to clear doubts. Realise the Self and then see if the doubts remain.", attr: "Ramana Maharshi" },
      { text: "Clarity is not a result of more thinking. It is what emerges when thinking stops.", attr: "Ramana Maharshi" },
    ],
    teaching: "Confusion is often the mind demanding that the path be visible before the step is taken. But the teaching of Arunachala has always been: take one step. The next step reveals itself only when this one is complete. Stop waiting for certainty. Take the step that is most true right now.",
    practice: "Sit still. Don't think about the decision. For five minutes, just watch your breathing. When your mind goes to the decision, return to breathing. Notice what feels most settled when you are done.",
    reflectionPrompt: "If I knew I couldn't fail, what would I do? What is the part of me that already knows?",
  },
  {
    key: "relationships",
    icon: "people-outline",
    label: "Relationships",
    sub: "Conflict, hurt, disconnection",
    quotes: [
      { text: "When you hurt another, you disturb the peace of the Self. When you love another without expectation, you see the Self in them.", attr: "Ramana Maharshi" },
      { text: "See the Self in others. That is the highest form of wisdom and the foundation of all right action.", attr: "Ramana Maharshi" },
    ],
    teaching: "Most relationship suffering comes from expecting another person to fill something we must fill for ourselves. Bhagavan said: see the Self in others. When you do, you stop needing them to be different — and something remarkable often happens: they soften, because your expectation has softened.",
    practice: "Think of the person. Take one breath. Ask: 'What do I actually want from them, at the deepest level?' Not the surface want — the real one. Sit with that.",
    reflectionPrompt: "What am I seeing in this person that disturbs me? Is any part of that quality also present in me, unacknowledged?",
  },
  {
    key: "purpose",
    icon: "compass-outline",
    label: "Purpose",
    sub: "Feeling directionless, unfulfilled",
    quotes: [
      { text: "Your own Self-realization is the greatest service you can render the world.", attr: "Ramana Maharshi" },
      { text: "The purpose of life is to discover that you are life itself — not a wave looking for the ocean, but the ocean appearing as a wave.", attr: "Ramana Maharshi" },
    ],
    teaching: "Worldly purpose comes and goes — careers end, projects complete, identities shift. The search for permanent purpose in impermanent forms always disappoints. The deeper question: What am I, beneath all my roles? That discovery — of the Self — is the one purpose that never empties.",
    practice: "Ask yourself: 'What would I do if no one was watching and I needed nothing from it?' Whatever that is — that contains a thread back to your real nature. Follow it.",
    reflectionPrompt: "When in my life have I felt most alive and most myself? What was I doing — and what quality was I expressing in that moment?",
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

// ── Unified library model (organises ALL existing content by category) ─────
type LibItem = {
  id: string;
  title: string;
  category: LibraryKind;
  mode: "read" | "listen";
  author?: string;
  meta?: string;
  body: string;
  downloadable: boolean;
  audio?: boolean;
};

const CATEGORIES: { key: LibraryKind; label: string }[] = [
  { key: "book", label: "Books" },
  { key: "audiobook", label: "Audiobooks" },
  { key: "teaching", label: "Teachings" },
  { key: "story", label: "Stories" },
  { key: "quote", label: "Quotes" },
  { key: "video", label: "Videos" },
  { key: "chanting", label: "Chanting" },
  { key: "article", label: "Articles" },
];

const CAT_ICON: Record<LibraryKind, keyof typeof Ionicons.glyphMap> = {
  book: "book-outline",
  audiobook: "headset-outline",
  teaching: "school-outline",
  story: "moon-outline",
  quote: "chatbubble-ellipses-outline",
  video: "videocam-outline",
  chanting: "musical-notes-outline",
  article: "document-text-outline",
};

const CATEGORY_LABEL = CATEGORIES.reduce((acc, c) => {
  acc[c.key] = c.label;
  return acc;
}, {} as Record<LibraryKind, string>);

const BOOK_ITEMS: LibItem[] = LIBRARY.map((b) => ({
  id: `book_${b.id}`,
  title: b.title,
  category: "book",
  mode: "read",
  author: b.author,
  meta: b.minutes > 0 ? `${b.minutes} min read` : "Dip in & out",
  body: b.summary,
  downloadable: true,
}));

const QUOTE_ITEMS: LibItem[] = DAILY_QUOTES.map((q, i) => ({
  id: `quote_${i}`,
  title: q.q.length > 52 ? `${q.q.slice(0, 50).trim()}…` : q.q,
  category: "quote",
  mode: "read",
  author: q.a,
  body: `\u201C${q.q}\u201D\n\n\u2014 ${q.a}`,
  downloadable: false,
}));

const TEACHING_ITEMS: LibItem[] = [
  ...MICRO_READS.map((m) => ({
    id: `teaching_${m.id}`,
    title: m.title,
    category: "teaching" as const,
    mode: "read" as const,
    meta: "2-min read",
    body: m.body,
    downloadable: true,
  })),
  ...SITUATIONS.map((e) => ({
    id: `teaching_situation_${e.key}`,
    title: e.label,
    category: "teaching" as const,
    mode: "read" as const,
    body: `${e.teaching}\n\n${e.practice}`,
    downloadable: true,
  })),
];

const STORY_ITEMS: LibItem[] = [
  ...ASHRAM_STORIES.map((s) => ({
    id: `story_${s.id}`,
    title: s.title,
    category: "story" as const,
    mode: "read" as const,
    body: s.body,
    downloadable: true,
  })),
  ...RAMANA_TIMELINE.map((t, i) => ({
    id: `story_timeline_${i}`,
    title: `${t.year} \u00B7 ${t.title}`,
    category: "story" as const,
    mode: "read" as const,
    body: t.body,
    downloadable: true,
  })),
];

const ARTICLE_ITEMS: LibItem[] = [
  ...ASK_QUESTIONS.map((qa, i) => ({
    id: `article_${i}`,
    title: qa.q,
    category: "article" as const,
    mode: "read" as const,
    body: qa.a,
    downloadable: true,
  })),
  ...DAILY_QUESTIONS.map((q, i) => ({
    id: `article_enquiry_${i}`,
    title: q,
    category: "article" as const,
    mode: "read" as const,
    meta: "Self-enquiry",
    body: `A question for self-enquiry. Sit with it gently. Do not rush to answer \u2014 let the question do its work.\n\n\u201C${q}\u201D`,
    downloadable: false,
  })),
];

const CHANTING_ITEMS: LibItem[] = SACRED_AUDIO.map((a) => ({
  id: `chanting_${a.id}`,
  title: a.title,
  category: "chanting",
  mode: "listen",
  meta: a.duration,
  body: a.desc,
  downloadable: false,
  audio: true,
}));

const ALL_ITEMS: LibItem[] = [
  ...BOOK_ITEMS,
  ...TEACHING_ITEMS,
  ...STORY_ITEMS,
  ...QUOTE_ITEMS,
  ...CHANTING_ITEMS,
  ...ARTICLE_ITEMS,
];

const ITEM_BY_ID = new Map<string, LibItem>(ALL_ITEMS.map((i) => [i.id, i]));

const CATEGORY_COUNT = CATEGORIES.reduce((acc, c) => {
  acc[c.key] = ALL_ITEMS.filter((i) => i.category === c.key).length;
  return acc;
}, {} as Record<LibraryKind, number>);

// ── Local content bookmarks (device-only, this screen) ─────────────────────
const WISDOM_BOOKMARKS_KEY = "@girivalam/v1/wisdom-bookmarks";
async function getWisdomBookmarks(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(WISDOM_BOOKMARKS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
async function toggleWisdomBookmark(id: string): Promise<string[]> {
  const list = await getWisdomBookmarks();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];
  try {
    await AsyncStorage.setItem(WISDOM_BOOKMARKS_KEY, JSON.stringify(next));
  } catch {
    /* non-fatal */
  }
  return next;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

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

function LifeGuidanceSection({ onWriteReflection }: { onWriteReflection?: (prompt: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const situation = useMemo(() => SITUATIONS.find((s) => s.key === selected) ?? null, [selected]);

  const choose = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelected((cur) => (cur === key ? null : key));
  };

  return (
    <View style={{ gap: 12 }}>
      {/* Situation tiles grid */}
      <View style={styles.situationGrid}>
        {SITUATIONS.map((s) => {
          const active = s.key === selected;
          return (
            <Pressable
              key={s.key}
              onPress={() => choose(s.key)}
              style={[styles.situationTile, active && styles.situationTileActive]}
              accessibilityRole="button"
              accessibilityLabel={s.label}
            >
              <Ionicons
                name={s.icon}
                size={22}
                color={active ? W.gold : W.textMid}
              />
              <Text style={[styles.situationTileLabel, active && styles.situationTileLabelActive]}>
                {s.label}
              </Text>
              <Text style={styles.situationTileSub} numberOfLines={1}>{s.sub}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Expanded teaching panel */}
      {situation ? (
        <View style={styles.situationPanel}>
          {/* Header */}
          <View style={styles.situationPanelHeader}>
            <View style={styles.situationPanelIcon}>
              <Ionicons name={situation.icon} size={20} color={W.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.situationPanelTitle}>{situation.label}</Text>
              <Text style={styles.situationPanelSub}>{situation.sub}</Text>
            </View>
          </View>

          {/* Quotes */}
          <View style={styles.situationQuotes}>
            {situation.quotes.map((q, i) => (
              <View key={i} style={styles.situationQuoteBlock}>
                <Text style={styles.situationQuoteText}>"{q.text}"</Text>
                <Text style={styles.situationQuoteAttr}>— {q.attr}</Text>
              </View>
            ))}
          </View>

          {/* Teaching */}
          <View style={styles.situationTeachingBlock}>
            <View style={styles.situationTeachingBar} />
            <Text style={styles.situationTeachingText}>{situation.teaching}</Text>
          </View>

          {/* Practice */}
          <View style={styles.situationPracticeBlock}>
            <View style={styles.situationPracticeHeader}>
              <Ionicons name="leaf-outline" size={14} color={W.goldLight} />
              <Text style={styles.situationPracticeLabel}>A PRACTICE FOR NOW</Text>
            </View>
            <Text style={styles.situationPracticeText}>{situation.practice}</Text>
          </View>

          {/* Reflection prompt */}
          <View style={styles.situationReflectBlock}>
            <View style={styles.situationReflectHeader}>
              <Ionicons name="pencil-outline" size={14} color={W.goldLight} />
              <Text style={styles.situationReflectLabel}>REFLECTION QUESTION</Text>
            </View>
            <Text style={styles.situationReflectText}>{situation.reflectionPrompt}</Text>
            {onWriteReflection ? (
              <Pressable
                style={styles.situationWriteBtn}
                onPress={() => onWriteReflection(situation.reflectionPrompt)}
                accessibilityRole="button"
              >
                <Ionicons name="create-outline" size={14} color={W.gold} />
                <Text style={styles.situationWriteBtnText}>Write my reflection</Text>
              </Pressable>
            ) : null}
          </View>
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

// ── Library: category nav, item cards, reader, store-backed rows ───────────
function CategoryNav({
  active,
  onSelect,
}: {
  active: LibraryKind | null;
  onSelect: (k: LibraryKind) => void;
}) {
  return (
    <View style={styles.catGrid}>
      {CATEGORIES.map((c) => {
        const isActive = active === c.key;
        return (
          <Pressable
            key={c.key}
            style={[styles.catBtn, isActive && styles.catBtnActive]}
            onPress={() => onSelect(c.key)}
            accessibilityRole="button"
          >
            <Ionicons name={CAT_ICON[c.key]} size={18} color={isActive ? "#FFFAEC" : W.goldLight} />
            <Text style={[styles.catLabel, isActive && styles.catLabelActive]} numberOfLines={1}>
              {c.label}
            </Text>
            <Text style={[styles.catCount, isActive && styles.catCountActive]}>
              {CATEGORY_COUNT[c.key]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function LibraryItemCard({
  item,
  bookmarked,
  downloaded,
  onOpen,
  onToggleBookmark,
  onToggleDownload,
}: {
  item: LibItem;
  bookmarked: boolean;
  downloaded: boolean;
  onOpen: (item: LibItem) => void;
  onToggleBookmark: (item: LibItem) => void;
  onToggleDownload: (item: LibItem) => void;
}) {
  return (
    <View style={styles.libCard}>
      <Pressable style={styles.libCardMain} onPress={() => onOpen(item)} accessibilityRole="button">
        <View style={styles.libIconWrap}>
          <Ionicons name={CAT_ICON[item.category]} size={18} color={W.goldLight} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.libTitle}>{item.title}</Text>
          {item.author ? <Text style={styles.libAuthor}>{item.author}</Text> : null}
          <Text style={styles.libBody} numberOfLines={2}>{item.body}</Text>
          <View style={styles.libMetaRow}>
            <View style={styles.libTag}>
              <Text style={styles.libTagText}>{CATEGORY_LABEL[item.category]}</Text>
            </View>
            {item.meta ? <Text style={styles.libMeta}>· {item.meta}</Text> : null}
            {item.audio ? <Text style={styles.libMeta}>· Listen</Text> : null}
          </View>
        </View>
      </Pressable>
      <View style={styles.libActions}>
        <Pressable
          style={styles.libActionBtn}
          onPress={() => onToggleBookmark(item)}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={16}
            color={bookmarked ? W.gold : W.textFaint}
          />
          <Text style={[styles.libActionText, bookmarked && { color: W.gold }]}>
            {bookmarked ? "Saved" : "Save"}
          </Text>
        </Pressable>
        {item.downloadable ? (
          <Pressable
            style={styles.libActionBtn}
            onPress={() => onToggleDownload(item)}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Ionicons
              name={downloaded ? "checkmark-circle" : "download-outline"}
              size={16}
              color={downloaded ? W.gold : W.textFaint}
            />
            <Text style={[styles.libActionText, downloaded && { color: W.gold }]}>
              {downloaded ? "Offline" : "Download"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ReaderModal({
  item,
  bookmarked,
  downloaded,
  onClose,
  onToggleBookmark,
  onToggleDownload,
}: {
  item: LibItem | null;
  bookmarked: boolean;
  downloaded: boolean;
  onClose: () => void;
  onToggleBookmark: (item: LibItem) => void;
  onToggleDownload: (item: LibItem) => void;
}) {
  return (
    <Modal visible={!!item} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.readerOverlay}>
        <Pressable style={styles.readerBackdrop} onPress={onClose} />
        <View style={styles.readerSheet}>
          {item ? (
            <>
              <View style={styles.readerHeader}>
                <View style={styles.libTag}>
                  <Text style={styles.libTagText}>{CATEGORY_LABEL[item.category]}</Text>
                </View>
                <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
                  <Ionicons name="close" size={22} color={W.textMid} />
                </Pressable>
              </View>
              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.readerTitle}>{item.title}</Text>
                {item.author ? <Text style={styles.readerAuthor}>{item.author}</Text> : null}
                {item.audio ? (
                  <Text style={styles.readerNote}>
                    Audio narration coming soon — the description is below.
                  </Text>
                ) : null}
                <Text style={styles.readerBody}>{item.body}</Text>
              </ScrollView>
              <View style={styles.readerFooter}>
                <Pressable
                  style={styles.readerFooterBtn}
                  onPress={() => onToggleBookmark(item)}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name={bookmarked ? "bookmark" : "bookmark-outline"}
                    size={16}
                    color={bookmarked ? W.gold : W.textMid}
                  />
                  <Text style={styles.readerFooterText}>{bookmarked ? "Saved" : "Save"}</Text>
                </Pressable>
                {item.downloadable ? (
                  <Pressable
                    style={styles.readerFooterBtn}
                    onPress={() => onToggleDownload(item)}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name={downloaded ? "checkmark-circle" : "download-outline"}
                      size={16}
                      color={downloaded ? W.gold : W.textMid}
                    />
                    <Text style={styles.readerFooterText}>
                      {downloaded ? "Saved offline" : "Download"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function ContinueRow({ p, onOpen }: { p: LibraryProgress; onOpen: (id: string) => void }) {
  const pct = Math.max(0, Math.min(1, p.progress));
  return (
    <Pressable style={styles.contRow} onPress={() => onOpen(p.id)} accessibilityRole="button">
      <View style={styles.contIconWrap}>
        <Ionicons
          name={p.mode === "listen" ? "headset-outline" : "book-outline"}
          size={16}
          color={W.goldLight}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.contTitle} numberOfLines={1}>{p.title}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%` }]} />
        </View>
        <Text style={styles.contMeta}>
          {p.position ? `${p.position} · ` : ""}{Math.round(pct * 100)}%
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={W.textFaint} />
    </Pressable>
  );
}

function RecentRow({ r, onOpen }: { r: RecentItem; onOpen: (id: string) => void }) {
  return (
    <Pressable style={styles.recentRow} onPress={() => onOpen(r.id)} accessibilityRole="button">
      <Ionicons name={CAT_ICON[r.kind] ?? "document-outline"} size={16} color={W.goldLight} />
      <Text style={styles.recentTitle} numberOfLines={1}>{r.title}</Text>
      <Text style={styles.recentMeta}>{timeAgo(r.openedAt)}</Text>
    </Pressable>
  );
}

function DownloadRow({
  d,
  onOpen,
  onRemove,
}: {
  d: DownloadItem;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const icon: keyof typeof Ionicons.glyphMap =
    d.kind === "map" ? "map-outline" : CAT_ICON[d.kind] ?? "document-outline";
  return (
    <View style={styles.dlRow}>
      <Pressable style={styles.dlMain} onPress={() => onOpen(d.id)} accessibilityRole="button">
        <Ionicons name={icon} size={16} color={W.goldLight} />
        <Text style={styles.dlTitle} numberOfLines={1}>{d.title}</Text>
      </Pressable>
      {d.sizeLabel ? <Text style={styles.dlMeta}>{d.sizeLabel}</Text> : null}
      <Pressable onPress={() => onRemove(d.id)} hitSlop={8} accessibilityRole="button">
        <Ionicons name="trash-outline" size={16} color={W.textFaint} />
      </Pressable>
    </View>
  );
}

// ── Screen ─────────────────────────────────────────────────────────────────
export default function WisdomScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<LibraryKind | null>(null);
  const [readerItem, setReaderItem] = useState<LibItem | null>(null);

  const [continueRead, setContinueRead] = useState<LibraryProgress[]>([]);
  const [continueListen, setContinueListen] = useState<LibraryProgress[]>([]);
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const reload = useCallback(async () => {
    const [cr, cl, rc, dl, bm] = await Promise.all([
      getContinue("read"),
      getContinue("listen"),
      getRecentlyOpened(),
      getDownloads(),
      getWisdomBookmarks(),
    ]);
    setContinueRead(cr);
    setContinueListen(cl);
    setRecents(rc);
    setDownloads(dl);
    setBookmarks(bm);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks]);
  const downloadSet = useMemo(() => new Set(downloads.map((d) => d.id)), [downloads]);
  const bookmarkItems = useMemo(
    () => bookmarks.map((id) => ITEM_BY_ID.get(id)).filter((x): x is LibItem => !!x),
    [bookmarks],
  );

  const openItem = useCallback(
    async (item: LibItem) => {
      setReaderItem(item);
      try {
        await recordOpened({ id: item.id, title: item.title, kind: item.category });
        const inProgress = item.category === "book" || item.mode === "listen";
        await upsertLibraryProgress({
          id: item.id,
          title: item.title,
          kind: item.category,
          mode: item.mode,
          progress: inProgress ? 0.25 : 1,
          position: item.mode === "listen" ? "Started" : inProgress ? "Started" : "Read",
        });
      } finally {
        reload();
      }
    },
    [reload],
  );

  const openById = useCallback(
    (id: string) => {
      const it = ITEM_BY_ID.get(id);
      if (it) openItem(it);
    },
    [openItem],
  );

  const onToggleBookmark = useCallback(async (item: LibItem) => {
    const next = await toggleWisdomBookmark(item.id);
    setBookmarks(next);
  }, []);

  const onToggleDownload = useCallback(
    async (item: LibItem) => {
      if (downloadSet.has(item.id)) {
        await removeDownload(item.id);
      } else {
        await addDownload({ id: item.id, title: item.title, kind: item.category, sizeLabel: "Text" });
      }
      reload();
    },
    [downloadSet, reload],
  );

  const onRemoveDownload = useCallback(
    async (id: string) => {
      await removeDownload(id);
      reload();
    },
    [reload],
  );

  const onSelectCat = useCallback(
    (k: LibraryKind) => setActiveCategory((cur) => (cur === k ? null : k)),
    [],
  );

  const filtered = useMemo(() => {
    let list = ALL_ITEMS;
    if (activeCategory) list = list.filter((i) => i.category === activeCategory);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.body.toLowerCase().includes(q) ||
          (i.author?.toLowerCase().includes(q) ?? false),
      );
    }
    return list;
  }, [activeCategory, query]);

  const filterActive = !!activeCategory || query.trim().length > 0;

  const clearFilter = useCallback(() => {
    setActiveCategory(null);
    setQuery("");
  }, []);

  return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 40 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
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

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={W.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search wisdom…"
          placeholderTextColor={W.textFaint}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityRole="button">
            <Ionicons name="close-circle" size={18} color={W.textFaint} />
          </Pressable>
        ) : null}
      </View>

      {/* Category navigation */}
      <CategoryNav active={activeCategory} onSelect={onSelectCat} />

      {filterActive ? (
        <>
          <View style={styles.filterHeaderRow}>
            <Text style={styles.filterHeaderText}>
              {activeCategory ? CATEGORY_LABEL[activeCategory] : "Search results"}
              {query.trim() ? ` · \u201C${query.trim()}\u201D` : ""}
            </Text>
            <Pressable onPress={clearFilter} hitSlop={8} accessibilityRole="button">
              <Text style={styles.clearLink}>Clear</Text>
            </Pressable>
          </View>
          {filtered.length ? (
            <View style={{ gap: 12 }}>
              {filtered.map((it) => (
                <LibraryItemCard
                  key={it.id}
                  item={it}
                  bookmarked={bookmarkSet.has(it.id)}
                  downloaded={downloadSet.has(it.id)}
                  onOpen={openItem}
                  onToggleBookmark={onToggleBookmark}
                  onToggleDownload={onToggleDownload}
                />
              ))}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.emptyText}>
                {activeCategory && CATEGORY_COUNT[activeCategory] === 0
                  ? "More coming. This shelf is being prepared with care."
                  : "Nothing matches yet. Try another word."}
              </Text>
            </View>
          )}
        </>
      ) : (
        <>
      {/* Continue */}
      <SectionHeader
        overline="PICK UP WHERE YOU LEFT"
        title="Continue"
        sub="Your reading and listening, kept in place."
      />
      <View style={[styles.card, { gap: 16 }]}>
        <View style={{ gap: 8 }}>
          <Text style={styles.subHead}>Continue reading</Text>
          {continueRead.length ? (
            continueRead.map((p) => <ContinueRow key={p.id} p={p} onOpen={openById} />)
          ) : (
            <Text style={styles.emptyText}>Nothing in progress yet. Open a book to begin.</Text>
          )}
        </View>
        <View style={{ gap: 8 }}>
          <Text style={styles.subHead}>Continue listening</Text>
          {continueListen.length ? (
            continueListen.map((p) => <ContinueRow key={p.id} p={p} onOpen={openById} />)
          ) : (
            <Text style={styles.emptyText}>Nothing in progress yet.</Text>
          )}
        </View>
      </View>

      {/* Recently opened */}
      <SectionHeader overline="RECENTLY OPENED" title="Where you've been" />
      <View style={styles.card}>
        {recents.length ? (
          <View style={{ gap: 4 }}>
            {recents.slice(0, 8).map((r) => (
              <RecentRow key={r.id} r={r} onOpen={openById} />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>Nothing opened yet. Tap any teaching to begin.</Text>
        )}
      </View>

      {/* Bookmarks */}
      <SectionHeader overline="SAVED" title="Bookmarks" />
      {bookmarkItems.length ? (
        <View style={{ gap: 12 }}>
          {bookmarkItems.map((it) => (
            <LibraryItemCard
              key={it.id}
              item={it}
              bookmarked
              downloaded={downloadSet.has(it.id)}
              onOpen={openItem}
              onToggleBookmark={onToggleBookmark}
              onToggleDownload={onToggleDownload}
            />
          ))}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.emptyText}>
            Nothing bookmarked yet. Tap the bookmark on any piece to save it here.
          </Text>
        </View>
      )}

      {/* Downloads */}
      <SectionHeader overline="OFFLINE" title="Downloads" />
      <View style={styles.card}>
        {downloads.length ? (
          <View style={{ gap: 4 }}>
            {downloads.map((d) => (
              <DownloadRow key={d.id} d={d} onOpen={openById} onRemove={onRemoveDownload} />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            Your downloads will appear here for offline reading.
          </Text>
        )}
      </View>

      {/* 1. Daily Wisdom */}
      <DailyWisdomCard />

      {/* 2. Emotion finder */}
      <SectionHeader
        overline="LIFE GUIDANCE"
        title="What are you going through?"
        sub="Tap your situation. A teaching, a practice, and a reflection await."
      />
      <LifeGuidanceSection />

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
        </>
      )}

      {/* Closing */}
      <View style={styles.closingWrap}>
        <MaterialCommunityIcons name="meditation" size={22} color={W.gold} />
        <Text style={styles.closingText}>
          Return tomorrow. The hill is patient.
        </Text>
      </View>
    </ScrollView>

    <ReaderModal
      item={readerItem}
      bookmarked={readerItem ? bookmarkSet.has(readerItem.id) : false}
      downloaded={readerItem ? downloadSet.has(readerItem.id) : false}
      onClose={() => setReaderItem(null)}
      onToggleBookmark={onToggleBookmark}
      onToggleDownload={onToggleDownload}
    />
    </>
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

  // Life Guidance — situation tiles grid
  situationGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
  },
  situationTile: {
    width: "30%", flexGrow: 1,
    backgroundColor: W.card, borderWidth: 1, borderColor: W.cardBorder,
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 10,
    alignItems: "center", gap: 5,
  },
  situationTileActive: {
    borderColor: W.gold, backgroundColor: W.goldFaint,
  },
  situationTileLabel: {
    fontSize: 12, color: W.text, fontFamily: "Inter_600SemiBold", textAlign: "center",
  },
  situationTileLabelActive: { color: W.gold },
  situationTileSub: {
    fontSize: 10, color: W.textFaint, fontFamily: "Inter_400Regular",
    textAlign: "center", lineHeight: 13,
  },

  // Life Guidance — expanded panel
  situationPanel: {
    backgroundColor: W.card, borderRadius: 16, borderWidth: 1,
    borderColor: W.cardBorder, overflow: "hidden",
  },
  situationPanelHeader: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: W.cardBorder,
  },
  situationPanelIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: W.goldFaint, alignItems: "center", justifyContent: "center",
  },
  situationPanelTitle: {
    fontSize: 16, color: W.text, fontFamily: "Inter_700Bold",
  },
  situationPanelSub: {
    fontSize: 12, color: W.textFaint, fontFamily: "Inter_400Regular", marginTop: 1,
  },
  situationQuotes: {
    paddingHorizontal: 16, paddingVertical: 14, gap: 14,
    borderBottomWidth: 1, borderBottomColor: W.cardBorder,
  },
  situationQuoteBlock: { gap: 4 },
  situationQuoteText: {
    fontSize: 14, color: W.text, fontFamily: "Inter_400Regular",
    fontStyle: "italic", lineHeight: 21,
  },
  situationQuoteAttr: {
    fontSize: 11, color: W.goldLight, fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  situationTeachingBlock: {
    flexDirection: "row", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: W.cardBorder,
  },
  situationTeachingBar: {
    width: 3, borderRadius: 2, backgroundColor: W.gold, alignSelf: "stretch",
  },
  situationTeachingText: {
    flex: 1, fontSize: 13, color: W.textMid, fontFamily: "Inter_400Regular",
    lineHeight: 21,
  },
  situationPracticeBlock: {
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: "#FDFBF5",
    borderBottomWidth: 1, borderBottomColor: W.cardBorder,
    gap: 8,
  },
  situationPracticeHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  situationPracticeLabel: {
    fontSize: 10, color: W.goldLight, fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  situationPracticeText: {
    fontSize: 13, color: W.text, fontFamily: "Inter_400Regular", lineHeight: 20,
  },
  situationReflectBlock: {
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
  },
  situationReflectHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  situationReflectLabel: {
    fontSize: 10, color: W.goldLight, fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  situationReflectText: {
    fontSize: 14, color: W.text, fontFamily: "Inter_600SemiBold",
    lineHeight: 22, fontStyle: "italic",
  },
  situationWriteBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1, borderColor: W.gold,
    backgroundColor: W.goldFaint,
  },
  situationWriteBtnText: {
    fontSize: 12, color: W.gold, fontFamily: "Inter_600SemiBold",
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

  // Search
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14,
    backgroundColor: W.card, borderWidth: 1, borderColor: W.cardBorder,
  },
  searchInput: {
    flex: 1, color: W.text, fontFamily: "Inter_400Regular", fontSize: 14,
    padding: 0,
  },

  // Category navigation
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catBtn: {
    width: "47%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 12, borderRadius: 14,
    backgroundColor: W.card, borderWidth: 1, borderColor: W.cardBorder,
  },
  catBtnActive: { backgroundColor: W.gold, borderColor: W.gold },
  catLabel: { flex: 1, fontSize: 13, color: W.text, fontFamily: "Inter_600SemiBold" },
  catLabelActive: { color: "#FFFAEC" },
  catCount: {
    fontSize: 11, color: W.textFaint, fontFamily: "Inter_600SemiBold",
    minWidth: 16, textAlign: "right",
  },
  catCountActive: { color: "#FFFAEC" },

  // Filter results header
  filterHeaderRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  filterHeaderText: { flex: 1, fontSize: 16, color: W.text, fontFamily: "Inter_700Bold" },
  clearLink: { fontSize: 13, color: W.gold, fontFamily: "Inter_600SemiBold" },

  // Generic empty / sub-head
  emptyText: {
    fontSize: 12, color: W.textFaint, fontFamily: "Inter_400Regular",
    lineHeight: 18, fontStyle: "italic",
  },
  subHead: {
    fontSize: 11, color: W.goldLight, letterSpacing: 1.5,
    fontFamily: "Inter_600SemiBold",
  },

  // Library item card
  libCard: {
    backgroundColor: W.card, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: W.cardBorder,
  },
  libCardMain: { flexDirection: "row", gap: 12 },
  libIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: W.goldFaint, borderWidth: 1, borderColor: W.cardBorder,
    alignItems: "center", justifyContent: "center",
  },
  libTitle: { fontSize: 14, color: W.text, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  libAuthor: { fontSize: 11, color: W.textFaint, fontFamily: "Inter_400Regular", marginTop: 2 },
  libBody: { fontSize: 12, color: W.textMid, fontFamily: "Inter_400Regular", lineHeight: 18, marginTop: 6 },
  libMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap" },
  libTag: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
    backgroundColor: W.goldFaint, borderWidth: 1, borderColor: W.cardBorder,
  },
  libTagText: { fontSize: 10, color: W.goldLight, fontFamily: "Inter_600SemiBold" },
  libMeta: { fontSize: 11, color: W.textFaint, fontFamily: "Inter_400Regular" },
  libActions: {
    flexDirection: "row", gap: 18, marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: W.cardBorder,
  },
  libActionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  libActionText: { fontSize: 12, color: W.textFaint, fontFamily: "Inter_500Medium" },

  // Reader modal
  readerOverlay: { flex: 1, justifyContent: "flex-end" },
  readerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(43, 31, 8, 0.45)" },
  readerSheet: {
    backgroundColor: W.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32, borderWidth: 1, borderColor: W.cardBorder,
  },
  readerHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 14,
  },
  readerTitle: { fontSize: 20, color: W.text, fontFamily: "Inter_700Bold", lineHeight: 28 },
  readerAuthor: { fontSize: 12, color: W.goldLight, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  readerNote: {
    fontSize: 12, color: W.textFaint, fontFamily: "Inter_400Regular",
    fontStyle: "italic", marginTop: 10,
  },
  readerBody: {
    fontSize: 15, color: W.textMid, fontFamily: "Inter_400Regular",
    lineHeight: 24, marginTop: 14,
  },
  readerFooter: {
    flexDirection: "row", gap: 12, marginTop: 18, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: W.cardBorder,
  },
  readerFooterBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100,
    backgroundColor: W.goldFaint, borderWidth: 1, borderColor: W.cardBorder,
  },
  readerFooterText: { fontSize: 13, color: W.textMid, fontFamily: "Inter_600SemiBold" },

  // Continue rows
  contRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  contIconWrap: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: W.goldFaint, borderWidth: 1, borderColor: W.cardBorder,
    alignItems: "center", justifyContent: "center",
  },
  contTitle: { fontSize: 13, color: W.text, fontFamily: "Inter_600SemiBold" },
  progressTrack: {
    height: 5, borderRadius: 3, backgroundColor: W.goldFaint, marginTop: 6,
    overflow: "hidden",
  },
  progressFill: { height: 5, borderRadius: 3, backgroundColor: W.gold },
  contMeta: { fontSize: 10, color: W.textFaint, fontFamily: "Inter_500Medium", marginTop: 4 },

  // Recently opened
  recentRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  recentTitle: { flex: 1, fontSize: 13, color: W.text, fontFamily: "Inter_500Medium" },
  recentMeta: { fontSize: 11, color: W.textFaint, fontFamily: "Inter_400Regular" },

  // Downloads
  dlRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  dlMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  dlTitle: { flex: 1, fontSize: 13, color: W.text, fontFamily: "Inter_500Medium" },
  dlMeta: { fontSize: 11, color: W.textFaint, fontFamily: "Inter_400Regular" },
});
