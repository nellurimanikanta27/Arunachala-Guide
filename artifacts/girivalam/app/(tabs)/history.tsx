import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  Alert,
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

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Section {
  id: string;
  title: string;
  icon: string;
  iconFamily: "Ionicons" | "MaterialCommunityIcons";
  content: string;
}

const HISTORY_SECTIONS: Section[] = [
  {
    id: "arunachala",
    title: "Arunachala — The Sacred Hill",
    icon: "flame",
    iconFamily: "Ionicons",
    content:
      'Arunachala, also known as Annamalai, is one of the holiest sites in Shaivism. Located in Tiruvannamalai, Tamil Nadu, the hill is considered a manifestation of Lord Shiva himself — specifically as a column of fire (Jyotirlinga). The name "Arunachala" means "the Red Mountain" or "the Hill of Light" in Tamil.\n\nAccording to the Skanda Purana, when Brahma and Vishnu quarreled over supremacy, Shiva appeared as an infinite pillar of fire. Unable to find its top or bottom, they surrendered, and Shiva manifested as the Arunachala hill as a lasting symbol of that divine light.',
  },
  {
    id: "girivalam",
    title: "The Sacred Practice of Girivalam",
    icon: "walk",
    iconFamily: "Ionicons",
    content:
      "Girivalam (also called Pradakshina) is the act of circumambulating Arunachala Hill in a clockwise direction. The path is approximately 14 kilometers long, passing through temples, shrines, water tanks, and the eight directional Shivalingams.\n\nThe practice dates back thousands of years and is mentioned in ancient Tamil texts like Tevaram and Thiruvachagam. Saints and sages including Ramana Maharshi, Seshadri Swamigal, and countless others walked this sacred path regularly.\n\nPilgrims traditionally walk barefoot as a sign of surrender, though footwear is permitted for those with health needs.",
  },
  {
    id: "pournami",
    title: "Pournami — The Full Moon Night",
    icon: "moon",
    iconFamily: "Ionicons",
    content:
      "Pournami (full moon) Girivalam is considered especially auspicious. On full moon nights, hundreds of thousands of pilgrims gather to walk the path from dusk to dawn. The atmosphere is one of extraordinary spiritual energy — with chanting, oil lamps, incense, and a river of devotees moving together in devotion.\n\nMajor festivals like Karthigai Deepam draw millions when a massive fire beacon is lit atop Arunachala, visible from miles away. Thaipusam, Shivaratri, and other festivals also attract large crowds for the Girivalam.",
  },
  {
    id: "ramana",
    title: "Ramana Maharshi & Arunachala",
    icon: "person",
    iconFamily: "Ionicons",
    content:
      "Sri Ramana Maharshi (1879–1950) arrived at Arunachala as a young boy of 16 following a spontaneous spiritual awakening. He spent the rest of his life at the foot of this hill, teaching the path of Self-inquiry (Atma Vichara).\n\nRamana described Arunachala as the spiritual heart of the world and walked the Girivalam regularly, often spending entire nights in meditation along the path. His ashram, Sri Ramanasramam, remains an active spiritual center at the base of the hill and welcomes visitors from all over the world.",
  },
  {
    id: "temple",
    title: "Arunachaleswarar Temple",
    icon: "business",
    iconFamily: "Ionicons",
    content:
      'The Arunachaleswarar Temple (also called Annamalaiyar Temple) is one of the largest Hindu temples in the world, covering 10 hectares with 4 tall gopurams (gateway towers). The tallest eastern tower stands at 66 meters, making it one of the tallest temple towers in South India.\n\nThe main deity is Lord Shiva as "Annamalaiyar" (Arunachaleswarar) and the Goddess Parvati as "Unnamalai Amman." The temple was built over many centuries, with significant contributions from the Chola, Vijayanagara, and later dynasties. It is an active place of worship open to all.',
  },
];

