import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

type ServiceType = "govt" | "private";

interface BusService {
  label: string;
  timings: string[];
  fare: string;
  duration: string;
  notes?: string;
}

interface BusRoute {
  destination: string;
  distance: string;
  govt?: BusService;
  private?: BusService;
  boardingPoints: string[];
  tips?: string;
}

const ROUTES: BusRoute[] = [
  {
    destination: "Chennai",
    distance: "~180 km",
    govt: {
      label: "TNSTC Express / Ordinary",
      timings: ["5:30", "7:00", "9:00", "10:30", "12:00", "14:00", "16:00", "18:30", "20:30", "22:00"],
      fare: "₹135 – ₹180",
      duration: "~4.5 hrs",
      notes: "Via Tindivanam or Gingee. Arrives at Chennai Mofussil Bus Terminus (CMBT) or Koyambedu.",
    },
    private: {
      label: "KPN / SRS / Greenways / IntraBus (A/C Seater & Sleeper)",
      timings: ["18:00", "19:00", "20:00", "20:30", "21:00", "21:30", "22:00"],
      fare: "₹350 – ₹600",
      duration: "~4 – 5 hrs",
      notes: "Book via RedBus or operator counters near Old Bus Stand. AC Sleeper available on overnight services.",
    },
    boardingPoints: ["New Bus Stand (main)", "Chengam Road stop", "Chennai Road junction"],
    tips: "For early morning arrival in Chennai, take the 20:00–22:00 night service.",
  },
  {
    destination: "Vellore",
    distance: "~65 km",
    govt: {
      label: "TNSTC Ordinary / Fast",
      timings: ["Every 20–30 minutes", "First: ~5:00", "Last: ~21:00"],
      fare: "₹60 – ₹80",
      duration: "~1.5 hrs",
      notes: "Very frequent service. Board at New Bus Stand. Drops at Vellore New Bus Stand (near CMC Hospital).",
    },
    boardingPoints: ["New Bus Stand", "Old Bus Stand area"],
    tips: "Share autos (₹25–40/person) also run on this route from Tiruvannamalai town centre to Arcot.",
  },
  {
    destination: "Bengaluru",
    distance: "~210 km",
    govt: {
      label: "TNSTC Super Express",
      timings: ["6:30", "8:00", "14:30", "20:00", "22:00"],
      fare: "₹200 – ₹280",
      duration: "~5 hrs",
      notes: "Some services change at Krishnagiri or Hosur. Confirm at the bus stand.",
    },
    private: {
      label: "KSRTC Airavat / IntraBus / RedBus operators (A/C Sleeper & Volvo)",
      timings: ["19:00", "20:00", "21:00", "21:30", "22:00"],
      fare: "₹450 – ₹750",
      duration: "~5 – 6 hrs",
      notes: "Volvo A/C Sleeper recommended for night travel. Arrives at Majestic (KSTDC) or Silk Board.",
    },
    boardingPoints: ["New Bus Stand", "Bengaluru Road, HDFC Bank stop"],
    tips: "Book private buses 1–2 days in advance on weekends and Pournami nights.",
  },
  {
    destination: "Pondicherry",
    distance: "~110 km",
    govt: {
      label: "TNSTC (via Villupuram)",
      timings: ["6:00", "7:30", "9:30", "12:00", "14:30", "17:00", "19:00"],
      fare: "₹80 – ₹110",
      duration: "~3 hrs",
      notes: "Change at Villupuram or take direct Tiruvannamalai–Pondicherry service. Check board at stand.",
    },
    boardingPoints: ["New Bus Stand"],
    tips: "Pondicherry buses often fill up. Arrive at the stand 15 mins early.",
  },
  {
    destination: "Villupuram",
    distance: "~60 km",
    govt: {
      label: "TNSTC Ordinary",
      timings: ["Every 30 minutes", "First: ~5:30", "Last: ~20:30"],
      fare: "₹55 – ₹70",
      duration: "~1.5 hrs",
      notes: "Useful connection for trains at Villupuram Junction (Bengaluru, Chennai, Madurai, Coimbatore lines).",
    },
    boardingPoints: ["New Bus Stand"],
    tips: "Villupuram Junction is 5 mins auto from Villupuram Bus Stand (₹30–40).",
  },
  {
    destination: "Salem",
    distance: "~110 km",
    govt: {
      label: "TNSTC Express",
      timings: ["6:00", "8:30", "11:00", "14:00", "17:00", "19:30"],
      fare: "₹110 – ₹145",
      duration: "~3 hrs",
    },
    boardingPoints: ["New Bus Stand"],
  },
  {
    destination: "Madurai",
    distance: "~300 km",
    govt: {
      label: "TNSTC Super Express",
      timings: ["6:00", "20:00", "21:30"],
      fare: "₹280 – ₹360",
      duration: "~7 – 8 hrs",
    },
    private: {
      label: "Overnight Sleeper (various operators)",
      timings: ["20:00", "21:00", "22:00"],
      fare: "₹500 – ₹800",
      duration: "~7 hrs",
    },
    boardingPoints: ["New Bus Stand"],
  },
  {
    destination: "Coimbatore",
    distance: "~260 km",
    private: {
      label: "Private Sleeper / Seater (via Salem)",
      timings: ["20:00", "21:00"],
      fare: "₹400 – ₹650",
      duration: "~6 hrs",
    },
    boardingPoints: ["New Bus Stand"],
    tips: "No direct TNSTC. Board from New Bus Stand; operator counters on Chengam Road also available.",
  },
  {
    destination: "Hyderabad",
    distance: "~650 km",
    private: {
      label: "Via Bengaluru: Connect at Bengaluru for Hyderabad (KSRTC / private)",
      timings: ["20:00 (reach Bengaluru ~2:00 AM, depart for Hyderabad ~5:00 AM)"],
      fare: "₹900 – ₹1,500 (combined)",
      duration: "~12 – 14 hrs total",
      notes:
        "No direct bus. Take an overnight bus to Bengaluru (Majestic), then a KSRTC Rajahamsa or private Volvo to Hyderabad from Shantinagar / Satellite Bus Stand. Book each leg separately.",
    },
    boardingPoints: ["New Bus Stand (for Bengaluru leg)"],
    tips: "Alternatively, take the train via Katpadi or Vellore — see the Train section for direct Hyderabad options.",
  },
];

