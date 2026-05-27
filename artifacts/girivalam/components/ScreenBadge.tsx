import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

/**
 * TEMPORARY screen-numbering badge.
 * Drop into every screen so the user can reference screens by number
 * during design review. Remove all <ScreenBadge /> usages and this file
 * when numbering is no longer needed.
 */
export default function ScreenBadge({ n, label }: { n: number; label: string }) {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={styles.pill}>
        <Text style={styles.num}>S{n}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: Platform.OS === "web" ? 8 : 48,
    left: 8,
    zIndex: 9999,
    elevation: 9999,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 60, 0, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#FFEAA0",
  },
  num: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    color: "#FFF7D6",
    letterSpacing: 1,
  },
  label: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    color: "#FFF7D6",
    letterSpacing: 0.5,
  },
});
