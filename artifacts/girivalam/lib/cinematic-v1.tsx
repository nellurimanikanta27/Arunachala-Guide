// CINEMATIC-V1 — prototype theme layer for the active-walk screen.
// To remove the prototype: set CINEMATIC_V1 to false (everything gated on
// this flag turns off), or grep for "CINEMATIC-V1" to delete all touched
// lines, then delete this file.
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";

export const CINEMATIC_V1 = true;

export const SERIF_DISPLAY = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, 'Times New Roman', serif",
}) as string;

// Floating ambient gold particles drifting upward. Pointer-events: none.
export function AmbientParticles({ count = 14 }: { count?: number }) {
  if (!CINEMATIC_V1) return null;
  const dots = useRef(
    Array.from({ length: count }, () => ({
      x: Math.random(),
      size: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 6000,
      duration: 7000 + Math.random() * 5000,
      anim: new Animated.Value(0),
      opacity: 0.15 + Math.random() * 0.35,
    })),
  ).current;

  useEffect(() => {
    const loops = dots.map((d) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(d.delay),
          Animated.timing(d.anim, {
            toValue: 1,
            duration: d.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(d.anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [dots]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {dots.map((d, i) => {
        const translateY = d.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -600],
        });
        const opacity = d.anim.interpolate({
          inputRange: [0, 0.15, 0.85, 1],
          outputRange: [0, d.opacity, d.opacity, 0],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: `${d.x * 100}%`,
              bottom: -10,
              width: d.size,
              height: d.size,
              borderRadius: d.size / 2,
              backgroundColor: "#FFD98A",
              opacity,
              transform: [{ translateY }],
              shadowColor: "#FFD98A",
              shadowOpacity: 0.9,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 0 },
            }}
          />
        );
      })}
    </View>
  );
}

// Soft pulsing gold halo, placed behind a hero number.
export function HaloPulse({
  size = 140,
  color = "#FFD98A",
}: {
  size?: number;
  color?: string;
}) {
  if (!CINEMATIC_V1) return null;
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.42] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        left: -size / 4,
        top: -size / 4,
        backgroundColor: color,
        opacity,
        transform: [{ scale }],
        shadowColor: color,
        shadowOpacity: 0.9,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}
