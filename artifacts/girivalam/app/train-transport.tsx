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

interface ConnectingTransport {
  mode: string;
  duration: string;
  fare: string;
  notes: string;
}

interface TrainOption {
  name: string;
  departureStation: string;
  platform?: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  days: string;
  class: string;
  fare: string;
}

interface HubInfo {
  station: string;
  code: string;
  distanceFromTVM: string;
  travelTime: string;
  connecting: ConnectingTransport[];
  trains: TrainOption[];
}

interface RouteData {
  destination: string;
  directFromTVM: TrainOption[];
  viaHubs: HubInfo[];
  tips?: string;
}

const CONNECTING_TO_KATPADI: ConnectingTransport[] = [
  {
    mode: "🚌 TNSTC Bus",
    duration: "~1.5 – 2 hrs",
    fare: "₹80 – ₹100",
    notes:
      "Buses to Vellore / Katpadi depart from New Bus Stand every 20–30 mins (5:00 AM – 9:00 PM). Board the Vellore-bound bus; Katpadi Junction is the last stop before Vellore town. Auto from Vellore Bus Stand to Katpadi Jn: ₹50–80, 10 mins.",
  },
  {
    mode: "🚕 Private Cab",
    duration: "~1.5 hrs",
    fare: "₹1,200 – ₹1,800",
    notes: "Book via local taxi stands near the New Bus Stand or call Ola/Uber from Tiruvannamalai.",
  },
  {
    mode: "🛺 Share Auto (to Arcot, then bus)",
    duration: "~2 hrs total",
    fare: "₹40 + ₹30",
    notes: "Share autos to Arcot (₹35–45), then catch a Katpadi-bound TNSTC from Arcot. Budget option.",
  },
];

const CONNECTING_TO_VELLORE: ConnectingTransport[] = [
  {
    mode: "🚌 TNSTC Bus",
    duration: "~1.5 hrs",
    fare: "₹60 – ₹80",
    notes:
      "Very frequent — every 20–30 mins from New Bus Stand (5:00 AM – 9:00 PM). Arrives at Vellore New Bus Stand; Vellore Cantonment station is 15 mins auto (₹40–60) from there.",
  },
  {
    mode: "🚕 Private Cab",
    duration: "~1 hr",
    fare: "₹900 – ₹1,400",
    notes: "Comfortable door-to-door option. Book locally or via app.",
  },
];

const CONNECTING_TO_VILLUPURAM: ConnectingTransport[] = [
  {
    mode: "🚌 TNSTC Bus",
    duration: "~1.5 hrs",
    fare: "₹55 – ₹70",
    notes:
      "Frequent buses from New Bus Stand every 30 mins. Villupuram Junction is 5 mins auto (₹30–40) from Villupuram Bus Stand.",
  },
  {
    mode: "🚕 Private Cab",
    duration: "~1 hr",
    fare: "₹900 – ₹1,300",
    notes: "Direct drop to Villupuram Junction.",
  },
];

const CONNECTING_TO_CHENNAI: ConnectingTransport[] = [
  {
    mode: "🚌 Direct Bus to Chennai",
    duration: "~4.5 hrs",
    fare: "₹135 – ₹600",
    notes:
      "Fastest option for Chennai. TNSTC Express and private sleepers run throughout the day. See Bus section for full timings.",
  },
];