const MEDITATIONS = [
  {
    id: "breathing",
    title: "Walking Meditation",
    duration: "During walk",
    description:
      "With each step, mentally repeat 'Shiva, Shiva' or 'Om Namah Shivaya.' Feel the earth beneath your feet and let each footfall be an offering. Keep your awareness gently on the hill, returning attention whenever the mind wanders.",
  },
  {
    id: "self-inquiry",
    title: "Self-Inquiry (Atma Vichara)",
    duration: "Any time",
    description:
      "As taught by Ramana Maharshi: quietly ask yourself 'Who am I?' Don't seek an intellectual answer — simply turn attention inward to the source of the question. Rest in the natural silence that remains when thought subsides.",
  },
  {
    id: "surrender",
    title: "Surrender Meditation",
    duration: "5–15 min",
    description:
      "Sit quietly, close your eyes, and mentally offer all your worries, desires, and problems to Lord Arunachala. Visualize each thought as a leaf being placed at the feet of the mountain. Feel the lightness of surrender and rest in presence.",
  },
  {
    id: "chanting",
    title: "Mantra Chanting",
    duration: "Any duration",
    description:
      "Chant or silently repeat 'Arunachala Shiva, Arunachala Shiva' — the mantra given by Ramana Maharshi. This single mantra is said to contain the entire teaching of Arunachala. Let it rhythm naturally with your breath.",
  },
];

function ExpandableSection({ section }: { section: Section }) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  return (
    <Pressable style={styles.historyCard} onPress={toggle} accessibilityRole="button">
      <View style={styles.historyCardHeader}>
        <View style={styles.historyIconWrap}>
          {section.iconFamily === "Ionicons" ? (
            <Ionicons name={section.icon as any} size={20} color={Colors.saffron} />
          ) : (
            <MaterialCommunityIcons name={section.icon as any} size={20} color={Colors.saffron} />
          )}
        </View>
        <Text style={styles.historyCardTitle}>{section.title}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.textLight}
        />
      </View>
      {expanded && <Text style={styles.historyCardContent}>{section.content}</Text>}
    </Pressable>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;

  const openYouTube = () => {
    Linking.openURL(
      "https://www.youtube.com/results?search_query=Arunachala+Girivalam+meditation"
    ).catch(() => Alert.alert("Cannot open link", "Please check your internet connection."));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: bottomInset + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.bannerCard}>
        <MaterialCommunityIcons name="om" size={40} color={Colors.amberLight} />
        <View style={styles.bannerText}>
          <Text style={styles.bannerQuote}>
            "Arunachala! Thou dost root out the ego of those who meditate on Thee in the heart."
          </Text>
          <Text style={styles.bannerAuthor}>— Ramana Maharshi</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>History & Significance</Text>
      <Text style={styles.sectionDesc}>Tap any section to expand</Text>
      {HISTORY_SECTIONS.map((section) => (
        <ExpandableSection key={section.id} section={section} />
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Meditation Practices</Text>
      <Text style={styles.sectionDesc}>
        Traditional practices for walking the Girivalam path
      </Text>
      {MEDITATIONS.map((med) => (
        <View key={med.id} style={styles.medCard}>
          <View style={styles.medHeader}>
            <MaterialCommunityIcons name="meditation" size={20} color={Colors.purple} />
            <Text style={styles.medTitle}>{med.title}</Text>
            <View style={styles.medBadge}>
              <Text style={styles.medBadgeText}>{med.duration}</Text>
            </View>
          </View>
          <Text style={styles.medDesc}>{med.description}</Text>
        </View>
      ))}

      <Pressable style={styles.videoBtn} onPress={openYouTube} accessibilityRole="button">
        <Ionicons name="play-circle" size={24} color={Colors.white} />
        <View>
          <Text style={styles.videoBtnTitle}>Watch & Listen</Text>
          <Text style={styles.videoBtnSub}>Girivalam videos & meditation audio on YouTube</Text>
        </View>
        <Ionicons name="open-outline" size={18} color="rgba(255,255,255,0.7)" />
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  content: {
    padding: 16,
  },
  bannerCard: {
    backgroundColor: Colors.brown,
    borderRadius: 18,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 24,
  },
  bannerText: {
    flex: 1,
  },
  bannerQuote: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.9)",
    lineHeight: 21,
    fontStyle: "italic",
    marginBottom: 8,
  },
  bannerAuthor: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.amberLight,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.brown,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    marginBottom: 14,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 2,
  },
  historyCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  historyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.overlayLight,
    alignItems: "center",
    justifyContent: "center",
  },
  historyCardTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.brown,
  },
  historyCardContent: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    lineHeight: 20,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.creamDark,
  },
  medCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.purple,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 2,
  },
  medHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  medTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.brown,
  },
  medBadge: {
    backgroundColor: "rgba(107, 58, 138, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  medBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.purple,
  },
  medDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    lineHeight: 20,
  },
  videoBtn: {
    backgroundColor: Colors.saffronDark,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 16,
  },
  videoBtnTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  videoBtnSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.72)",
    marginTop: 2,
  },
});
