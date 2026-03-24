import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

const CHATGPT_URL = "https://chat.openai.com/?q=";

const SUGGESTED_QUESTIONS = [
  {
    category: "Route",
    icon: "map-outline" as const,
    questions: [
      "What is the best time to do Girivalam?",
      "How long does Girivalam take to complete?",
      "Which direction should I walk Girivalam?",
      "Can I do Girivalam at night?",
    ],
  },
  {
    category: "Spiritual",
    icon: "star-outline" as const,
    questions: [
      "What is the significance of Arunachala Hill?",
      "Who was Ramana Maharshi?",
      "What are the 8 Shivalingams on the path?",
      "What prayers to recite during Girivalam?",
    ],
  },
  {
    category: "Practical",
    icon: "help-circle-outline" as const,
    questions: [
      "What to carry for Girivalam?",
      "Is Girivalam safe during Pournami?",
      "Where are the water points on the route?",
      "How to dress for visiting Arunachala temple?",
    ],
  },
  {
    category: "Festivals",
    icon: "calendar-outline" as const,
    questions: [
      "When is Karthigai Deepam festival?",
      "What happens on Pournami Girivalam?",
      "When is Shivaratri at Tiruvannamalai?",
      "What is Thaipusam at Arunachala?",
    ],
  },
];

function openChatGPT(question: string) {
  const encoded = encodeURIComponent(
    question + " (Context: Arunachala Hill, Tiruvannamalai Girivalam pilgrimage)"
  );
  Linking.openURL(CHATGPT_URL + encoded).catch(() =>
    Alert.alert(
      "Cannot Open Browser",
      "Please check your internet connection and try again."
    )
  );
}

export default function AIGuideScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: bottomInset + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroIconRow}>
          <View style={styles.heroIconBg}>
            <MaterialCommunityIcons
              name="robot-outline"
              size={36}
              color={Colors.blue}
            />
          </View>
        </View>
        <Text style={styles.heroTitle}>AI Pilgrim Guide</Text>
        <Text style={styles.heroDesc}>
          Ask any question about Girivalam, Arunachala, temples, history, or
          practical pilgrimage tips. Powered by ChatGPT.
        </Text>

        <Pressable
          style={styles.openChatBtn}
          onPress={() => openChatGPT("Tell me about Girivalam at Arunachala Tiruvannamalai")}
          accessibilityRole="button"
          accessibilityLabel="Open ChatGPT"
        >
          <Ionicons name="chatbubble-ellipses" size={20} color={Colors.white} />
          <Text style={styles.openChatText}>Open ChatGPT</Text>
          <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Suggested Questions</Text>
      <Text style={styles.sectionDesc}>
        Tap any question to ask it directly in ChatGPT
      </Text>

      {SUGGESTED_QUESTIONS.map((group) => (
        <View key={group.category} style={styles.questionGroup}>
          <View style={styles.groupHeader}>
            <Ionicons name={group.icon} size={16} color={Colors.blue} />
            <Text style={styles.groupTitle}>{group.category}</Text>
          </View>
          {group.questions.map((q, index) => (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.questionCard,
                pressed && styles.questionCardPressed,
              ]}
              onPress={() => openChatGPT(q)}
              accessibilityRole="button"
              accessibilityLabel={q}
            >
              <Text style={styles.questionText}>{q}</Text>
              <Ionicons
                name="arrow-forward-circle"
                size={22}
                color={Colors.blue}
              />
            </Pressable>
          ))}
        </View>
      ))}

      <View style={styles.noteCard}>
        <Ionicons name="information-circle" size={20} color={Colors.amber} />
        <Text style={styles.noteText}>
          This feature opens ChatGPT in your browser with your question
          pre-filled. Internet connection required. You can also access ChatGPT
          directly through their app.
        </Text>
      </View>
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
  heroCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  heroIconRow: {
    marginBottom: 12,
  },
  heroIconBg: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "rgba(26, 95, 170, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.brown,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  openChatBtn: {
    backgroundColor: Colors.blue,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: "100%",
    justifyContent: "center",
  },
  openChatText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
    flex: 1,
    textAlign: "center",
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
    marginBottom: 16,
  },
  questionGroup: {
    marginBottom: 16,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.blue,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  questionCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 2,
  },
  questionCardPressed: {
    backgroundColor: Colors.creamDark,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: Colors.creamDark,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textMid,
    lineHeight: 18,
  },
});
