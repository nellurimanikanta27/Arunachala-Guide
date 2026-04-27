import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
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
import {
  findAnswer,
  GREETING_RESPONSES,
  SUGGESTED_PROMPTS,
} from "@/lib/chatbot-knowledge";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: number;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default function AIGuideScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 16 : insets.bottom;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: GREETING_RESPONSES[0],
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(t);
  }, [messages, isTyping]);

  function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      text: content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(
      () => {
        const answer = findAnswer(content);
        const botMsg: Message = {
          id: generateId(),
          role: "bot",
          text: answer,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      },
      600 + Math.random() * 500
    );
  }

  function clearChat() {
    setMessages([
      {
        id: "welcome",
        role: "bot",
        text: GREETING_RESPONSES[1],
        timestamp: Date.now(),
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.botHeader}>
        <View style={styles.botAvatar}>
          <MaterialCommunityIcons name="robot-happy-outline" size={22} color={Colors.white} />
        </View>
        <View style={styles.botHeaderText}>
          <Text style={styles.botName}>Girivalam Guide</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.botStatus}>Online · Ready to help</Text>
          </View>
        </View>
        <Pressable
          onPress={clearChat}
          style={styles.clearBtn}
          accessibilityRole="button"
          accessibilityLabel="Clear chat"
          hitSlop={10}
        >
          <Ionicons name="refresh" size={18} color={Colors.saffron} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messagesArea}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.bubbleRow,
              msg.role === "user" ? styles.bubbleRowUser : styles.bubbleRowBot,
            ]}
          >
            {msg.role === "bot" && (
              <View style={styles.smallAvatar}>
                <Text style={styles.smallAvatarEmoji}>🕉️</Text>
              </View>
            )}
            <View
              style={[
                styles.bubble,
                msg.role === "user" ? styles.bubbleUser : styles.bubbleBot,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  msg.role === "user" ? styles.bubbleTextUser : styles.bubbleTextBot,
                ]}
              >
                {msg.text}
              </Text>
              <Text
                style={[
                  styles.timeText,
                  msg.role === "user" ? styles.timeTextUser : styles.timeTextBot,
                ]}
              >
                {formatTime(msg.timestamp)}
              </Text>
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.bubbleRow, styles.bubbleRowBot]}>
            <View style={styles.smallAvatar}>
              <Text style={styles.smallAvatarEmoji}>🕉️</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDotMid]} />
              <View style={styles.typingDot} />
            </View>
          </View>
        )}

        {messages.length <= 2 && (
          <View style={styles.suggestionsBox}>
            <Text style={styles.suggestionsTitle}>💡 Try asking:</Text>
            <View style={styles.suggestionsWrap}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Pressable
                  key={prompt}
                  style={({ pressed }) => [
                    styles.suggestionChip,
                    pressed && styles.suggestionChipPressed,
                  ]}
                  onPress={() => sendMessage(prompt)}
                >
                  <Text style={styles.suggestionText}>{prompt}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: bottomInset + 8 }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about Girivalam, lingams, ashrams..."
          placeholderTextColor={Colors.textLight}
          multiline
          maxLength={500}
          onSubmitEditing={() => sendMessage()}
          blurOnSubmit
          returnKeyType="send"
        />
        <Pressable
          style={[
            styles.sendBtn,
            !input.trim() && styles.sendBtnDisabled,
          ]}
          onPress={() => sendMessage()}
          disabled={!input.trim()}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <Ionicons
            name="send"
            size={18}
            color={input.trim() ? Colors.white : Colors.textLight}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  botHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.creamDark,
  },
  botAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
  },
  botHeaderText: {
    flex: 1,
  },
  botName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.brown,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  botStatus: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textLight,
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.cream,
  },
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    padding: 12,
    paddingBottom: 24,
    gap: 8,
  },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    marginBottom: 4,
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubbleRowBot: {
    justifyContent: "flex-start",
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  smallAvatarEmoji: {
    fontSize: 14,
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: Colors.saffron,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.creamDark,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: Colors.white,
  },
  bubbleTextBot: {
    color: Colors.text,
  },
  timeText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  timeTextUser: {
    color: "rgba(255,255,255,0.75)",
    textAlign: "right",
  },
  timeTextBot: {
    color: Colors.textLight,
  },
  typingBubble: {
    flexDirection: "row",
    gap: 4,
    paddingVertical: 14,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.saffron,
    opacity: 0.5,
  },
  typingDotMid: {
    opacity: 0.8,
  },
  suggestionsBox: {
    marginTop: 12,
    padding: 14,
    backgroundColor: Colors.cream,
    borderRadius: 14,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: Colors.saffronDark,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  suggestionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.saffronLight,
  },
  suggestionChipPressed: {
    backgroundColor: Colors.saffron,
  },
  suggestionText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.saffronDark,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.creamDark,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.cream,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    maxHeight: 100,
    minHeight: 42,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: Colors.creamDark,
  },
});
