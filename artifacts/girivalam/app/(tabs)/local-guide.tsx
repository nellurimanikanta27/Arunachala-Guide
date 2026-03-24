import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

type Category = "temples" | "food" | "stay";

interface Place {
  id: string;
  name: string;
  category: Category;
  description: string;
  distance: string;
  mapsUrl: string;
  tags: string[];
  openHours?: string;
}

const PLACES: Place[] = [
  {
    id: "t1",
    name: "Arunachaleswarar Temple",
    category: "temples",
    description: "The main temple dedicated to Lord Shiva, one of the largest in South India with 4 majestic gopurams. A must-visit before or after Girivalam.",
    distance: "Main landmark",
    mapsUrl: "https://maps.google.com/?q=Arunachaleswarar+Temple+Tiruvannamalai",
    tags: ["Main Temple", "Shiva"],
    openHours: "5:30 AM – 10:00 PM",
  },
  {
    id: "t2",
    name: "Sri Ramanasramam",
    category: "temples",
    description: "Ashram of Ramana Maharshi at the foot of Arunachala. Open to all visitors. Meditation hall, shrine, and bookshop available.",
    distance: "2 km from main temple",
    mapsUrl: "https://maps.google.com/?q=Sri+Ramanasramam+Tiruvannamalai",
    tags: ["Ashram", "Ramana"],
    openHours: "6:00 AM – 8:00 PM",
  },
  {
    id: "t3",
    name: "Adi Annamalai Temple",
    category: "temples",
    description: "Ancient Shiva temple on the Girivalam path, considered older than the main temple. Peaceful atmosphere with few tourists.",
    distance: "On Girivalam path",
    mapsUrl: "https://maps.google.com/?q=Adi+Annamalai+Temple+Tiruvannamalai",
    tags: ["Ancient", "Route"],
    openHours: "6:00 AM – 12:00 PM, 4:00–8:00 PM",
  },
  {
    id: "t4",
    name: "Pachaiamman Temple",
    category: "temples",
    description: "Goddess temple dedicated to Pachaiamman (green goddess), an important stop on the Girivalam route.",
    distance: "On Girivalam path",
    mapsUrl: "https://maps.google.com/?q=Pachaiamman+Temple+Tiruvannamalai",
    tags: ["Goddess", "Route"],
  },
  {
    id: "f1",
    name: "Sri Annapoorna Hotel",
    category: "food",
    description: "Popular vegetarian South Indian restaurant serving traditional meals on banana leaf. Excellent sambar and rasam. Very affordable.",
    distance: "Near bus stand",
    mapsUrl: "https://maps.google.com/?q=restaurants+near+Tiruvannamalai+temple",
    tags: ["Vegetarian", "South Indian", "Budget"],
    openHours: "7:00 AM – 9:00 PM",
  },
  {
    id: "f2",
    name: "Ramana Café",
    category: "food",
    description: "Charming cafe near Ramanasramam popular with international pilgrims. Serves healthy meals, fresh juices and herbal teas.",
    distance: "Near Ramanasramam",
    mapsUrl: "https://maps.google.com/?q=Ramana+Cafe+Tiruvannamalai",
    tags: ["Café", "International", "Healthy"],
    openHours: "8:00 AM – 7:00 PM",
  },
  {
    id: "f3",
    name: "Sparsa Restaurant",
    category: "food",
    description: "Rooftop restaurant at Sparsa Resort offering South Indian and North Indian cuisine with good views and clean surroundings.",
    distance: "Outer circumambulation road",
    mapsUrl: "https://maps.google.com/?q=Sparsa+Resort+Tiruvannamalai",
    tags: ["Multi-cuisine", "Rooftop"],
    openHours: "7:00 AM – 10:00 PM",
  },
  {
    id: "f4",
    name: "Pilgrim Refreshment Stalls",
    category: "food",
    description: "Numerous small stalls along the Girivalam path sell coconut water, sugarcane juice, fruits, and light snacks. Great for hydration during the walk.",
    distance: "Along the path",
    mapsUrl: "https://maps.google.com/?q=Tiruvannamalai+girivalam+route",
    tags: ["Snacks", "Hydration", "Walk"],
  },
  {
    id: "s1",
    name: "Sparsa Resort",
    category: "stay",
    description: "Well-equipped resort near the base of Arunachala. Clean rooms, restaurant, and good location for pilgrims.",
    distance: "1.5 km from main temple",
    mapsUrl: "https://maps.google.com/?q=Sparsa+Resort+Tiruvannamalai",
    tags: ["Resort", "Mid-range"],
  },
  {
    id: "s2",
    name: "Hotel Arunachala",
    category: "stay",
    description: "Budget-friendly hotel with basic amenities close to the main temple complex. Popular with pilgrims on a budget.",
    distance: "Near main temple",
    mapsUrl: "https://maps.google.com/?q=Hotel+Arunachala+Tiruvannamalai",
    tags: ["Budget", "Central"],
  },
  {
    id: "s3",
    name: "Sri Ramana Towers",
    category: "stay",
    description: "Clean and comfortable rooms near Ramanasramam, popular with spiritual seekers. Quiet and peaceful environment.",
    distance: "Near Ramanasramam",
    mapsUrl: "https://maps.google.com/?q=Ramana+Towers+Tiruvannamalai",
    tags: ["Mid-range", "Quiet"],
  },
  {
    id: "s4",
    name: "Ashram Guest Houses",
    category: "stay",
    description: "Sri Ramanasramam and other ashrams offer dormitory and room accommodation for sincere spiritual seekers. Book well in advance.",
    distance: "Various locations",
    mapsUrl: "https://maps.google.com/?q=Ramanasramam+guesthouse+Tiruvannamalai",
    tags: ["Ashram", "Spiritual", "Budget"],
  },
];

