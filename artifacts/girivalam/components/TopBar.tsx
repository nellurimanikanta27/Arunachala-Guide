import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { getSettings } from "@/lib/pilgrimage-store";

type Props = {
  title?: string;
  subtitle?: string;
};

/**
 * Persistent top bar: app title on the left, profile avatar on the right.
 * Avatar opens the user's profile / pilgrimage archive (the `me` screen).
 */
export default function TopBar({ title = "Arunachala", subtitle }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState<string>("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getSettings()
        .then((s) => {
          if (active) setName(s.pilgrimName ?? "");
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [])
  );

  const initial = name.trim().charAt(0).toUpperCase() || "ॐ";

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <Pressable
        onPress={() => router.push("/(tabs)/me")}
        style={styles.avatar}
        accessibilityRole="button"
        accessibilityLabel="Open your profile"
        hitSlop={8}
      >
        {name ? (
          <Text style={styles.avatarText}>{initial}</Text>
        ) : (
          <Ionicons name="person" size={18} color={Colors.white} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.warmWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  titleWrap: { flex: 1 },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.white,
  },
});
