import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LockScreen() {
  const insets = useSafeAreaInsets();
  const arrowBob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowBob, {
          toValue: -10,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(arrowBob, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [arrowBob]);

  const enterApp = () => {
    router.replace("/(tabs)");
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy < -10,
      onPanResponderRelease: (_, g) => {
        if (g.dy < -60 || g.vy < -0.5) enterApp();
      },
    })
  ).current;

  return (
    <View style={styles.root} {...panResponder.panHandlers}>
      <Image
        source={require("@/assets/images/home-vision.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        accessibilityLabel="Girivalam lock screen"
      />

      {/* Swipe-up affordance */}
      <Pressable
        onPress={enterApp}
        style={[styles.swipeZone, { bottom: insets.bottom + 28 }]}
        accessibilityRole="button"
        accessibilityLabel="Enter Girivalam"
      >
        <Animated.View
          style={{
            transform: [{ translateY: arrowBob }],
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name="chevron-up"
            size={32}
            color="rgba(244,229,194,0.85)"
          />
          <Text style={styles.swipeText}>Swipe up to enter</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0604" },
  swipeZone: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 12,
  },
  swipeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "rgba(244,229,194,0.7)",
    letterSpacing: 1.5,
    marginTop: 2,
    textTransform: "uppercase",
  },
});
