export interface SadhanaPractice {
  id: string;
  name: string;
  emoji: string;
  meaning: string;
  defaultDurationMins: number;
  steps: string[];
  timerPrompts: string[];
  icon: string;
  color: string;
}

export const PRACTICES: SadhanaPractice[] = [
  {
    id: "silent-meditation",
    name: "Silent Meditation",
    emoji: "🕯️",
    meaning: "Sit in stillness. Let the mind settle like a still lake.",
    defaultDurationMins: 10,
    steps: [
      "Find a comfortable seated position, spine upright, hands resting on the knees.",
      "Close your eyes. Let the body relax completely — face, shoulders, chest.",
      "Observe the natural breath without controlling it. Just watch.",
      "When thoughts arise, simply notice them as passing clouds. Do not fight them.",
      "Rest in the awareness that remains when thought becomes still.",
    ],
    timerPrompts: ["Be still", "Just observe", "Rest in awareness", "Let thoughts pass like clouds", "Nothing to do — just be"],
    icon: "eye-outline",
    color: "#7B9EA8",
  },
  {
    id: "self-enquiry",
    name: "Self-Enquiry",
    emoji: "❓",
    meaning: "Turn attention back to the one who is aware.",
    defaultDurationMins: 10,
    steps: [
      "Sit comfortably. Let the breath settle for a few moments.",
      "When a thought appears, ask inwardly: 'To whom has this thought come?'",
      "The answer will be: 'To me.' Then ask: 'Who am I?'",
      "Notice the feeling of 'I' — not the name or body, but the raw sense of being.",
      "Rest there, in that feeling, without trying to answer intellectually.",
    ],
    timerPrompts: ["Who am I?", "To whom does this thought arise?", "Rest as awareness", "Notice the one who notices", "I am"],
    icon: "help-circle-outline",
    color: "#A89E7B",
  },
  {
    id: "japa",
    name: "Japa",
    emoji: "📿",
    meaning: "Sacred repetition of the divine name — the simplest path to stillness.",
    defaultDurationMins: 10,
    steps: [
      "Sit quietly. Hold your mala if you have one, or simply count in the mind.",
      "Choose your mantra: Om Namah Shivaya or Arunachala Shiva.",
      "Repeat the mantra gently — silently or as a soft whisper.",
      "Let each repetition be complete. Do not rush.",
      "When the mind wanders, the mantra itself will bring you back.",
    ],
    timerPrompts: ["Om Namah Shivaya", "Arunachala Shiva", "Arunachala Shiva, Arunachala Shiva", "Om Namah Shivaya", "Just the name"],
    icon: "radio-button-on",
    color: "#C2A24E",
  },
  {
    id: "pranayama",
    name: "Pranayama",
    emoji: "🍃",
    meaning: "Breath regulation that calms the mind and steadies the life force.",
    defaultDurationMins: 5,
    steps: [
      "Sit upright. Relax the shoulders, jaw, and hands.",
      "Breathe in through the nose — slowly, for 4 counts.",
      "Hold the breath gently — for 2 counts. No strain.",
      "Exhale fully through the nose — for 6 counts.",
      "Pause for 2 counts before the next inhale. This is one cycle.",
    ],
    timerPrompts: ["Inhale... 1, 2, 3, 4", "Hold... 1, 2", "Exhale... 1, 2, 3, 4, 5, 6", "Rest... 1, 2", "Inhale again, gently"],
    icon: "leaf-outline",
    color: "#7BAE8C",
  },
  {
    id: "silence",
    name: "Silence Practice",
    emoji: "🔕",
    meaning: "Bhagavan's deepest teaching was silence. In silence, He still speaks.",
    defaultDurationMins: 10,
    steps: [
      "Sit or lie comfortably. Let the body completely release.",
      "Set the intention: 'I give myself fully to this silence.'",
      "Do not try to meditate. Do not try to stop thoughts.",
      "Simply be present. Let everything be exactly as it is.",
      "When the time ends, move slowly. Carry the silence with you.",
    ],
    timerPrompts: ["Just be", "Nothing to do", "Nothing to fix", "Simply here", "Let everything be"],
    icon: "moon-outline",
    color: "#8B88A8",
  },
  {
    id: "walking-meditation",
    name: "Walking Meditation",
    emoji: "🚶",
    meaning: "Every step on Arunachala's ground is a prayer. Move as if the earth is sacred.",
    defaultDurationMins: 20,
    steps: [
      "Before walking, pause and set your intention. Bring hands together.",
      "Begin to walk — at half your normal pace or slower.",
      "Feel each step completely: heel, arch, toes meeting the ground.",
      "Sync your mantra with your steps — one syllable per step.",
      "At the end, pause. Offer the walk in silent gratitude.",
    ],
    timerPrompts: ["Feel each step", "Om (left) Na (right) Mah (left) Shi (right) Va (left) Ya (right)", "Move with awareness", "Each step is sacred", "Walk as prayer"],
    icon: "walk-outline",
    color: "#A87B5A",
  },
  {
    id: "chanting",
    name: "Chanting",
    emoji: "🎵",
    meaning: "Let the divine name dissolve the sense of separation.",
    defaultDurationMins: 10,
    steps: [
      "Begin with a moment of complete silence.",
      "Start with Om — three times, slowly, letting each one resonate fully.",
      "Then chant Om Namah Shivaya or Arunachala Shiva — aloud or silently.",
      "Let the sound fill the chest and throat. Don't rush.",
      "Close with three slow Oms. Then sit in the silence that follows.",
    ],
    timerPrompts: ["Om", "Om Namah Shivaya", "Arunachala Shiva, Arunachala Shiva", "Let the name carry you", "Om Namah Shivaya"],
    icon: "musical-note-outline",
    color: "#A87B8C",
  },
  {
    id: "arunachala-remembrance",
    name: "Arunachala Remembrance",
    emoji: "⛰️",
    meaning: "The hill is not just a place. It is a living presence. Remember it anywhere.",
    defaultDurationMins: 10,
    steps: [
      "Close your eyes. Breathe three times slowly.",
      "Bring the image of Arunachala into your mind — the red hill, the vast sky, the deep silence.",
      "Feel its presence as if you are standing before it right now.",
      "Offer whatever you are carrying — grief, fear, confusion, gratitude — to the hill.",
      "Rest in the feeling that Arunachala receives everything. Nothing is refused.",
    ],
    timerPrompts: ["See the hill", "Feel its presence", "Offer what you carry", "Rest in its embrace", "Arunachala holds you"],
    icon: "image-outline",
    color: "#B87B5A",
  },
];

