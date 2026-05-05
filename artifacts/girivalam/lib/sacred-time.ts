const LUNAR_CYCLE = 29.530589;
const REFERENCE_NEW_MOON = new Date("2025-01-06T23:56:00Z");

const SHUKLA_TITHIS = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashti", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Purnima",
];
const KRISHNA_TITHIS = [
  "Pratipada", "Dvitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashti", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dvadashi", "Trayodashi", "Chaturdashi", "Amavasya",
];

const MOON_PHASES = [
  { name: "New Moon", emoji: "🌑", min: 0, max: 1.85 },
  { name: "Waxing Crescent", emoji: "🌒", min: 1.85, max: 7.38 },
  { name: "First Quarter", emoji: "🌓", min: 7.38, max: 11.07 },
  { name: "Waxing Gibbous", emoji: "🌔", min: 11.07, max: 14.77 },
  { name: "Full Moon", emoji: "🌕", min: 14.77, max: 16.61 },
  { name: "Waning Gibbous", emoji: "🌖", min: 16.61, max: 22.15 },
  { name: "Last Quarter", emoji: "🌗", min: 22.15, max: 25.84 },
  { name: "Waning Crescent", emoji: "🌘", min: 25.84, max: 29.53 },
];

export function getMoonAge(now = new Date()): number {
  const ms = now.getTime() - REFERENCE_NEW_MOON.getTime();
  const days = ms / (1000 * 60 * 60 * 24);
  return ((days % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
}

export function getMoonPhase(now = new Date()): {
  name: string;
  emoji: string;
  age: number;
  percent: number;
} {
  const age = getMoonAge(now);
  const phase = MOON_PHASES.find((p) => age >= p.min && age < p.max) ?? MOON_PHASES[0];
  const percent = Math.round(
    age <= LUNAR_CYCLE / 2
      ? (age / (LUNAR_CYCLE / 2)) * 100
      : ((LUNAR_CYCLE - age) / (LUNAR_CYCLE / 2)) * 100
  );
  return { name: phase.name, emoji: phase.emoji, age, percent };
}

export function getTithi(now = new Date()): {
  number: number;
  name: string;
  paksha: "Shukla" | "Krishna";
  emoji: string;
} {
  const age = getMoonAge(now);
  const tithi = Math.floor((age / LUNAR_CYCLE) * 30) + 1;
  const clamped = Math.min(tithi, 30);
  if (clamped <= 15) {
    return {
      number: clamped,
      name: SHUKLA_TITHIS[clamped - 1],
      paksha: "Shukla",
      emoji: "🌔",
    };
  }
  const k = clamped - 15;
  return {
    number: k,
    name: KRISHNA_TITHIS[k - 1],
    paksha: "Krishna",
    emoji: "🌘",
  };
}

export function getNextPournami(now = new Date()): Date {
  const age = getMoonAge(now);
  const daysToFull = age < 14.77
    ? 14.77 - age
    : LUNAR_CYCLE - age + 14.77;
  const next = new Date(now.getTime() + daysToFull * 24 * 60 * 60 * 1000);
  return next;
}

export function getPournamiCountdown(now = new Date()): {
  days: number;
  hours: number;
  label: string;
  isToday: boolean;
  isNear: boolean;
} {
  const next = getNextPournami(now);
  const diffMs = next.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const days = Math.floor(diffHours / 24);
  const hours = Math.floor(diffHours % 24);
  const isToday = days === 0;
  const isNear = days <= 3;
  const label =
    isToday
      ? "Pournami tonight! 🌕"
      : days === 1
      ? "Pournami tomorrow 🌔"
      : `Pournami in ${days} days`;
  return { days, hours, label, isToday, isNear };
}

export function getPournamiDate(now = new Date()): string {
  const next = getNextPournami(now);
  return next.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const RAMANA_QUOTES = [
  "The degree of freedom from unwanted thoughts and the degree of concentration on a single thought are the measures to gauge spiritual progress.",
  "Happiness is your nature. It is not wrong to desire it. What is wrong is seeking it outside when it is inside.",
  "Your own Self-realization is the greatest service you can render the world.",
  "The mind turned inwards is the Self; turned outwards, it becomes the ego and the world.",
  "Silence is the ocean in which all rivers of thought dissolve.",
  "There is nothing wrong with God's creation. Mystery and suffering only exist in the mind.",
  "The Self alone exists and is real. The world, the individual, and God are, like the illusory silver in the mother-of-pearl, imaginary creations in the Self.",
  "Arunachala! Thou dost root out the ego of those who meditate on Thee in the heart.",
  "Be still. Stillness reveals the secrets of eternity.",
  "Who am I? Not this body, not this mind. I am That which witnesses all.",
  "God, Guru, and the Self are the same. Surrender to any one of them.",
  "The thought 'I am not doing Sadhana' is the only obstacle. Just be.",
  "The effort to remain still is also meditation. The real state of stillness is effortless.",
  "All that is required to realize the Self is to be still. What can be easier than that?",
  "The present moment always will have been. Rest in what is.",
  "The world is not an obstacle. Only the sense of being a separate self is.",
  "Arunachala is Shiva in the form of a hill. By merely thinking of it, liberation is assured.",
  "Grace is always present. You imagine it is not available. It is due to your non-perception of it.",
  "Mind is consciousness which has put on limitations. You are originally unlimited.",
  "The soul which has no thoughts of its own is the pure Self.",
  "Turn your vision inward and then the whole world will be full of supreme Spirit.",
  "If the mind falls asleep, awaken it. Then if it starts wandering, quieten it. Thus the mind must be kept in the Self.",
  "The feeling 'I am' is the first thought. The thinker of thoughts is itself a thought.",
  "No thought, no 'I.' Where the 'I' is not, That alone IS.",
  "Walk humbly. The hill of Arunachala burns away all impurities in the fire of Jnana.",
  "Every living being longs for happiness. True happiness requires the discovery of the True Self.",
  "When you know yourself, God is there. They are not two.",
  "Silence is ever-speaking; it is the perennial flow of language, interrupted by speaking.",
  "There is no greater mystery than this — that being the Reality, we seek to gain Reality.",
  "The heart is the hub of all sacred places. Go there and roam.",
];

export function getDailyQuote(now = new Date()): string {
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return RAMANA_QUOTES[dayOfYear % RAMANA_QUOTES.length];
}

export function getTodayName(now = new Date()): string {
  return now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}
