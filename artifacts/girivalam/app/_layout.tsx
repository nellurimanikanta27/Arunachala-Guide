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
// NOTE: `defaultProps` can be a read-only property on native (Hermes + React 19),
// where reassigning it throws a TypeError at module load and crashes the app before
// it mounts. We guard the mutation so a non-writable platform degrades gracefully
// (font scaling stays on) instead of taking the whole app down.
function disableFontScaling(Component: { defaultProps?: { allowFontScaling?: boolean } }) {
  try {
    Component.defaultProps = {
      ...(Component.defaultProps || {}),
      allowFontScaling: false,
    };
  } catch {
    // Property is read-only on this platform; skip rather than crash.
  }
}
disableFontScaling(Text as unknown as { defaultProps?: { allowFontScaling?: boolean } });
disableFontScaling(TextInput as unknown as { defaultProps?: { allowFontScaling?: boolean } });

SplashScreen.preventAutoHideAsync().catch(() => {});

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