export function getPracticeById(id: string): SadhanaPractice | undefined {
  return PRACTICES.find((p) => p.id === id);
}

export const DURATION_OPTIONS = [5, 10, 20, 30, 60];

export const REFLECTION_PROMPTS = [
  "What changed after this practice?",
  "What disturbed your peace today?",
  "What did you notice within?",
  "What are you grateful for right now?",
  "What will you carry into the rest of your day?",
];

export const ROUTINES = [
  {
    name: "Morning Sadhana",
    icon: "sunny-outline",
    practices: [
      { id: "silence", mins: 1 },
      { id: "japa", mins: 3 },
      { id: "self-enquiry", mins: 1 },
    ],
    totalMins: 5,
    description: "A gentle 5-minute morning beginning",
  },
  {
    name: "Daily Foundation",
    icon: "leaf-outline",
    practices: [
      { id: "pranayama", mins: 2 },
      { id: "silent-meditation", mins: 5 },
      { id: "self-enquiry", mins: 3 },
    ],
    totalMins: 10,
    description: "10 minutes to anchor your day",
  },
  {
    name: "Deep Practice",
    icon: "moon-outline",
    practices: [
      { id: "pranayama", mins: 5 },
      { id: "silent-meditation", mins: 10 },
      { id: "self-enquiry", mins: 5 },
    ],
    totalMins: 20,
    description: "20-minute full morning sadhana",
  },
  {
    name: "Full Sadhana",
    icon: "star-outline",
    practices: [
      { id: "pranayama", mins: 10 },
      { id: "silent-meditation", mins: 20 },
      { id: "self-enquiry", mins: 20 },
      { id: "silence", mins: 10 },
    ],
    totalMins: 60,
    description: "The complete one-hour practice",
  },
];
