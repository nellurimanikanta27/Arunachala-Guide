import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
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
  FALLBACK_RESPONSE,
  GREETING_RESPONSES,
  SUGGESTED_PROMPTS,
  findAnswer,
} from "@/lib/chatbot-knowledge";

const POS_KEY = "@girivalam/v1/assistant-pos";
const FAB_SIZE = 56;

type Msg = { id: string; role: "user" | "bot"; text: string };

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * App-wide floating "Arunachala Assistant".
 * - Draggable AssistiveTouch-style button (position persisted locally)
 * - Tap to expand into a chat panel that reuses the offline knowledge base
 */
export default function FloatingAssistant() {
  const insets = useSafeAreaInsets();
  const win = Dimensions.get("window");

  const startPos = {
    x: win.width - FAB_SIZE - 16,
    y: win.height - FAB_SIZE - 140,
  };
  const pan = useRef(new Animated.ValueXY(startPos)).current;
  const panValue = useRef(startPos);
  const dragging = useRef(false);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: uid(),
      role: "bot",
      text: GREETING_RESPONSES[0] ?? "Vanakkam. How may I help your pilgrimage?",
    },
  ]);
  const scrollRef = useRef<ScrollView>(null);

  // Restore saved position
  useEffect(() => {
    AsyncStorage.getItem(POS_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as { x: number; y: number };
        const x = Math.min(Math.max(saved.x, 8), win.width - FAB_SIZE - 8);
        const y = Math.min(Math.max(saved.y, insets.top + 8), win.height - FAB_SIZE - 90);
        pan.setValue({ x, y });
        panValue.current = { x, y };
      })
      .catch(() => {});
    const id = pan.addListener((v) => (panValue.current = v));
    return () => pan.removeListener(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        dragging.current = false;
        pan.setOffset({ x: panValue.current.x, y: panValue.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (e, g) => {
        if (Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4) dragging.current = true;
        Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        })(e, g);
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
        // Snap to nearest horizontal edge
        const w = Dimensions.get("window").width;
        const curY = panValue.current.y;
        const snapX =
          panValue.current.x + FAB_SIZE / 2 < w / 2 ? 16 : w - FAB_SIZE - 16;
        const clampedY = Math.min(
          Math.max(curY, insets.top + 8),
          Dimensions.get("window").height - FAB_SIZE - 90
        );
        Animated.spring(pan, {
          toValue: { x: snapX, y: clampedY },
          useNativeDriver: false,
          friction: 6,
        }).start(() => {
          panValue.current = { x: snapX, y: clampedY };
          AsyncStorage.setItem(
            POS_KEY,
            JSON.stringify({ x: snapX, y: clampedY })
          ).catch(() => {});
        });
        if (!dragging.current) setOpen(true);
      },
    })
  ).current;

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    const userMsg: Msg = { id: uid(), role: "user", text: q };
    let answer = "";
    try {
      answer = findAnswer(q) || FALLBACK_RESPONSE;
    } catch {
      answer = FALLBACK_RESPONSE;
    }
    const botMsg: Msg = { id: uid(), role: "bot", text: answer };
    setMessages((m) => [...m, userMsg, botMsg]);
    setInput("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  }

  return (
    <>
      <Animated.View
        style={[
          styles.fab,
          { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={() => {
            if (!dragging.current) setOpen(true);
          }}
          style={styles.fabInner}
          accessibilityRole="button"
          accessibilityLabel="Open the Arunachala Assistant"
        >
          <Ionicons name="sparkles" size={24} color={Colors.white} />
        </Pressable>
      </Animated.View>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetWrap}
        >
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.botBadge}>
                  <Ionicons name="sparkles" size={16} color={Colors.white} />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Arunachala Assistant</Text>
                  <Text style={styles.headerSub}>Always here to guide you</Text>
                </View>
              </View>
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={10}
                accessibilityLabel="Minimise assistant"
              >
                <Ionicons name="close" size={22} color={Colors.textLight} />
              </Pressable>
            </View>

            <ScrollView
              ref={scrollRef}
              style={styles.messages}
              contentContainerStyle={{ paddingVertical: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.bubble,
                    m.role === "user" ? styles.bubbleUser : styles.bubbleBot,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      m.role === "user" && { color: Colors.white },
                    ]}
                  >
                    {m.text}
                  </Text>
                </View>
              ))}

              {messages.length <= 1 && (
                <View style={styles.suggWrap}>
                  {SUGGESTED_PROMPTS.slice(0, 5).map((p) => (
                    <Pressable
                      key={p}
                      style={styles.suggChip}
                      onPress={() => send(p)}
                    >
                      <Text style={styles.suggText}>{p}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Ask anything about Arunachala…"
                placeholderTextColor={Colors.textFaint}
                onSubmitEditing={() => send(input)}
                returnKeyType="send"
              />
              <Pressable
                style={styles.sendBtn}
                onPress={() => send(input)}
                accessibilityLabel="Send"
              >
                <Ionicons name="arrow-up" size={20} color={Colors.white} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    top: 0,
    left: 0,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    zIndex: 999,
  },
  fabInner: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.overlay },
  sheetWrap: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: Colors.warmWhite,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    maxHeight: "82%",
    minHeight: "55%",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  botBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.text,
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textLight,
  },
  messages: { flex: 1 },
  bubble: {
    maxWidth: "85%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  bubbleBot: {
    backgroundColor: Colors.white,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    alignSelf: "flex-end",
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  suggWrap: { gap: 8, marginTop: 8 },
  suggChip: {
    backgroundColor: Colors.primaryFaint,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.primary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
