import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";

import { hasOnboarded } from "@/lib/pilgrimage-store";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

const GOLD = "#C2A24E";
const GOLD_LIGHT = "#C2A24E";
const CREAM = "#4A4540";
const BG = "#FFFFFF";

export default function IntroAnimation() {
  // Animation values
  const skyFade = useRef(new Animated.Value(0)).current;       // dawn sky
  const mountainRise = useRef(new Animated.Value(120)).current; // mountain slides up
  const mountainFade = useRef(new Animated.Value(0)).current;
  const lingamScale = useRef(new Animated.Value(0)).current;   // lingam emerges
  const lingamGlow = useRef(new Animated.Value(0)).current;
  const rays = useRef(new Animated.Value(0)).current;          // golden rays
  const chantFade = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const outFade = useRef(new Animated.Value(0)).current;       // final fade out

  useEffect(() => {
    const seq = Animated.sequence([
      // 1. Dawn sky fades in
      Animated.timing(skyFade, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // 2. Mountain rises into view
      Animated.parallel([
        Animated.timing(mountainRise, {
          toValue: 0,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(mountainFade, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
      // 3. Lingam emerges from the peak with golden glow
      Animated.parallel([
        Animated.spring(lingamScale, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(lingamGlow, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(rays, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // 4. Chant and title fade in
      Animated.stagger(280, [
        Animated.timing(chantFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // 5. Hold, then fade out to lock screen
      Animated.delay(900),
      Animated.timing(outFade, {
        toValue: 1,
        duration: 600,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    // Looping subtle lingam pulse (separate, runs in background)
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(lingamGlow, {
          toValue: 0.6,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(lingamGlow, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );

    seq.start(() => {
      hasOnboarded()
        .then((done) => {
          router.replace((done ? "/(tabs)" : "/welcome") as any);
        })
        .catch(() => router.replace("/(tabs)" as any));
    });

    // Start the pulse a bit after lingam appears
    const pulseTimer = setTimeout(() => pulse.start(), 2800);

    return () => {
      seq.stop();
      pulse.stop();
      clearTimeout(pulseTimer);
    };
  }, [
    skyFade,
    mountainRise,
    mountainFade,
    lingamScale,
    lingamGlow,
    rays,
    chantFade,
    titleFade,
    outFade,
  ]);

  const rayRotate = rays.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "30deg"],
  });
  const rayOpacity = rays.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0.7, 0.5],
  });
  const glowOpacity = lingamGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.95],
  });

  return (
    <View style={styles.root}>
      {/* Pre-dawn sky → dawn gradient */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: skyFade }]}>
        <LinearGradient
          colors={["#FFFFFF", "#FFFDF8", "#FBF3E0", "#F3E6C8"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Golden rays radiating from mountain peak */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.raysContainer,
          {
            opacity: rayOpacity,
            transform: [{ rotate: rayRotate }],
          },
        ]}
      >
        {[...Array(12)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.ray,
              { transform: [{ rotate: `${(i * 360) / 12}deg` }] },
            ]}
          />
        ))}
      </Animated.View>

      {/* Mountain silhouette — Arunachala */}
      <Animated.View
        style={[
          styles.mountainWrap,
          {
            opacity: mountainFade,
            transform: [{ translateY: mountainRise }],
          },
        ]}
      >
        <View style={styles.mountainLeft} />
        <View style={styles.mountainPeak} />
        <View style={styles.mountainRight} />
        <View style={styles.mountainBase} />
      </Animated.View>

      {/* Lingam (Shiva) emerging at peak */}
      <Animated.View
        style={[
          styles.lingamWrap,
          { transform: [{ scale: lingamScale }] },
        ]}
      >
        {/* Outer glow halo */}
        <Animated.View
          style={[
            styles.lingamGlow,
            { opacity: glowOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.lingamGlowInner,
            { opacity: glowOpacity },
          ]}
        />
        <MaterialCommunityIcons name="om" size={56} color={GOLD_LIGHT} />
      </Animated.View>

      {/* Sanskrit chant */}
      <Animated.View
        style={[styles.chantWrap, { opacity: chantFade }]}
      >
        <Text style={styles.chant}>ॐ अरुणाचलाय नमः</Text>
        <Text style={styles.chantTranslit}>OM ARUNACHALAYA NAMAH</Text>
      </Animated.View>

      {/* Title */}
      <Animated.View
        style={[styles.titleWrap, { opacity: titleFade }]}
      >
        <Text style={styles.title}>Girivalam</Text>
        <Text style={styles.subtitle}>Pilgrim Guide · Tiruvannamalai</Text>
      </Animated.View>

      {/* Final fade-out to black before lock screen */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: BG, opacity: outFade },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, overflow: "hidden" },

  // Mountain — a triangular silhouette anchored to the bottom
  mountainWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  mountainPeak: {
    position: "absolute",
    bottom: "30%",
    width: 0,
    height: 0,
    borderLeftWidth: 180,
    borderRightWidth: 180,
    borderBottomWidth: 280,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderTopWidth: 0,
    transform: [{ rotate: "180deg" }],
  },
  mountainLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    borderRightWidth: 260,
    borderTopWidth: 320,
    borderRightColor: "transparent",
    borderTopColor: "#E2D2A0",
  },
  mountainRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    borderLeftWidth: 260,
    borderTopWidth: 320,
    borderLeftColor: "transparent",
    borderTopColor: "#E2D2A0",
  },
  mountainBase: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "35%",
    backgroundColor: "#E2D2A0",
  },

  // Golden rays
  raysContainer: {
    position: "absolute",
    top: "32%",
    left: "50%",
    width: 600,
    height: 600,
    marginLeft: -300,
    marginTop: -300,
    alignItems: "center",
    justifyContent: "center",
  },
  ray: {
    position: "absolute",
    width: 3,
    height: 320,
    backgroundColor: GOLD,
    opacity: 0.5,
    shadowColor: GOLD_LIGHT,
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },

  // Lingam at peak
  lingamWrap: {
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  lingamGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: GOLD,
    opacity: 0.3,
  },
  lingamGlowInner: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: GOLD_LIGHT,
    opacity: 0.5,
  },

  // Chant text
  chantWrap: {
    position: "absolute",
    top: "55%",
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 6,
  },
  chant: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 26,
    color: CREAM,
    letterSpacing: 0.5,
    textShadowColor: GOLD,
    textShadowRadius: 12,
  },
  chantTranslit: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: "rgba(166,132,62,0.9)",
    letterSpacing: 3,
  },

  // Title
  titleWrap: {
    position: "absolute",
    bottom: "12%",
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: CREAM,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(166,132,62,0.85)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
