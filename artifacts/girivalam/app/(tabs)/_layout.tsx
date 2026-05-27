import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.saffron },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 18,
        },
        sceneStyle: { backgroundColor: Colors.warmWhite },
        tabBarActiveTintColor: Colors.saffron,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          height: Platform.OS === "web" ? 64 : undefined,
          paddingTop: 6,
          paddingBottom: Platform.OS === "web" ? 10 : undefined,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-guide"
        options={{
          title: "AI Guide",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size} color={color} />
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
      <Tabs.Screen
        name="me"
        options={{
          title: "My Pilgrimage",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="foot-print" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden from tab bar, still routable from the home grid */}
      <Tabs.Screen name="route-map" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="history" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="sadhana" options={{ href: null, title: "Sadhana" }} />
      <Tabs.Screen name="local-guide" options={{ href: null, title: "Local Guide" }} />
    </Tabs>
  );
}