const ROUTES: RouteData[] = [
  {
    destination: "Chennai",
    directFromTVM: [],
    viaHubs: [
      {
        station: "Katpadi Junction",
        code: "KPD",
        distanceFromTVM: "~110 km",
        travelTime: "~1.5 – 2 hrs",
        connecting: CONNECTING_TO_KATPADI,
        trains: [
          {
            name: "Lalbagh Express",
            departureStation: "Katpadi Jn (KPD)",
            departureTime: "16:45",
            arrivalTime: "20:05",
            duration: "3 hrs 20 mins",
            days: "Daily",
            class: "1A, 2A, 3A, SL",
            fare: "₹250 – ₹1,800",
          },
          {
            name: "Brindavan Express",
            departureStation: "Katpadi Jn (KPD)",
            departureTime: "07:15",
            arrivalTime: "10:40",
            duration: "3 hrs 25 mins",
            days: "Daily",
            class: "CC, 2S",
            fare: "₹160 – ₹450",
          },
          {
            name: "Chennai – Bengaluru Intercity",
            departureStation: "Katpadi Jn (KPD)",
            departureTime: "Various",
            arrivalTime: "–",
            duration: "~3.5 hrs",
            days: "Check NTES",
            class: "SL, 3A, CC",
            fare: "₹150 – ₹900",
          },
        ],
      },
      {
        station: "Villupuram Junction",
        code: "VM",
        distanceFromTVM: "~60 km",
        travelTime: "~1.5 hrs",
        connecting: CONNECTING_TO_VILLUPURAM,
        trains: [
          {
            name: "Villupuram – Chennai Express",
            departureStation: "Villupuram Jn (VM)",
            departureTime: "06:05",
            arrivalTime: "09:40",
            duration: "3 hrs 35 mins",
            days: "Daily",
            class: "SL, 3A, 2A",
            fare: "₹200 – ₹900",
          },
          {
            name: "Pandian Express (via Villupuram)",
            departureStation: "Villupuram Jn (VM)",
            departureTime: "Varies",
            arrivalTime: "–",
            duration: "~4 hrs",
            days: "Check NTES",
            class: "SL, 3A, 2A",
            fare: "₹200 – ₹1,000",
          },
        ],
      },
    ],
    tips:
      "For Chennai, the direct TNSTC bus (₹135) is often more convenient than a train via Katpadi. Reserve train tickets on IRCTC well in advance.",
  },
  {
    destination: "Hyderabad / Secunderabad",
    directFromTVM: [],
    viaHubs: [
      {
        station: "Katpadi Junction",
        code: "KPD",
        distanceFromTVM: "~110 km",
        travelTime: "~1.5 – 2 hrs",
        connecting: CONNECTING_TO_KATPADI,
        trains: [
          {
            name: "Secunderabad – Chennai Express",
            departureStation: "Katpadi Jn (KPD)",
            departureTime: "08:35",
            arrivalTime: "Secunderabad ~23:35 (next day starts at Chennai end)",
            duration: "~15 hrs (reverse: Chennai→Hyd via KPD)",
            days: "Daily",
            class: "1A, 2A, 3A, SL",
            fare: "₹400 – ₹2,500",
          },
          {
            name: "Krishna Express (Chennai–Hyderabad)",
            departureStation: "Katpadi Jn (KPD)",
            departureTime: "Check NTES",
            arrivalTime: "–",
            duration: "~13 – 15 hrs total",
            days: "Check NTES",
            class: "SL, 3A, 2A, 1A",
            fare: "₹380 – ₹2,400",
          },
          {
            name: "Bengaluru – Secunderabad Garib Rath / SF Express",
            departureStation: "Katpadi Jn (KPD)",
            departureTime: "Varies",
            arrivalTime: "Secunderabad – check NTES",
            duration: "~13 hrs (KPD–SC)",
            days: "Check NTES",
            class: "3A, SL",
            fare: "₹350 – ₹1,500",
          },
        ],
      },
      {
        station: "Vellore Cantonment",
        code: "VLR",
        distanceFromTVM: "~65 km",
        travelTime: "~1.5 hrs",
        connecting: CONNECTING_TO_VELLORE,
        trains: [
          {
            name: "Vellore Cantt – Hyderabad Express",
            departureStation: "Vellore Cantonment (VLR)",
            departureTime: "Check NTES (weekly/bi-weekly)",
            arrivalTime: "–",
            duration: "~13 hrs",
            days: "Check NTES for running days",
            class: "SL, 3A, 2A",
            fare: "₹350 – ₹1,800",
          },
        ],
      },
    ],
    tips:
      "Book IRCTC tickets well in advance for Hyderabad trains — they fill up quickly. Tatkal opens 24 hrs before departure. Alternatively: night bus to Bengaluru + morning KSRTC Rajahamsa to Hyderabad.",
  },
  {
    destination: "Bengaluru",
    directFromTVM: [],
    viaHubs: [
      {
        station: "Katpadi Junction",
        code: "KPD",
        distanceFromTVM: "~110 km",
        travelTime: "~1.5 – 2 hrs",
        connecting: CONNECTING_TO_KATPADI,
        trains: [
          {
            name: "Lalbagh Express (KPD → SBC)",
            departureStation: "Katpadi Jn (KPD)",
            departureTime: "09:35",
            arrivalTime: "~13:40 (Bengaluru City)",
            duration: "~4 hrs",
            days: "Daily",
            class: "CC, 2S",
            fare: "₹160 – ₹500",
          },
          {
            name: "Brindavan Express (KPD → MAS → SBC)",
            departureStation: "Katpadi Jn (KPD)",
            departureTime: "16:45",
            arrivalTime: "~21:30",
            duration: "~4.5 hrs",
            days: "Daily",
            class: "CC, SL",
            fare: "₹200 – ₹600",
          },
          {
            name: "Shatabdi Express",
            departureStation: "Katpadi Jn (KPD)",
            departureTime: "07:35",
            arrivalTime: "~11:00",
            duration: "~3.5 hrs",
            days: "Daily (ex-Sun)",
            class: "CC (Chair Car)",
            fare: "₹600 – ₹1,000 (incl. meals)",
          },
        ],
      },
    ],
    tips: "Katpadi to Bengaluru is well-connected. Book Shatabdi for a fast, comfortable morning journey.",
  },
  {
    destination: "Pondicherry",
    directFromTVM: [],
    viaHubs: [
      {
        station: "Villupuram Junction",
        code: "VM",
        distanceFromTVM: "~60 km",
        travelTime: "~1.5 hrs",
        connecting: CONNECTING_TO_VILLUPURAM,
        trains: [
          {
            name: "Villupuram – Pondicherry Passenger",
            departureStation: "Villupuram Jn (VM)",
            departureTime: "Multiple daily (check NTES)",
            arrivalTime: "~1 hr to Pondicherry",
            duration: "~1 hr",
            days: "Daily",
            class: "2S, Unreserved",
            fare: "₹25 – ₹80",
          },
        ],
      },
    ],
    tips:
      "Easiest route: Tiruvannamalai → Villupuram by bus (~1.5 hrs), then Villupuram → Pondicherry by train or direct TNSTC bus.",
  },
  {
    destination: "Madurai",
    directFromTVM: [],
    viaHubs: [
      {
        station: "Villupuram Junction",
        code: "VM",
        distanceFromTVM: "~60 km",
        travelTime: "~1.5 hrs",
        connecting: CONNECTING_TO_VILLUPURAM,
        trains: [
          {
            name: "Pandian Express (Chennai–Madurai, via VM)",
            departureStation: "Villupuram Jn (VM)",
            departureTime: "~22:00 (check NTES)",
            arrivalTime: "~05:30 (Madurai)",
            duration: "~7.5 hrs",
            days: "Daily",
            class: "SL, 3A, 2A",
            fare: "₹250 – ₹1,200",
          },
        ],
      },
    ],
    tips: "An overnight bus from Tiruvannamalai to Madurai (~7 hrs) is often the simplest option.",
  },
  {
    destination: "Coimbatore",
    directFromTVM: [],
    viaHubs: [
      {
        station: "Villupuram Junction",
        code: "VM",
        distanceFromTVM: "~60 km",
        travelTime: "~1.5 hrs",
        connecting: CONNECTING_TO_VILLUPURAM,
        trains: [
          {
            name: "West Coast Express (Chennai–Mangalore via VM)",
            departureStation: "Villupuram Jn (VM)",
            departureTime: "Check NTES",
            arrivalTime: "–",
            duration: "~9 hrs to Coimbatore",
            days: "Check NTES",
            class: "SL, 3A, 2A",
            fare: "₹300 – ₹1,400",
          },
        ],
      },
      {
        station: "Katpadi Junction",
        code: "KPD",
        distanceFromTVM: "~110 km",
        travelTime: "~1.5 – 2 hrs",
        connecting: CONNECTING_TO_KATPADI,
        trains: [
          {
            name: "Bengaluru–Coimbatore Intercity / Express",
            departureStation: "Katpadi Jn (KPD)",
            departureTime: "Check NTES",
            arrivalTime: "–",
            duration: "~6 hrs",
            days: "Check NTES",
            class: "SL, 3A, CC",
            fare: "₹280 – ₹1,000",
          },
        ],
      },
    ],
  },
];