const DESTINATIONS = ROUTES.map((r) => r.destination);

export default function BusTransportScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string>("Chennai");
  const [tab, setTab] = useState<ServiceType>("govt");

  const route = ROUTES.find((r) => r.destination === selected)!;
  const hasGovt = !!route.govt;
  const hasPrivate = !!route.private;
  const activeService = tab === "govt" ? route.govt : route.private;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Ionicons name="bus" size={18} color={Colors.primary} />
          <Text style={styles.headerTitle}>Bus Transport</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.fromRow}>
        <View style={styles.fromBadge}>
          <Text style={styles.fromBadgeText}>From: Tiruvannamalai New Bus Stand</Text>
        </View>
      </View>

      {/* Destination selector */}
      <View style={styles.destLabel}>
        <Text style={styles.destLabelText}>Select Destination</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.destScroll}
        contentContainerStyle={styles.destScrollContent}
      >
        {DESTINATIONS.map((d) => (
          <Pressable
            key={d}
            style={[styles.destChip, selected === d && styles.destChipActive]}
            onPress={() => {
              setSelected(d);
              const r = ROUTES.find((r) => r.destination === d)!;
              setTab(r.govt ? "govt" : "private");
            }}
          >
            <Text style={[styles.destChipText, selected === d && styles.destChipTextActive]}>
              {d}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Route summary */}
        <View style={styles.routeSummary}>
          <Text style={styles.routeTitle}>
            Tiruvannamalai → {selected}
          </Text>
          <Text style={styles.routeDistance}>{route.distance}</Text>
        </View>

        {/* Service type tab */}
        {hasGovt && hasPrivate && (
          <View style={styles.tabRow}>
            <Pressable
              style={[styles.tabBtn, tab === "govt" && styles.tabBtnActive]}
              onPress={() => setTab("govt")}
            >
              <Text style={[styles.tabBtnText, tab === "govt" && styles.tabBtnTextActive]}>
                Government (TNSTC)
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, tab === "private" && styles.tabBtnActive]}
              onPress={() => setTab("private")}
            >
              <Text style={[styles.tabBtnText, tab === "private" && styles.tabBtnTextActive]}>
                Private
              </Text>
            </Pressable>
          </View>
        )}
        {!hasGovt && hasPrivate && (
          <View style={styles.noGovtNote}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.noGovtNoteText}>No direct TNSTC service. Private buses only.</Text>
          </View>
        )}

        {activeService && (
          <View style={styles.serviceCard}>
            <Text style={styles.serviceLabel}>{activeService.label}</Text>

            <View style={styles.infoRow}>
              <InfoBlock icon="time-outline" label="Duration" value={activeService.duration} />
              <InfoBlock icon="cash-outline" label="Fare" value={activeService.fare} />
            </View>

            <View style={styles.divider} />

            <Text style={styles.timingsHeading}>Departure Timings</Text>
            <View style={styles.timingsWrap}>
              {activeService.timings.map((t, i) => (
                <View key={i} style={styles.timingChip}>
                  <Text style={styles.timingText}>{t}</Text>
                </View>
              ))}
            </View>

            {activeService.notes && (
              <>
                <View style={styles.divider} />
                <Text style={styles.notes}>{activeService.notes}</Text>
              </>
            )}
          </View>
        )}

        {/* Boarding points */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="location-outline" size={16} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Boarding Points</Text>
          </View>
          {route.boardingPoints.map((bp, i) => (
            <Text key={i} style={styles.bulletItem}>• {bp}</Text>
          ))}
        </View>

        {/* Tips */}
        {route.tips && (
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={16} color={Colors.primary} />
            <Text style={styles.tipText}>{route.tips}</Text>
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Timings and fares are indicative. Confirm at New Bus Stand or call TNSTC: 1800 425 0111.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoBlock({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoBlock}>
      <Ionicons name={icon as any} size={16} color={Colors.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.warmWhite },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", color: Colors.text },
  fromRow: { paddingHorizontal: 16, paddingTop: 10 },
  fromBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryFaint,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  fromBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.primaryDark },
  destLabel: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  destLabelText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textLight, letterSpacing: 1 },
  destScroll: { flexGrow: 0 },
  destScrollContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  destChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.creamDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  destChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  destChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.text },
  destChipTextActive: { color: Colors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },
  routeSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routeTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  routeDistance: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.primary },
  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.creamDark,
    borderRadius: 12,
    padding: 3,
  },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  tabBtnActive: { backgroundColor: Colors.white, shadowColor: Colors.shadow, shadowRadius: 4, shadowOpacity: 0.3 },
  tabBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.textMid },
  tabBtnTextActive: { color: Colors.primary, fontFamily: "Inter_600SemiBold" },
  noGovtNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primaryFaint,
    borderRadius: 10,
    padding: 12,
  },
  noGovtNoteText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text, flex: 1 },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  serviceLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  infoRow: { flexDirection: "row", gap: 12 },
  infoBlock: {
    flex: 1,
    backgroundColor: Colors.primaryFaint,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  infoLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.textLight },
  infoValue: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text, textAlign: "center" },
  divider: { height: 1, backgroundColor: Colors.borderLight },
  timingsHeading: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textLight, letterSpacing: 0.5 },
  timingsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  timingChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.creamDark,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timingText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.text },
  notes: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMid, lineHeight: 20 },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  bulletItem: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textMid, paddingLeft: 4 },
  tipCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.primaryFaint,
    borderRadius: 12,
    padding: 14,
    alignItems: "flex-start",
  },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 20 },
  disclaimer: { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 12 },
  disclaimerText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textFaint, textAlign: "center" },
});
