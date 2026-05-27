import { Ionicons } from "@expo/vector-icons";
import ScreenBadge from "@/components/ScreenBadge";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "fr", name: "French", native: "Français" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "ja", name: "Japanese", native: "日本語" },
];

const PILGRIM_PHRASES = [
  {
    english: "Om Namah Shivaya",
    meaning: "Salutation to Shiva — universal mantra for this sacred place",
    tamil: "ஓம் நமச்சிவாய",
    hindi: "ॐ नमः शिवाय",
  },
  {
    english: "Which way to the temple?",
    meaning: "For finding the main Arunachaleswarar Temple",
    tamil: "கோவிலுக்கு எந்த வழி?",
    hindi: "मंदिर किस तरफ है?",
  },
  {
    english: "Where is the water?",
    meaning: "For finding water points on the route",
    tamil: "தண்ணீர் எங்கே?",
    hindi: "पानी कहाँ है?",
  },
  {
    english: "How far to complete the circle?",
    meaning: "For asking remaining distance on Girivalam",
    tamil: "வளைவு முடிக்க எவ்வளவு தொலைவு?",
    hindi: "गिरिवलम पूरा करने में कितनी दूरी है?",
  },
  {
    english: "I need medical help",
    meaning: "In case of emergency during walk",
    tamil: "எனக்கு மருத்துவ உதவி வேண்டும்",
    hindi: "मुझे चिकित्सा सहायता चाहिए",
  },
  {
    english: "Vegetarian food only please",
    meaning: "For ordering food at restaurants",
    tamil: "சைவ உணவு மட்டும் தேவை",
    hindi: "केवल शाकाहारी खाना चाहिए",
  },
];

function openGoogleTranslate(text: string, targetLang: string, sourceLang: string) {
  const url = `https://translate.google.com/?sl=${sourceLang}&tl=${targetLang}&text=${encodeURIComponent(text)}&op=translate`;
  Linking.openURL(url).catch(() =>
    Alert.alert("Cannot Open Translator", "Please check your internet connection.")
  );
}

export default function TranslatorScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;

  const [inputText, setInputText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("ta");
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);

  const sourceLanguage = LANGUAGES.find((l) => l.code === sourceLang)!;
  const targetLanguage = LANGUAGES.find((l) => l.code === targetLang)!;

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const handleTranslate = () => {
    if (!inputText.trim()) {
      Alert.alert("Enter Text", "Please enter some text to translate.");
      return;
    }
    openGoogleTranslate(inputText, targetLang, sourceLang);
  };

  return (
    <>
    <ScreenBadge n={5} label="Translator" />
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: bottomInset + 24 },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.translatorCard}>
        <View style={styles.langRow}>
          <Pressable
            style={styles.langSelector}
            onPress={() => {
              setShowSourcePicker(!showSourcePicker);
              setShowTargetPicker(false);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.langCode}>{sourceLanguage.native}</Text>
            <Text style={styles.langName}>{sourceLanguage.name}</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textLight} />
          </Pressable>

          <Pressable
            style={styles.swapBtn}
            onPress={swapLanguages}
            accessibilityRole="button"
            accessibilityLabel="Swap languages"
          >
            <Ionicons name="swap-horizontal" size={20} color={Colors.saffron} />
          </Pressable>

          <Pressable
            style={styles.langSelector}
            onPress={() => {
              setShowTargetPicker(!showTargetPicker);
              setShowSourcePicker(false);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.langCode}>{targetLanguage.native}</Text>
            <Text style={styles.langName}>{targetLanguage.name}</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textLight} />
          </Pressable>
        </View>

        {showSourcePicker && (
          <View style={styles.langPicker}>
            <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  style={[
                    styles.pickerItem,
                    sourceLang === lang.code && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setSourceLang(lang.code);
                    setShowSourcePicker(false);
                  }}
                >
                  <Text style={styles.pickerNative}>{lang.native}</Text>
                  <Text style={styles.pickerName}>{lang.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {showTargetPicker && (
          <View style={styles.langPicker}>
            <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  style={[
                    styles.pickerItem,
                    targetLang === lang.code && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setTargetLang(lang.code);
                    setShowTargetPicker(false);
                  }}
                >
                  <Text style={styles.pickerNative}>{lang.native}</Text>
                  <Text style={styles.pickerName}>{lang.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <TextInput
          style={styles.textInput}
          placeholder={`Enter text in ${sourceLanguage.name}...`}
          placeholderTextColor={Colors.textFaint}
          value={inputText}
          onChangeText={setInputText}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Pressable
          style={[
            styles.translateBtn,
            !inputText.trim() && styles.translateBtnDisabled,
          ]}
          onPress={handleTranslate}
          accessibilityRole="button"
          accessibilityLabel="Translate text"
        >
          <Ionicons name="language" size={20} color={Colors.white} />
          <Text style={styles.translateBtnText}>Translate with Google</Text>
          <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Common Pilgrim Phrases</Text>
      <Text style={styles.sectionDesc}>
        Tap any phrase to translate or share it
      </Text>

      {PILGRIM_PHRASES.map((phrase, index) => (
        <Pressable
          key={index}
          style={styles.phraseCard}
          onPress={() => openGoogleTranslate(phrase.english, targetLang, "en")}
          accessibilityRole="button"
        >
          <View style={styles.phraseHeader}>
            <Text style={styles.phraseEnglish}>{phrase.english}</Text>
            <Ionicons name="language" size={18} color={Colors.green} />
          </View>
          <Text style={styles.phraseMeaning}>{phrase.meaning}</Text>
          <View style={styles.phraseTranslations}>
            <View style={styles.phraseTranslation}>
              <Text style={styles.phraseLang}>Tamil:</Text>
              <Text style={styles.phraseTranslated}>{phrase.tamil}</Text>
            </View>
            <View style={styles.phraseTranslation}>
              <Text style={styles.phraseLang}>Hindi:</Text>
              <Text style={styles.phraseTranslated}>{phrase.hindi}</Text>
            </View>
          </View>
        </Pressable>
      ))}

      <View style={styles.noteCard}>
        <Ionicons name="information-circle" size={20} color={Colors.amber} />
        <Text style={styles.noteText}>
          Translation opens Google Translate in your browser. For offline use,
          download the Google Translate app and download language packs for Tamil, Hindi and Telugu.
        </Text>
      </View>
    </ScrollView>
    </>
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
  translatorCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  langSelector: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.creamDark,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 2,
  },
  langCode: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.brown,
  },
  langName: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
  },
  swapBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.overlayLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.saffron,
  },
  langPicker: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.creamDark,
    marginBottom: 12,
    maxHeight: 200,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.creamDark,
  },
  pickerItemActive: {
    backgroundColor: Colors.overlayLight,
  },
  pickerNative: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.brown,
    width: 80,
  },
  pickerName: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
  },
  textInput: {
    backgroundColor: Colors.creamDark,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    minHeight: 100,
    marginBottom: 14,
  },
  translateBtn: {
    backgroundColor: Colors.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },
  translateBtnDisabled: {
    opacity: 0.5,
  },
  translateBtnText: {
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
    marginBottom: 14,
  },
  phraseCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 2,
  },
  phraseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  phraseEnglish: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.brown,
    flex: 1,
  },
  phraseMeaning: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    fontStyle: "italic",
    marginBottom: 10,
  },
  phraseTranslations: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.creamDark,
    paddingTop: 10,
  },
  phraseTranslation: {
    flexDirection: "row",
    gap: 8,
    alignItems: "baseline",
  },
  phraseLang: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.green,
    width: 46,
  },
  phraseTranslated: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    flex: 1,
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