const CATEGORIES: { id: Category; label: string; icon: string; color: string }[] = [
  { id: "temples", label: "Temples", icon: "business", color: Colors.saffron },
  { id: "food", label: "Food", icon: "restaurant", color: Colors.teal },
  { id: "stay", label: "Stay", icon: "bed", color: Colors.purple },
];

function openMaps(url: string) {
  Linking.openURL(url).catch(() =>
    Alert.alert("Cannot Open Maps", "Please install Google Maps or check your internet connection.")
  );
}

function PlaceCard({ place }: { place: Place }) {
  const categoryColor =
    place.category === "temples"
      ? Colors.saffron
      : place.category === "food"
        ? Colors.teal
        : Colors.purple;

  return (
    <View style={styles.placeCard}>
      <View style={styles.placeHeader}>
        <View style={styles.placeInfo}>
          <Text style={styles.placeName}>{place.name}</Text>
          {place.openHours && (
            <Text style={styles.placeHours}>
              <Ionicons name="time-outline" size={11} color={Colors.textLight} />
              {"  "}{place.openHours}
            </Text>
          )}
        </View>
        <Pressable
          style={styles.mapsBtn}
          onPress={() => openMaps(place.mapsUrl)}
          accessibilityRole="button"
          accessibilityLabel={`Open ${place.name} in Google Maps`}
        >
          <Ionicons name="navigate" size={16} color={Colors.white} />
        </Pressable>
      </View>
      <Text style={styles.placeDesc}>{place.description}</Text>
      <View style={styles.tagsRow}>
        <View style={[styles.distanceBadge, { borderColor: categoryColor }]}>
          <Ionicons name="location-outline" size={12} color={categoryColor} />
          <Text style={[styles.distanceText, { color: categoryColor }]}>{place.distance}</Text>
        </View>
        {place.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function LocalGuideScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;
  const [active, setActive] = useState<Category>("temples");

  const filtered = PLACES.filter((p) => p.category === active);

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            style={[
              styles.tab,
              active === cat.id && { backgroundColor: cat.color },
            ]}
            onPress={() => setActive(cat.id)}
            accessibilityRole="button"
            accessibilityLabel={cat.label}
          >
            <Ionicons
              name={cat.icon as any}
              size={18}
              color={active === cat.id ? Colors.white : Colors.textLight}
            />
            <Text
              style={[
                styles.tabText,
                active === cat.id && styles.tabTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomInset + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionInfo}>
          {active === "temples"
            ? "Sacred temples and spiritual sites along and near the Girivalam path"
            : active === "food"
              ? "Vegetarian restaurants and food options for pilgrims"
              : "Accommodation options for pilgrims visiting Tiruvannamalai"}
        </Text>
        {filtered.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}

        <Pressable
          style={styles.moreBtn}
          onPress={() =>
            openMaps(
              `https://www.google.com/maps/search/${active === "temples" ? "temples" : active === "food" ? "vegetarian+restaurants" : "hotels"}+near+Tiruvannamalai`
            )
          }
          accessibilityRole="button"
        >
          <Ionicons name="search" size={18} color={Colors.saffron} />
          <Text style={styles.moreBtnText}>
            Find more {active === "temples" ? "temples" : active === "food" ? "restaurants" : "hotels"} on Google Maps
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmWhite,
  },
  tabBar: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.creamDark,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.creamDark,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.textLight,
  },
  tabTextActive: {
    color: Colors.white,
    fontFamily: "Inter_600SemiBold",
  },
  content: {
    padding: 16,
  },
  sectionInfo: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    lineHeight: 19,
    marginBottom: 16,
  },
  placeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 2,
  },
  placeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.brown,
    marginBottom: 3,
  },
  placeHours: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
  },
  mapsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.saffron,
    alignItems: "center",
    justifyContent: "center",
  },
  placeDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.text,
    lineHeight: 19,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  distanceText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  tag: {
    backgroundColor: Colors.creamDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textMid,
  },
  moreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.saffron,
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  moreBtnText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.saffron,
  },
});
