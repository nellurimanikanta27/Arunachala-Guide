import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HISTORY_SECTIONS = [
  {
    id: "arunachala",
    title: "Arunachala — The Sacred Hill",
    icon: "flame" as const,
    content:
      'Arunachala, also known as Annamalai, is considered the embodiment of Lord Shiva himself — a column of fire (Jyotirlinga) that took form as a hill. The name means "the Hill of Light" or "Red Mountain."\n\nWhen Brahma and Vishnu quarreled over supremacy, Shiva appeared as an infinite pillar of fire. Unable to find its top or bottom, they surrendered. Shiva then manifested as Arunachala — a lasting symbol of divine light. Even gazing at the hill is said to grant liberation.',
  },
  {
    id: "girivalam",
    title: "The Sacred Practice of Girivalam",
    icon: "walk" as const,
    content:
      "Girivalam (Pradakshina) is the act of walking clockwise around Arunachala Hill — approximately 14 km. The path passes through the 8 Shivalingams, sacred temples, water tanks, and ashrams.\n\nThe practice is mentioned in ancient Tamil texts like Tevaram and Thiruvachagam. Saints including Ramana Maharshi, Seshadri Swamigal, and thousands of sages walked this path. Each step taken in surrender is considered a prayer.",
  },
  {
    id: "pournami",
    title: "Pournami — The Full Moon Night",
    icon: "moon" as const,
    content:
      "On Pournami (full moon), hundreds of thousands of pilgrims walk together from dusk to dawn. The atmosphere is extraordinary — oil lamps, incense, chanting, and a river of devotees moving as one.\n\nKarthigai Deepam draws millions when a massive fire beacon is lit atop Arunachala, visible from miles away, symbolizing Shiva as the original column of light.",
  },
  {
    id: "ramana",
    title: "Ramana Maharshi & Arunachala",
    icon: "person" as const,
    content:
      "Sri Ramana Maharshi (1879–1950) arrived at age 16 following a spontaneous spiritual awakening. He spent 54 years at Arunachala, teaching the path of Self-inquiry: 'Who am I?'\n\nRamana described Arunachala as the spiritual heart of the world and walked the Girivalam regularly. His ashram at the foot of the hill welcomes all visitors. He taught that simply being near Arunachala destroys the ego.",
  },
  {
    id: "temple",
    title: "Arunachaleswarar Temple",
    icon: "business" as const,
    content:
      "One of the largest Hindu temples in the world, covering 10 hectares with 4 majestic gopurams. The tallest eastern tower stands at 66 meters. The main deity is Lord Shiva as Annamalaiyar and Goddess Parvati as Unnamalai Amman.\n\nBuilt over centuries by Chola and Vijayanagara kings. Open to all, with pujas held 6 times daily. Entry is free.",
  },
];

function ExpandableSection({ section }: { section: typeof HISTORY_SECTIONS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };
  return (
    <Pressable style={styles.historyCard} onPress={toggle} accessibilityRole="button">
      <View style={styles.historyCardHeader}>
        <View style={styles.historyIconWrap}>
          <Ionicons name={section.icon as any} size={18} color={Colors.primary} />
        </View>
        <Text style={styles.historyCardTitle}>{section.title}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={Colors.textLight} />
      </View>
      {expanded && <Text style={styles.historyCardContent}>{section.content}</Text>}
    </Pressable>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sectionTitle}>History & Significance</Text>
      <Text style={styles.sectionDesc}>Tap any section to expand</Text>
      {HISTORY_SECTIONS.map((section) => (
        <ExpandableSection key={section.id} section={section} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.warmWhite },
  content: { padding: 14, gap: 10 },

  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 2 },
  sectionDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textLight, marginBottom: 6 },

  historyCard: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1, shadowRadius: 3, elevation: 1,
  },
  historyCardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  historyIconWrap: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: Colors.primaryFaint, alignItems: "center", justifyContent: "center",
  },
  historyCardTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  historyCardContent: {
    fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMid, lineHeight: 20,
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
});
