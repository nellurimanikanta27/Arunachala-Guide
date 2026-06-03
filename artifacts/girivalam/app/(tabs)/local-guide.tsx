import { Ionicons } from "@expo/vector-icons";
import ScreenBadge from "@/components/ScreenBadge";
import TopBar from "@/components/TopBar";
import * as Linking from "expo-linking";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

type Category = "temples" | "food" | "stay";
type SubType = "temple" | "lingam" | "ashram" | "theertham" | "food" | "popular" | "budget" | "cafe" | "stay";

interface Place {
  id: string;
  name: string;
  category: Category;
  subType?: SubType;
  description: string;
  distance: string;
  mapsUrl: string;
  tags: string[];
  openHours?: string;
  rating?: number;
}

const PLACES: Place[] = [
  {
    id: "t1",
    name: "Arunachaleswarar Temple",
    category: "temples",
    subType: "temple",
    description: "The main temple dedicated to Lord Shiva, one of the largest in South India with 4 majestic gopurams. A must-visit before or after Girivalam.",
    distance: "Main landmark",
    mapsUrl: "https://maps.google.com/?q=Arunachaleswarar+Temple+Tiruvannamalai",
    tags: ["Main Temple", "Shiva"],
    openHours: "5:30 AM – 10:00 PM",
  },
  {
    id: "t3",
    name: "Adi Annamalaiyar Temple",
    category: "temples",
    subType: "temple",
    description: "Older than the main Arunachaleswarar Temple. A very powerful Shiva temple on the Girivalam path with a deeply sacred atmosphere.",
    distance: "On Girivalam path",
    mapsUrl: "https://maps.google.com/?q=Adi+Annamalai+Temple+Tiruvannamalai",
    tags: ["Ancient", "Route"],
    openHours: "6:00 AM – 12:00 PM, 4:00–8:00 PM",
  },
  {
    id: "t4",
    name: "Pachaiamman Temple",
    category: "temples",
    subType: "temple",
    description: "Dedicated to Goddess Parvati. An important temple for protection and health — a significant stop on the Girivalam path.",
    distance: "On Girivalam path",
    mapsUrl: "https://maps.google.com/?q=Pachaiamman+Temple+Tiruvannamalai",
    tags: ["Goddess Parvati", "Health"],
  },
  {
    id: "t5",
    name: "Durga Amman Temple",
    category: "temples",
    subType: "temple",
    description: "Temple of Goddess Durga — worshipped for strength and the removal of all obstacles. A spiritually charged stop on the path.",
    distance: "On Girivalam path",
    mapsUrl: "https://maps.google.com/?q=Durga+Amman+Temple+Tiruvannamalai",
    tags: ["Goddess Durga", "Strength"],
  },
  {
    id: "l1",
    name: "Surya Lingam ☀️",
    category: "temples",
    subType: "lingam",
    description: "Sacred Lingam of the Sun God. Worshipping here is believed to bestow health, vitality, strength, and divine radiance upon the devotee.",
    distance: "On Girivalam path",
    mapsUrl: "https://maps.google.com/?q=Surya+Lingam+Tiruvannamalai+Girivalam",
    tags: ["Sun", "Health", "Vitality"],
  },
  {
    id: "l2",
    name: "Chandra Lingam 🌙",
    category: "temples",
    subType: "lingam",
    description: "Sacred Lingam of the Moon. Worshipping here brings peace of mind, emotional balance, and inner calm to the devotee.",
    distance: "On Girivalam path",
    mapsUrl: "https://maps.google.com/?q=Chandra+Lingam+Tiruvannamalai+Girivalam",
    tags: ["Moon", "Peace", "Balance"],
  },
  {
    id: "l3",
    name: "Sunai Lingam",
    category: "temples",
    subType: "lingam",
    description: "A revered Lingam on the Girivalam path, deeply connected with the ancient spiritual traditions of Arunachala. An important stop for devoted pilgrims.",
    distance: "On Girivalam path",
    mapsUrl: "https://maps.google.com/?q=Sunai+Lingam+Tiruvannamalai",
    tags: ["Sacred", "Ancient"],
  },
  {
    id: "a1",
    name: "Sri Ramana Ashram",
    category: "temples",
    subType: "ashram",
    description: "The sacred ashram of Bhagavan Ramana Maharshi at the foot of Arunachala. Open to all. Meditation hall, shrine, and library available.",
    distance: "2 km from main temple",
    mapsUrl: "https://maps.google.com/?q=Sri+Ramanasramam+Tiruvannamalai",
    tags: ["Ramana Maharshi", "Meditation"],
    openHours: "6:00 AM – 8:00 PM",
  },
  {
    id: "a2",
    name: "Seshadri Swamigal Ashram",
    category: "temples",
    subType: "ashram",
    description: "Dedicated to the great saint Seshadri Swamigal, a contemporary of Ramana Maharshi. A place of deep spiritual energy and devotion.",
    distance: "Near main temple",
    mapsUrl: "https://maps.google.com/?q=Seshadri+Swamigal+Ashram+Tiruvannamalai",
    tags: ["Saint", "Spiritual"],
  },
  {
    id: "a3",
    name: "Skandashram",
    category: "temples",
    subType: "ashram",
    description: "Located on the slopes of Arunachala hill, this ashram was where Ramana Maharshi lived for many years. Offers a breathtaking view of Tiruvannamalai.",
    distance: "On the hill",
    mapsUrl: "https://maps.google.com/?q=Skandashram+Arunachala+Tiruvannamalai",
    tags: ["Ramana", "Hill", "Views"],
  },
  {
    id: "a4",
    name: "Virupaksha Cave",
    category: "temples",
    subType: "ashram",
    description: "A natural cave on Arunachala hill where Ramana Maharshi meditated for over 17 years. Deeply connected with his early spiritual life.",
    distance: "On the hill",
    mapsUrl: "https://maps.google.com/?q=Virupaksha+Cave+Arunachala+Tiruvannamalai",
    tags: ["Cave", "Ramana", "Meditation"],
  },
  {
    id: "th1",
    name: "Siva Ganga Theertham",
    category: "temples",
    subType: "theertham",
    description: "The most sacred tank inside the main Arunachaleswarar Temple complex. Pilgrims take a holy dip here before entering the temple.",
    distance: "Inside main temple",
    mapsUrl: "https://maps.google.com/?q=Sivaganga+Tank+Tiruvannamalai",
    tags: ["Holy Water", "Sacred Tank"],
  },
  {
    id: "th2",
    name: "Brahma Theertham",
    category: "temples",
    subType: "theertham",
    description: "Sacred water body associated with Lord Brahma on the Girivalam path. Bathing here is believed to cleanse sins and bring liberation.",
    distance: "On Girivalam path",
    mapsUrl: "https://maps.google.com/?q=Brahma+Theertham+Tiruvannamalai",
    tags: ["Holy Water", "Liberation"],
  },
  {
    id: "th3",
    name: "Agastya Theertham",
    category: "temples",
    subType: "theertham",
    description: "Named after the sage Agastya, this sacred tank carries the blessings of the ancient rishis. An important stop on the Girivalam path.",
    distance: "On Girivalam path",
    mapsUrl: "https://maps.google.com/?q=Agastya+Theertham+Tiruvannamalai",
    tags: ["Sage Agastya", "Holy Water"],
  },
  {
    id: "th4",
    name: "Ayyankulam",
    category: "temples",
    subType: "theertham",
    description: "A sacred pond on the Girivalam route dedicated to Lord Ayyanar. Pilgrims offer prayers here for protection and safe journeys.",
    distance: "On Girivalam path",
    mapsUrl: "https://maps.google.com/?q=Ayyankulam+Tiruvannamalai",
    tags: ["Sacred Pond", "Protection"],
  },
  {
    id: "free1",
    name: "Arunachaleswarar Temple — Annadanam",
    category: "food",
    subType: "food",
    description: "The main temple provides free sacred meals (Annadanam) to all pilgrims throughout the day. No registration needed — simply join the queue. A blessed way to nourish yourself during Girivalam.",
    distance: "Main temple complex",
    mapsUrl: "https://maps.google.com/?q=Arunachaleswarar+Temple+Tiruvannamalai",
    tags: ["🙏 Free", "Annadanam", "All Day"],
    openHours: "Full Day",
  },
  {
    id: "free2",
    name: "Sri Ramana Ashram — Free Meals",
    category: "food",
    subType: "food",
    description: "Sri Ramanasramam offers free vegetarian meals to all visitors as part of their seva. Simple, pure, and served with devotion. Open to pilgrims of all backgrounds.",
    distance: "2 km from main temple",
    mapsUrl: "https://maps.google.com/?q=Sri+Ramanasramam+Tiruvannamalai",
    tags: ["🙏 Free", "Annadanam", "Ashram"],
    openHours: "9:00 AM – 10:00 AM",
  },
  {
    id: "free3",
    name: "Seshadri Swamigal Ashram — Free Meals",
    category: "food",
    subType: "food",
    description: "The Seshadri Swamigal Ashram offers free meals to pilgrims from noon onwards as a sacred offering. A peaceful place to rest, eat, and be blessed.",
    distance: "Near main temple",
    mapsUrl: "https://maps.google.com/?q=Seshadri+Swamigal+Ashram+Tiruvannamalai",
    tags: ["🙏 Free", "Annadanam", "Ashram"],
    openHours: "12:00 PM onwards",
  },
  {
    id: "f1",
    name: "Adyar Ananda Bhavan (A2B)",
    category: "food",
    subType: "popular",
    description: "One of the most popular vegetarian chains in South India. Highly reviewed in Tiruvannamalai. Reliable, clean, and great for idli, dosa, meals and sweets.",
    distance: "Near temple area",
    mapsUrl: "https://maps.google.com/?q=Adyar+Ananda+Bhavan+Tiruvannamalai",
    tags: ["Vegetarian", "South Indian", "Sweets"],
    rating: 3.8,
  },
  {
    id: "f2",
    name: "Hotel Ananda Ramana",
    category: "food",
    subType: "popular",
    description: "Pure vegetarian restaurant with a proper meals system. Very convenient location near the temple. Known for clean, wholesome food loved by pilgrims.",
    distance: "Near main temple",
    mapsUrl: "https://maps.google.com/?q=Hotel+Ananda+Ramana+Tiruvannamalai",
    tags: ["Pure Veg", "Meals", "Convenient"],
    rating: 4.1,
  },
  {
    id: "f3",
    name: "Rudraksh Restaurant",
    category: "food",
    subType: "popular",
    description: "Popular among pilgrims near the Rajagopuram (main entrance). Serves a good thali with both North and South Indian options. A solid choice close to the starting point.",
    distance: "Near Rajagopuram",
    mapsUrl: "https://maps.google.com/?q=Rudraksh+Restaurant+Tiruvannamalai",
    tags: ["Thali", "North+South", "Near Temple"],
  },
  {
    id: "f4",
    name: "Hotel Kanna",
    category: "food",
    subType: "budget",
    description: "A very common local restaurant known for affordable and filling vegetarian meals. A go-to spot for pilgrims looking for an authentic and budget-friendly bite.",
    distance: "Town area",
    mapsUrl: "https://maps.google.com/?q=Hotel+Kanna+Tiruvannamalai",
    tags: ["Budget", "Local", "Filling"],
    rating: 3.9,
  },
  {
    id: "f5",
    name: "Aakash Inn Restaurant",
    category: "food",
    subType: "budget",
    description: "Simple home-style vegetarian food in a relaxed setting. Good for families. Comfortable and no-fuss dining that feels welcoming after a long walk.",
    distance: "Town area",
    mapsUrl: "https://maps.google.com/?q=Aakash+Inn+Tiruvannamalai",
    tags: ["Home-Style", "Family", "Simple"],
    rating: 3.8,
  },
  {
    id: "f6",
    name: "Auro Usha Restaurant",
    category: "food",
    subType: "budget",
    description: "North Indian vegetarian restaurant near the ashram area. Clean, decent service and good veg meals. A nice change of pace for pilgrims craving North Indian food.",
    distance: "Near ashram area",
    mapsUrl: "https://maps.google.com/?q=Auro+Usha+Restaurant+Tiruvannamalai",
    tags: ["North Indian", "Veg", "Clean"],
    rating: 4.0,
  },
  {
    id: "f7",
    name: "The Dreaming Tree",
    category: "food",
    subType: "cafe",
    description: "One of the most famous cafes in Tiruvannamalai. Peaceful, relaxed vibe perfect for unwinding after the walk. Serves both Indian and European food.",
    distance: "Near ashram area",
    mapsUrl: "https://maps.google.com/?q=The+Dreaming+Tree+Tiruvannamalai",
    tags: ["Continental", "Peaceful", "Indian+European"],
    rating: 4.3,
  },
  {
    id: "f8",
    name: "The Inner Child",
    category: "food",
    subType: "cafe",
    description: "Trendy, highly-rated cafe known for burgers and healthy food. One of the most talked-about spots among visitors. Great for a relaxed meal or snack.",
    distance: "Town area",
    mapsUrl: "https://maps.google.com/?q=The+Inner+Child+Tiruvannamalai",
    tags: ["Healthy", "Trendy", "Highly Rated"],
    rating: 4.7,
  },
  {
    id: "f9",
    name: "Shanti Cafe",
    category: "food",
    subType: "cafe",
    description: "A calm cafe with a spiritual atmosphere, very popular with international visitors and pilgrims. Perfect for a quiet cup of tea and light food after Girivalam.",
    distance: "Near ashram area",
    mapsUrl: "https://maps.google.com/?q=Shanti+Cafe+Tiruvannamalai",
    tags: ["Café", "Calm", "International"],
    rating: 4.4,
  },
  {
    id: "f10",
    name: "Pilgrim Refreshment Stalls",
    category: "food",
    subType: "budget",
    description: "Small stalls all along the Girivalam path selling coconut water, sugarcane juice, fruits, and light snacks. Essential for staying hydrated during the 14 km walk.",
    distance: "Along the Girivalam path",
    mapsUrl: "https://maps.google.com/?q=Tiruvannamalai+girivalam+route",
    tags: ["Snacks", "Coconut Water", "On the Route"],
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

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 && rating - full < 0.75;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= full) stars.push("star");
    else if (i === full + 1 && half) stars.push("star-half");
    else stars.push("star-outline");
  }
  return (
    <View style={styles.ratingRow}>
      {stars.map((icon, i) => (
        <Ionicons key={i} name={icon as any} size={13} color="#F59E0B" />
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
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
          {place.rating && <StarRating rating={place.rating} />}
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
          <View key={tag} style={[styles.tag, tag === "🙏 Free" && styles.tagFree]}>
            <Text style={[styles.tagText, tag === "🙏 Free" && styles.tagFreeText]}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const TEMPLE_SECTIONS: { subType: SubType; label: string; emoji: string; desc: string }[] = [
  { subType: "temple", label: "Important Temples", emoji: "🛕", desc: "Sacred temples around Arunachala and on the Girivalam path" },
  { subType: "lingam", label: "Sacred Lingams", emoji: "🔱", desc: "Surya, Chandra and other sacred Lingams on the Girivalam path" },
  { subType: "ashram", label: "Ashrams & Spiritual Places", emoji: "🧘", desc: "Deeply connected with saints and meditation practices" },
  { subType: "theertham", label: "Sacred Theerthams", emoji: "💧", desc: "Holy water bodies on the Girivalam path" },
];

export default function LocalGuideScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;
  const [active, setActive] = useState<Category>("temples");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const searchResults = searching
    ? PLACES.filter((p) => {
        const hay = (
          p.name +
          " " +
          p.description +
          " " +
          (p.tags?.join(" ") ?? "")
        ).toLowerCase();
        return hay.includes(q);
      })
    : [];
  const filtered = PLACES.filter((p) => p.category === active);

  return (
    <View style={styles.container}>
      <ScreenBadge n={10} label="Local Guide" />
      <TopBar title="Arunachala" subtitle="Explore · Learn · Experience" />
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search temples, food, stay…"
          placeholderTextColor={Colors.textFaint}
          returnKeyType="search"
        />
        {searching ? (
          <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={Colors.textLight} />
          </Pressable>
        ) : null}
      </View>
      {!searching && (
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
      )}

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomInset + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {searching ? (
          searchResults.length > 0 ? (
            searchResults.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))
          ) : (
            <Text style={styles.sectionInfo}>
              No matches for “{query}”. Try temples, food, ashram, stay…
            </Text>
          )
        ) : active === "temples" ? (
          TEMPLE_SECTIONS.map((section) => {
            const items = filtered.filter((p) => p.subType === section.subType);
            if (items.length === 0) return null;
            return (
              <View key={section.subType}>
                <View style={styles.subSectionHeader}>
                  <Text style={styles.subSectionEmoji}>{section.emoji}</Text>
                  <View style={styles.subSectionTitles}>
                    <Text style={styles.subSectionLabel}>{section.label}</Text>
                    <Text style={styles.subSectionDesc}>{section.desc}</Text>
                  </View>
                </View>
                {items.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </View>
            );
          })
        ) : active === "food" ? (
          <>
            <View style={styles.annadanamBanner}>
              <Text style={styles.annadanamBannerEmoji}>🙏</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.annadanamBannerTitle}>Free Annadanam (Food Donation)</Text>
                <Text style={styles.annadanamBannerDesc}>Sacred free meals offered to all pilgrims — no charge, no registration needed</Text>
              </View>
            </View>
            {filtered.filter(p => p.tags.includes("🙏 Free")).map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}

            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionEmoji}>🍛</Text>
              <View style={styles.subSectionTitles}>
                <Text style={styles.subSectionLabel}>Famous Veg & South Indian</Text>
                <Text style={styles.subSectionDesc}>Most popular restaurants — highly reviewed by pilgrims</Text>
              </View>
            </View>
            {filtered.filter(p => p.subType === "popular").map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}

            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionEmoji}>🍱</Text>
              <View style={styles.subSectionTitles}>
                <Text style={styles.subSectionLabel}>Budget & Local Food</Text>
                <Text style={styles.subSectionDesc}>Affordable, authentic, and filling meals for pilgrims</Text>
              </View>
            </View>
            {filtered.filter(p => p.subType === "budget").map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}

            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionEmoji}>☕</Text>
              <View style={styles.subSectionTitles}>
                <Text style={styles.subSectionLabel}>Cafes & Chill Spots</Text>
                <Text style={styles.subSectionDesc}>Popular with tourists — peaceful atmosphere to relax after Girivalam</Text>
              </View>
            </View>
            {filtered.filter(p => p.subType === "cafe").map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </>
        ) : (
          <>
            <Text style={styles.sectionInfo}>
              Accommodation options for pilgrims visiting Tiruvannamalai
            </Text>
            {filtered.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </>
        )}

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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 11 : 6,
    backgroundColor: Colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.text,
    padding: 0,
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
  tagFree: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  tagFreeText: {
    color: "#92400E",
    fontFamily: "Inter_600SemiBold",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 3,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#92400E",
    marginLeft: 4,
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
  annadanamBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF7ED",
    borderWidth: 1.5,
    borderColor: "#E8620A",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  annadanamBannerEmoji: {
    fontSize: 28,
  },
  annadanamBannerTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.brown,
    marginBottom: 3,
  },
  annadanamBannerDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    lineHeight: 17,
  },
  subSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.creamDark,
  },
  subSectionEmoji: {
    fontSize: 24,
  },
  subSectionTitles: {
    flex: 1,
  },
  subSectionLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.brown,
  },
  subSectionDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    lineHeight: 17,
    marginTop: 2,
  },
});
