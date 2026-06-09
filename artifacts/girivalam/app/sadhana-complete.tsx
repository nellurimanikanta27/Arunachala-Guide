import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { REFLECTION_PROMPTS } from "@/lib/sadhana-practices";
import { saveSadhanaSession } from "@/lib/pilgrimage-store";

const G = "#C2A24E";
const GF = "rgba(194,162,78,0.10)";
const GB = "rgba(194,162,78,0.22)";

const COMPLETION_MESSAGES = [
  "You returned to yourself today.",
  "You practiced today. Let the stillness stay with you.",
  "The grace of Arunachala is with you.",
  "Well done. Carry this peace into the day.",
  "You showed up. That is everything.",
];

export default function SadhanaCompleteScreen() {
  const { practiceId, practiceName, practiceEmoji, durationMins } =
    useLocalSearchParams<{
      practiceId: string;
      practiceName: string;
      practiceEmoji: string;
      durationMins: string;
    }>();

  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [saved, setSaved] = useState(false);

  const duration = parseInt(durationMins ?? "0", 10);
  const completionMsg =
    COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];

  async function handleSave() {
    await saveSadhanaSession(
      practiceId ?? "",
      practiceName ?? "",
      duration,
      reflection.trim() || undefined
    );
    setSaved(true);
  }

  function handleContinue() {
    router.replace("/(tabs)/sadhana" as any);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: topInset + 24, paddingBottom: bottomInset + 40 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* ── Completion hero ── */}
      <View style={styles.hero}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={40} color={G} />
        </View>
        <Text style={styles.heroTitle}>Practice Complete</Text>

        <View style={styles.practiceTag}>
          <Text style={styles.practiceEmoji}>{practiceEmoji}</Text>
          <Text style={styles.practiceName}>{practiceName}</Text>
          <Text style={styles.practiceDur}>{duration} min</Text>
        </View>

        <Text style={styles.completionMsg}>"{completionMsg}"</Text>
      </View>

      {/* ── Reflection section ── */}
      {!saved ? (
        <View style={styles.reflectionSection}>
          <Text style={styles.reflectionTitle}>Reflection (optional)</Text>
          <Text style={styles.reflectionSubtitle}>
            A few words can deepen the practice.
          </Text>

          <View style={styles.promptsGrid}>
            {REFLECTION_PROMPTS.map((p) => (
              <Pressable
                key={p}
                style={[
                  styles.promptChip,
                  selectedPrompt === p && styles.promptChipActive,
                ]}
                onPress={() => {
                  setSelectedPrompt(selectedPrompt === p ? null : p);
                  if (selectedPrompt !== p) setReflection("");
                }}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.promptChipText,
                    selectedPrompt === p && styles.promptChipTextActive,
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedPrompt && (
            <View style={styles.inputWrap}>
              <Text style={styles.inputPromptLabel}>{selectedPrompt}</Text>
              <TextInput
                style={styles.input}
                value={reflection}
                onChangeText={setReflection}
                multiline
                numberOfLines={4}
                placeholder="Write freely. This is for you alone."
                placeholderTextColor="#CCC"
                textAlignVertical="top"
                autoFocus
              />
            </View>
          )}

          <View style={styles.saveActions}>
            <Pressable
              style={styles.saveBtn}
              onPress={handleSave}
              accessibilityRole="button"
            >
              <Ionicons name="save-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {reflection.trim() ? "Save reflection" : "Save to My Arunachala"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.skipBtn}
              onPress={handleContinue}
              accessibilityRole="button"
            >
              <Text style={styles.skipBtnText}>Skip & continue</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.savedSection}>
          <View style={styles.savedCard}>
            <Ionicons name="checkmark-circle" size={22} color={G} />
            <Text style={styles.savedText}>Saved to My Arunachala</Text>
          </View>
          {reflection.trim() ? (
            <View style={styles.reflectionPreview}>
              <Text style={styles.reflectionPreviewLabel}>{selectedPrompt}</Text>
              <Text style={styles.reflectionPreviewText}>{reflection}</Text>
            </View>
          ) : null}
          <Pressable
            style={styles.continueBtn}
            onPress={handleContinue}
            accessibilityRole="button"
          >
            <Text style={styles.continueBtnText}>Return to Sadhana</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      )}

      {/* ── Footer verse ── */}
      <Text style={styles.footer}>
        "The goal of all practice is silence. Silence is the ocean into which all rivers flow."
        {"\n"}— Sri Ramana Maharshi
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 28,
    alignItems: "stretch",
  },

  hero: { alignItems: "center", gap: 14 },
  checkCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: GF, borderWidth: 2, borderColor: GB,
    alignItems: "center", justifyContent: "center",
  },
  heroTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#1A1A1A" },
  practiceTag: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F9F9F7",
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.07)",
  },
  practiceEmoji: { fontSize: 18 },
  practiceName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1A1A1A" },
  practiceDur: {
    fontSize: 12, fontFamily: "Inter_400Regular", color: "#999",
    backgroundColor: "#F0F0EE", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2,
  },
  completionMsg: {
    fontSize: 15, fontFamily: "Inter_400Regular",
    color: "#666", textAlign: "center",
    lineHeight: 24, fontStyle: "italic",
    paddingHorizontal: 10,
  },

  reflectionSection: { gap: 14 },
  reflectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#1A1A1A" },
  reflectionSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#999", marginTop: -8 },

  promptsGrid: { gap: 8 },
  promptChip: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: "#FFFFFF",
  },
  promptChipActive: { backgroundColor: GF, borderColor: G },
  promptChipText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#555", lineHeight: 19 },
  promptChipTextActive: { color: "#8B6914", fontFamily: "Inter_500Medium" },

  inputWrap: { gap: 8 },
  inputPromptLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: G },
  input: {
    backgroundColor: "#FAFAF7",
    borderWidth: 1, borderColor: "rgba(0,0,0,0.09)",
    borderRadius: 14, padding: 14,
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "#1A1A1A", lineHeight: 22,
    minHeight: 110,
  },

  saveActions: { gap: 10 },
  saveBtn: {
    backgroundColor: G, borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  skipBtn: { paddingVertical: 10, alignItems: "center" },
  skipBtnText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#BBB" },

  savedSection: { gap: 16 },
  savedCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: GF, borderRadius: 14,
    borderWidth: 1, borderColor: GB,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  savedText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#8B6914" },

  reflectionPreview: {
    backgroundColor: "#FAFAF7", borderRadius: 14,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.07)",
    padding: 14, gap: 6,
  },
  reflectionPreviewLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: G },
  reflectionPreviewText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#444", lineHeight: 21 },

  continueBtn: {
    backgroundColor: G, borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  continueBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#FFFFFF" },

  footer: {
    fontSize: 11, fontFamily: "Inter_400Regular",
    color: "#CCC", textAlign: "center",
    lineHeight: 17, fontStyle: "italic",
    paddingHorizontal: 10,
  },
});
