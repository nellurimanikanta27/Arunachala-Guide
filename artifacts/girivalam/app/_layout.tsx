import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Text, TextInput } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";

// Ignore the device's system font-scaling so the app's typography stays as designed
// (prevents "everything looks magnified" when the OS has large-text accessibility on).
// @ts-expect-error - defaultProps is valid at runtime for RN Text/TextInput
Text.defaultProps = { ...(Text.defaultProps || {}), allowFontScaling: false };
// @ts-expect-error - defaultProps is valid at runtime for RN Text/TextInput
TextInput.defaultProps = { ...(TextInput.defaultProps || {}), allowFontScaling: false };

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
              screenOptions={{ headerShown: false }}
              initialRouteName="intro"
            >
              <Stack.Screen name="intro" options={{ headerShown: false, animation: "fade" }} />
              <Stack.Screen name="welcome" options={{ headerShown: false, animation: "fade" }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "fade" }} />
            </Stack>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
