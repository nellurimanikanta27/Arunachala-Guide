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
import { StyleSheet, Text, TextInput } from "react-native";
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

// Global font-size reduction. There is no central type scale (font sizes are
// hardcoded across screens), so instead of editing hundreds of call sites we
// patch the Text/TextInput render once to multiply every explicit `fontSize`
// by FONT_SCALE. Tune this single constant to make the whole app's text
// larger/smaller (1 = no change, 0.9 = 10% smaller). Guarded in try/catch like
// disableFontScaling so a non-patchable platform degrades to unscaled text
// rather than crashing.
const FONT_SCALE: number = 0.95;
const ICON_FONT_RE =
  /^(Ionicons|Material(CommunityIcons|Icons)|FontAwesome(5|6)?|Feather|AntDesign|Entypo|EvilIcons|Foundation|Octicons|SimpleLineIcons|Zocial|Fontisto)/;
function applyGlobalFontScale(Component: {
  render?: (props: { style?: unknown }, ref: unknown) => unknown;
  __fontScaled?: boolean;
}) {
  try {
    if (FONT_SCALE === 1) return;
    if (typeof Component.render === "function" && !Component.__fontScaled) {
      const original = Component.render;
      Component.render = function (props: { style?: unknown }, ref: unknown) {
        const flat = StyleSheet.flatten(props?.style) as
          | { fontSize?: number; fontFamily?: string }
          | undefined;
        // Vector icons (@expo/vector-icons) are Text nodes whose `size` prop
        // becomes a numeric fontSize. Skip those so we only shrink real text,
        // not glyph icons — detected via their dedicated icon-font families.
        const isIconFont =
          typeof flat?.fontFamily === "string" && ICON_FONT_RE.test(flat.fontFamily);
        if (flat && typeof flat.fontSize === "number" && !isIconFont) {
          const scaled = {
            ...props,
            style: [props.style, { fontSize: Math.round(flat.fontSize * FONT_SCALE) }],
          };
          return original.call(this, scaled, ref);
        }
        return original.call(this, props, ref);
      };
      Component.__fontScaled = true;
    }
  } catch {
    // Render is not patchable on this platform; leave text unscaled.
  }
}
applyGlobalFontScale(Text as unknown as Parameters<typeof applyGlobalFontScale>[0]);
applyGlobalFontScale(TextInput as unknown as Parameters<typeof applyGlobalFontScale>[0]);

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
              <Stack.Screen name="sadhana-practice" options={{ headerShown: false, animation: "slide_from_right" }} />
              <Stack.Screen name="sadhana-complete" options={{ headerShown: false, animation: "slide_from_right" }} />
            </Stack>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