const DESTINATIONS = ROUTES.map((r) => r.destination);

export default function TrainTransportScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string>("Hyderabad / Secunderabad");

  const route = ROUTES.find((r) => r.destination === selected)!;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Ionicons name="train" size={18} color={Colors.primary} />
          <Text style={styles.headerTitle}>Train Transport</Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.fromRow}>
        <View style={styles.fromBadge}>
          <Text style={styles.fromBadgeText}>Starting from: Tiruvannamalai</Text>
        </View>
      </View>

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
            onPress={() => setSelected(d)}
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
        <Text style={styles.pageTitle}>Tiruvannamalai → {selected}</Text>

        {route.directFromTVM.length > 0 && (
          <View style={styles.hubCard}>
            <View style={styles.hubHeader}>
              <Ionicons name="train" size={16} color={Colors.primary} />
              <Text style={styles.hubTitle}>Direct from Tiruvannamalai (TNM)</Text>
            </View>
            {route.directFromTVM.map((t, i) => (
              <TrainCard key={i} train={t} />
            ))}
          </View>
        )}

        {route.directFromTVM.length === 0 && (
          <View style={styles.noDirectNote}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.noDirectText}>
              No direct long-distance trains from Tiruvannamalai station.{"\n"}Use connecting stations below.
            </Text>
          </View>
        )}

        {route.viaHubs.map((hub, hi) => (
          <View key={hi} style={styles.hubCard}>
            <View style={styles.hubHeader}>
              <Ionicons name="git-branch-outline" size={16} color={Colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.hubTitle}>Via {hub.station} ({hub.code})</Text>
                <Text style={styles.hubMeta}>
                  {hub.distanceFromTVM} · ~{hub.travelTime} from Tiruvannamalai
                </Text>
              </View>
            </View>

            {/* How to reach this hub */}
            <View style={styles.connectSection}>
              <Text style={styles.connectHeading}>🛣 How to reach {hub.station}</Text>
              {hub.connecting.map((c, ci) => (
                <View key={ci} style={styles.connectItem}>
                  <Text style={styles.connectMode}>{c.mode}</Text>
                  <View style={styles.connectMetaRow}>
                    <Text style={styles.connectMeta}>⏱ {c.duration}</Text>
                    <Text style={styles.connectMeta}>💰 {c.fare}</Text>
                  </View>
                  <Text style={styles.connectNotes}>{c.notes}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionDivider} />

            {/* Trains from this hub */}
            <Text style={styles.trainsHeading}>🚆 Trains from {hub.station}</Text>
            {hub.trains.map((t, ti) => (
              <TrainCard key={ti} train={t} />
            ))}
          </View>
        ))}

        {route.tips && (
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={16} color={Colors.primary} />
            <Text style={styles.tipText}>{route.tips}</Text>
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Train schedules and fares are indicative. Always confirm on IRCTC / NTES (National Train Enquiry System) or call 139 before travel. Book tickets at irctc.co.in.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function TrainCard({ train }: { train: TrainOption }) {
  return (
    <View style={styles.trainCard}>
      <Text style={styles.trainName}>{train.name}</Text>
      <Text style={styles.trainStation}>{train.departureStation}</Text>
      <View style={styles.trainRow}>
        <View style={styles.trainTime}>
          <Text style={styles.trainTimeLabel}>Departs</Text>
          <Text style={styles.trainTimeVal}>{train.departureTime}</Text>
        </View>
        <View style={styles.trainArrow}>
          <Ionicons name="arrow-forward" size={14} color={Colors.textFaint} />
          <Text style={styles.trainDuration}>{train.duration}</Text>
        </View>
        <View style={[styles.trainTime, { alignItems: "flex-end" }]}>
          <Text style={styles.trainTimeLabel}>Arrives</Text>
          <Text style={styles.trainTimeVal}>{train.arrivalTime}</Text>
        </View>
      </View>
      <View style={styles.trainMeta}>
        <Text style={styles.trainMetaItem}>📅 {train.days}</Text>
        <Text style={styles.trainMetaItem}>🎟 {train.class}</Text>
        <Text style={styles.trainMetaItem}>💰 {train.fare}</Text>
      </View>
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
  scrollContent: { padding: 16, gap: 16 },
  pageTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.text },
  noDirectNote: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.primaryFaint,
    borderRadius: 12,
    padding: 14,
    alignItems: "flex-start",
  },
  noDirectText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.text, lineHeight: 20 },
  hubCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  hubHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  hubTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text },
  hubMeta: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMid, marginTop: 2 },
  connectSection: { gap: 10 },
  connectHeading: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  connectItem: {
    backgroundColor: Colors.creamDark,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  connectMode: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  connectMetaRow: { flexDirection: "row", gap: 12 },
  connectMeta: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.primary },
  connectNotes: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMid, lineHeight: 18 },
  sectionDivider: { height: 1, backgroundColor: Colors.borderLight },
  trainsHeading: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.text },
  trainCard: {
    backgroundColor: Colors.creamDark,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  trainName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.text },
  trainStation: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.textMid },
  trainRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  trainTime: { flex: 1 },
  trainTimeLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: Colors.textLight },
  trainTimeVal: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.text },
  trainArrow: { alignItems: "center", paddingHorizontal: 8 },
  trainDuration: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.textFaint, marginTop: 2 },
  trainMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
  trainMetaItem: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.textMid },
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
