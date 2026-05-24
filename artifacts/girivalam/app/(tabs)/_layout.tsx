import { Stack } from "expo-router";
import React from "react";

import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.saffron },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 18,
        },
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: Colors.warmWhite },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="route-map" options={{ headerShown: false }} />
      <Stack.Screen
        name="history"
        options={{ title: "History & Meditation" }}
      />
      <Stack.Screen name="local-guide" options={{ title: "Local Guide" }} />
      <Stack.Screen name="ai-guide" options={{ title: "AI Guide" }} />
      <Stack.Screen
        name="translator"
        options={{ title: "Language Translator" }}
      />
      <Stack.Screen name="me" options={{ title: "My Pilgrimage" }} />
    </Stack>
  );
}
