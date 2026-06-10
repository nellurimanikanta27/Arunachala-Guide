import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import FloatingAssistant from "@/components/FloatingAssistant";

// Land on the Local Guide (pilgrim-first) rather than the old dashboard.
export const unstable_settings = {
  initialRouteName: "local-guide",
};

// Emphasized center "Map" tab — a raised circular button representing the
// physical pilgrimage journey.
function MapTabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.mapButton, focused && styles.mapButtonActive]}>
      <MaterialCommunityIcons name="map-marker-path" size={28} color={Colors.white} />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        animation: "fade",
        lazy: true,
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.warmWhite },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.cream,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          height: Platform.OS === "web" ? 68 : 62 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Platform.OS === "web" ? 10 : Math.max(insets.bottom, 10),
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="local-guide"
        options={{
          title: "Guide",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Wisdom",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="route-map"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => <MapTabIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="sadhana"
        options={{
          title: "Sadhana",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="meditation" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="translator"
        options={{
          title: "Translator",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="language" size={size} color={color} />
          ),
        }}
      />

      {/* Routable but hidden from the bottom bar */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="me" options={{ href: null }} />
      <Tabs.Screen name="ai-guide" options={{ href: null }} />
    </Tabs>
    <FloatingAssistant />
    </View>
  );
}

const styles = StyleSheet.create({
  mapButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Platform.OS === "web" ? -18 : -24,
    borderWidth: 4,
    borderColor: Colors.white,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  mapButtonActive: {
    backgroundColor: Colors.primary,
  },
});
