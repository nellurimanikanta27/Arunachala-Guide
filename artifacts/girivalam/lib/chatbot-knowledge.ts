export interface KnowledgeEntry {
  keywords: string[];
  answer: string;
}

export const GREETING_RESPONSES = [
  "🙏 Namaste! I'm your Girivalam Guide. Ask me anything about Arunachala, the 8 lingams, ashrams, festivals, or pilgrimage tips.",
  "🕉️ Welcome, pilgrim! How can I help your Girivalam journey today?",
];

export const FALLBACK_RESPONSE =
  "I don't have a direct answer for that yet 🙏. Try asking about: the Girivalam route, the 8 lingams, ashrams (Ramana, Seshadri), Pournami, festivals, what to carry, or where to find food and water on the path.";

export const SUGGESTED_PROMPTS = [
  "What is Girivalam?",
  "Best time to walk?",
  "Tell me about the 8 lingams",
  "What is Pournami Girivalam?",
  "Where can I get free food?",
  "Who was Ramana Maharshi?",
  "What to carry for the walk?",
  "Tell me about Karthigai Deepam",
];

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: ["what is girivalam", "girivalam meaning", "girivalam means", "about girivalam"],
    answer:
      "🛕 Girivalam means 'circumambulating the hill' (Giri = hill, Valam = around). It is the sacred 14 km walk around Arunachala Hill in Tiruvannamalai. Devotees believe walking barefoot around the hill brings blessings, removes karma, and grants liberation. Each step is considered a prayer.",
  },
  {
    keywords: ["how long", "distance", "how many km", "kilometers", "duration", "how much time", "how many hours"],
    answer:
      "🚶 The Girivalam path is about 14 km (8.7 miles) long. Walking at a normal pace takes 3 to 5 hours. With prayers, breaks at temples, and food stops, allow 5 to 7 hours for a complete pilgrimage.",
  },
  {
    keywords: ["best time", "when to walk", "when should", "what time", "pournami time"],
    answer:
      "🌅 Best times for Girivalam:\n• Early morning: 4:00 AM – 7:00 AM (cool, peaceful)\n• Evening: After 6:00 PM (cooler, beautiful sunset over the hill)\n• Pournami nights are most auspicious — start by 7 PM\n\nAvoid 11 AM – 4 PM (very hot on barefoot path).",
  },
  {
    keywords: ["direction", "which side", "clockwise", "anti-clockwise", "way to walk", "path direction"],
    answer:
      "🔄 Girivalam is always done in a clockwise direction (pradakshina). Start at Arunachaleswarar Temple, then move toward the East and continue around the hill, ending where you started. Keep the hill always on your right.",
  },
  {
    keywords: ["barefoot", "shoes", "footwear", "chappal"],
    answer:
      "👣 Tradition says Girivalam should be done barefoot to receive full spiritual benefit and connect with the sacred earth around Arunachala. The path is paved tar road, mostly safe for bare feet. If you have foot problems, soft chappals are acceptable — devotion matters most.",
  },
  {
    keywords: ["8 lingam", "eight lingam", "ashta lingam", "lingams", "lingas"],
    answer:
      "🕉️ The 8 Sacred Lingams (Ashta Lingams) on the Girivalam path represent the 8 directions:\n\n1. Indra Lingam – East\n2. Agni Lingam – South-East (fire)\n3. Yama Lingam – South\n4. Niruthi Lingam – South-West\n5. Varuna Lingam – West (water)\n6. Vayu Lingam – North-West (wind)\n7. Kubera Lingam – North (prosperity)\n8. Isanya Lingam – North-East\n\nWorshipping each brings blessings of that direction.",
  },
  {
    keywords: ["indra lingam"],
    answer: "🕉️ Indra Lingam is the first lingam, located in the East near the main Arunachaleswarar Temple entrance. Indra is the king of devas, and worshipping here brings power and authority.",
  },
  {
    keywords: ["agni lingam"],
    answer: "🔥 Agni Lingam is in the South-East, representing the fire element. It's near the Kottai area, about 2 km from start. Worship here purifies negative karma.",
  },
  {
    keywords: ["yama lingam"],
    answer: "⚖️ Yama Lingam stands in the South, about 3.5 km from start. Yama is the lord of dharma. Worship here removes fear of death and brings righteousness.",
  },
  {
    keywords: ["niruthi lingam", "nirudhi lingam"],
    answer: "🛡️ Niruthi Lingam marks the South-West, about 5 km from start. Worship here protects from evil influences and negative energies.",
  },
  {
    keywords: ["varuna lingam"],
    answer: "💧 Varuna Lingam is in the West, about 7 km on the path. Varuna is the water god — worship here brings rain, prosperity, and emotional balance.",
  },
  {
    keywords: ["vayu lingam"],
    answer: "🌬️ Vayu Lingam is in the North-West (wind element), about 9 km along the path through scenic forest sections. Worship here gives good health and longevity.",
  },
  {
    keywords: ["kubera lingam"],
    answer: "💰 Kubera Lingam is in the North, about 11 km from start. Kubera is the lord of wealth — devotees pray here for prosperity and abundance.",
  },
  {
    keywords: ["isanya lingam", "isana lingam"],
    answer: "🌟 Isanya Lingam is the last major shrine, in the North-East, about 13 km in. It represents Lord Shiva himself — worship here grants spiritual liberation.",
  },
  {
    keywords: ["arunachala", "arunachaleswarar", "annamalai", "hill significance", "sacred mountain"],
    answer:
      "⛰️ Arunachala Hill is considered the embodiment of Lord Shiva himself — a fire lingam that took the form of a mountain. Sages call it the 'spiritual heart of the world.' Even just looking at it (Darshan) is said to be liberating. Sri Ramana Maharshi taught that simply being near Arunachala destroys the ego.",
  },
  {
    keywords: ["ramana", "ramana maharshi", "bhagavan ramana", "who was ramana"],
    answer:
      "🧘 Sri Ramana Maharshi (1879–1950) was one of India's greatest sages. At age 16, he had a profound death experience and went to Arunachala, never leaving for 54 years. He taught 'Self-Inquiry' (Who am I?) — a path of direct self-knowledge. His ashram (Sri Ramanasramam) is on the south side of the hill and welcomes all visitors.",
  },
  {
    keywords: ["seshadri", "seshadri swamigal"],
    answer:
      "🧘 Sri Seshadri Swamigal (1870–1929) was a great saint of Tiruvannamalai, considered an avatar of Lord Subramanya. Known as the 'Saint of Tiruvannamalai,' he lived around Arunachala and was a contemporary of Ramana Maharshi. His ashram is next to Ramana Ashram and serves free food at noon.",
  },
  {
    keywords: ["yogi ramsuratkumar", "ramsuratkumar"],
    answer:
      "🙏 Yogi Ramsuratkumar (1918–2001) was a beloved saint of Tiruvannamalai known as the 'Beggar Saint.' He spent decades in Arunachala. His ashram is on the south-east side of the Girivalam path and is open to all devotees.",
  },
  {
    keywords: ["skandashram", "skanda ashram"],
    answer: "🛖 Skandashram is a sacred cave on Arunachala Hill where Sri Ramana Maharshi lived from 1916 to 1922. It's accessed by climbing up from Sri Ramanasramam (about 30 minutes uphill). The cave has wonderful energy for meditation and offers stunning views.",
  },
  {
    keywords: ["virupaksha", "virupaksha cave"],
    answer: "🛖 Virupaksha Cave is where Sri Ramana Maharshi spent 17 years in deep meditation. It's just below Skandashram on the hill. The cave is shaped like Om and is one of the most spiritually charged places at Arunachala.",
  },
  {
    keywords: ["pournami", "full moon", "pournami girivalam"],
    answer:
      "🌕 Pournami (Full Moon) Girivalam is the most auspicious time to do the walk. Lakhs of pilgrims gather every full moon night. Spiritual energies are believed to be at their peak. Walking with the crowd is safe — start by 7 PM, carry water, wear comfortable clothes, and stay alert in busy sections.",
  },
  {
    keywords: ["karthigai", "karthigai deepam", "deepam"],
    answer:
      "🪔 Karthigai Deepam is the most important festival at Arunachala (November–December). A massive ghee lamp is lit on top of the hill at dusk and burns for 10 days, visible for miles. Lakhs of devotees come for darshan. The festival celebrates Shiva appearing as the column of fire (Arunachala itself).",
  },
  {
    keywords: ["shivaratri", "maha shivaratri", "shiva ratri"],
    answer:
      "🌑 Maha Shivaratri (Feb–Mar) is a great night to do Girivalam. Devotees fast and stay awake all night chanting 'Om Namah Shivaya,' worshipping at the temple, and walking around the hill.",
  },
  {
    keywords: ["thaipusam", "thai pusam"],
    answer: "🕉️ Thaipusam (Jan–Feb) celebrates Lord Murugan and is celebrated grandly at Arunachala. Many devotees do Girivalam carrying kavadi as an offering.",
  },
  {
    keywords: ["what to carry", "what to bring", "items needed", "checklist"],
    answer:
      "🎒 Essentials for Girivalam:\n• Water bottle (1–2 liters)\n• Small snacks (fruits, biscuits)\n• Torch / phone flashlight\n• Comfortable cotton clothes\n• A small towel\n• Some cash (₹100–500) for offerings\n• Phone with this app 😊\n• Foot care cream (after walk)\n• Optional: prayer beads, hand fan",
  },
  {
    keywords: ["dress", "clothing", "what to wear", "attire"],
    answer:
      "👕 Wear modest, traditional clothes:\n• Men: dhoti, kurta, or simple pants & shirt\n• Women: saree, churidar, or salwar kameez\n• Avoid shorts, sleeveless, or revealing clothes inside the temple\n• Choose light, breathable cotton — you'll be walking 14 km",
  },
  {
    keywords: ["safe", "safety", "is it safe", "alone", "women safety"],
    answer:
      "🛡️ Girivalam is generally very safe, even at night during Pournami when thousands of pilgrims walk together.\n\nTips:\n• Walk with friends or family if possible\n• Stay on the main path (well-lit)\n• Keep emergency contacts handy\n• Police patrol the route on Pournami nights\n• Avoid carrying heavy gold/valuables",
  },
  {
    keywords: ["food", "annadanam", "free food", "where to eat", "lunch", "dinner"],
    answer:
      "🍛 Free food (Annadanam) is available at:\n• Arunachaleswarar Main Temple (full day)\n• Sri Ramanasramam (9 AM – 10 AM)\n• Seshadri Swamigal Ashram (12 PM onwards)\n\nMany good vegetarian restaurants line the route. Famous: Manna Restaurant, Usha Mess, Dreaming Tree Cafe. Carry small snacks for energy between stops.",
  },
  {
    keywords: ["water", "drinking water", "water points", "thirsty"],
    answer:
      "💧 Drinking water is available at:\n• All major temples on the route\n• Rest stops (East, South, North)\n• Sacred theerthams (for ritual, not drinking)\n• Many shops and Annadanam stalls\n\nCarry your own bottle and refill at safe points.",
  },
  {
    keywords: ["theertham", "sacred tank", "water tank", "siva ganga", "brahma theertham", "agastya theertham", "ayyankulam"],
    answer:
      "💧 Sacred Theerthams (water tanks) at Arunachala:\n• Siva Ganga – inside the main temple\n• Brahma Theertham – created by Lord Brahma\n• Agastya Theertham – linked to Sage Agastya\n• Ayyankulam – large bathing tank\n\nDevotees bathe here for purification before darshan.",
  },
  {
    keywords: ["toilet", "restroom", "bathroom", "rest stop"],
    answer:
      "🚻 Public toilets are available at:\n• Main Arunachaleswarar Temple\n• Ramana Ashram\n• Three rest stops on the path (East, South, North)\n• Many restaurants along the route\n\nDuring Pournami, additional temporary facilities are set up.",
  },
  {
    keywords: ["medical", "first aid", "hospital", "emergency", "help"],
    answer:
      "🏥 Medical help:\n• On Pournami nights, first-aid posts are set up along the route\n• Government Hospital Tiruvannamalai – central area\n• Annamalaiyar Hospital – modern facility\n• Emergency: dial 108 (free ambulance in India)\n• Most temples have basic first-aid kits",
  },
  {
    keywords: ["parking", "where to park", "park vehicle", "car parking"],
    answer:
      "🅿️ Pilgrim parking is available near the East entrance of Arunachaleswarar Temple. On Pournami, special parking lots open at the four corners of the town. Two-wheelers can park closer; cars at designated lots. Walk or take an auto from there.",
  },
  {
    keywords: ["how to reach", "travel", "transport", "bus", "train", "airport", "from chennai", "from bangalore"],
    answer:
      "🚌 Reaching Tiruvannamalai:\n• Train: Tiruvannamalai Railway Station (well-connected)\n• Bus: Frequent buses from Chennai (4 hrs), Bangalore (6 hrs), Pondicherry (3 hrs), Vellore (2 hrs)\n• Airport: Chennai (185 km) or Bangalore (210 km), then bus/taxi\n• By car: Good roads from all major South Indian cities",
  },
  {
    keywords: ["stay", "hotel", "accommodation", "lodge", "where to sleep"],
    answer:
      "🏨 Stay options near Arunachala:\n• Ashrams: Ramana Ashram, Seshadri Ashram (advance booking needed, simple & affordable)\n• Budget lodges: ₹500–1500/night\n• Mid-range hotels: ₹1500–3500/night\n• Premium: Arunai Anantha Resort, Sparsa Resort\n\nBook early for Pournami and Karthigai Deepam.",
  },
  {
    keywords: ["prayer", "mantra", "chant", "what to recite", "om namah", "what to say"],
    answer:
      "🙏 Prayers to chant during Girivalam:\n• 'Om Namah Shivaya' (most powerful Shiva mantra)\n• 'Om Arunachala Shivaya Namaha'\n• 'Arunachala Shiva Arunachala Shiva' (Ramana's chant)\n• Akshara Mana Malai (108 verses by Ramana)\n\nWalk silently if you prefer — the silence of the hill is itself a prayer.",
  },
  {
    keywords: ["temple timing", "temple hours", "darshan time", "main temple time"],
    answer:
      "🛕 Arunachaleswarar Temple timings:\n• Morning: 5:30 AM – 12:30 PM\n• Evening: 3:30 PM – 9:30 PM\n• Special pujas: 6 times daily\n• Pournami: open longer hours\n\nEntry is free. Cameras allowed in some areas only.",
  },
  {
    keywords: ["history", "ancient", "old", "how old", "story", "legend"],
    answer:
      "📜 Arunachala's history goes back thousands of years. Legend says Brahma and Vishnu once argued over who was greater. Shiva appeared as an infinite column of fire (the original Arunachala) to humble them. The Arunachaleswarar Temple was built by Chola kings (9th–10th century) and expanded over 1000+ years.",
  },
  {
    keywords: ["benefits", "why do girivalam", "what is the benefit", "merit", "punya"],
    answer:
      "✨ Spiritual benefits of Girivalam:\n• Removes negative karma from past lives\n• Each step = one prayer\n• Doing 14 km on Pournami = special merit\n• Calms the mind, opens the heart\n• Brings health, prosperity, peace\n• Sages say: 'One Girivalam = one liberation step'",
  },
  {
    keywords: ["weather", "climate", "rain", "season"],
    answer:
      "🌤️ Tiruvannamalai weather:\n• Best season: November – February (cool, pleasant)\n• Hot: March – June (35–40°C)\n• Monsoon: October – November (occasional rain, beautiful greenery)\n• Carry umbrella in monsoon months",
  },
  {
    keywords: ["thanks", "thank you", "thanku", "thanks bot"],
    answer: "🙏 You're welcome! May your Girivalam be blessed with peace and joy. Om Namah Shivaya 🕉️",
  },
  {
    keywords: ["hi", "hello", "hey", "namaste", "vanakkam"],
    answer: "🙏 Namaste! I'm here to guide your Girivalam journey. Ask me anything about Arunachala, the lingams, ashrams, or pilgrimage tips.",
  },
];

export function findAnswer(question: string): string {
  const q = question.toLowerCase().trim();
  if (!q) return FALLBACK_RESPONSE;

  let bestMatch: { entry: KnowledgeEntry; score: number } | null = null;

  for (const entry of KNOWLEDGE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw)) {
        score += kw.length;
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { entry, score };
    }
  }

  return bestMatch ? bestMatch.entry.answer : FALLBACK_RESPONSE;
}
