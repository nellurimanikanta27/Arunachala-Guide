import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import TopBar from "@/components/TopBar";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import {
  getContinue,
  getRecentlyOpened,
  getWalks,
  type LibraryProgress,
  type RecentItem,
  type Walk,
} from "@/lib/pilgrimage-store";

type Category = "temples" | "food" | "stay" | "ashrams" | "meditation" | "utilities";
type SubType =
  | "temple"
  | "lingam"
  | "ashram"
  | "theertham"
  | "food"
  | "popular"
  | "budget"
  | "cafe"
  | "stay"
  | "meditation"
  | "medical"
  | "pharmacy"
  | "atm"
  | "toilets"
  | "water"
  | "parking"
  | "transport";

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
    category: "ashrams",
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
    category: "ashrams",
    subType: "ashram",
    description: "Dedicated to the great saint Seshadri Swamigal, a contemporary of Ramana Maharshi. A place of deep spiritual energy and devotion.",
    distance: "Near main temple",
    mapsUrl: "https://maps.google.com/?q=Seshadri+Swamigal+Ashram+Tiruvannamalai",
    tags: ["Saint", "Spiritual"],
  },
  {
    id: "a3",
    name: "Skandashram",
    category: "ashrams",
    subType: "ashram",
    description: "Located on the slopes of Arunachala hill, this ashram was where Ramana Maharshi lived for many years. Offers a breathtaking view of Tiruvannamalai.",
    distance: "On the hill",
    mapsUrl: "https://maps.google.com/?q=Skandashram+Arunachala+Tiruvannamalai",
    tags: ["Ramana", "Hill", "Views"],
  },
  {
    id: "a4",
    name: "Virupaksha Cave",
    category: "ashrams",
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

  // ── Meditation Centres ────────────────────────────────────────────────
  {
    id: "m1",
    name: "Sri Ramana Ashram — Meditation Hall",
    category: "meditation",
    subType: "meditation",
    description: "The New Hall, Mother's Shrine, and Old Hall at Sri Ramanasramam are open for silent meditation through the day. A profoundly still space at the foot of Arunachala.",
    distance: "2 km from main temple",
    mapsUrl: "https://maps.google.com/?q=Sri+Ramanasramam+Tiruvannamalai",
    tags: ["Silent", "Self-Enquiry", "Open to All"],
    openHours: "6:00 AM – 8:00 PM",
  },
  {
    id: "m2",
    name: "Yogi Ramsuratkumar Ashram",
    category: "meditation",
    subType: "meditation",
    description: "The ashram of the saint Yogi Ramsuratkumar on Chengam Road. Devotees gather for bhajan, meditation, and quiet contemplation in a serene setting.",
    distance: "Chengam Road",
    mapsUrl: "https://maps.google.com/?q=Yogi+Ramsuratkumar+Ashram+Tiruvannamalai",
    tags: ["Bhajan", "Meditation", "Peaceful"],
  },
  {
    id: "m3",
    name: "Sri Nannagaru Ashram",
    category: "meditation",
    subType: "meditation",
    description: "Ashram of Sri Nannagaru, a devotee of Bhagavan Ramana. A calm meditation hall where seekers sit in silence near Arunachala.",
    distance: "Near Ramanasramam",
    mapsUrl: "https://maps.google.com/?q=Sri+Nannagaru+Ashram+Tiruvannamalai",
    tags: ["Meditation", "Devotion", "Quiet"],
  },

  // ── Utilities (everyday essentials) ───────────────────────────────────
  {
    id: "u-med1",
    name: "Government Hospital, Tiruvannamalai",
    category: "utilities",
    subType: "medical",
    description: "The main government hospital in Tiruvannamalai for medical emergencies and treatment. Tap to navigate.",
    distance: "Tiruvannamalai town",
    mapsUrl: "https://maps.google.com/?q=Government+Hospital+Tiruvannamalai",
    tags: ["Hospital", "Emergency"],
  },
  {
    id: "u-med2",
    name: "Hospitals & Clinics Nearby",
    category: "utilities",
    subType: "medical",
    description: "Find hospitals and clinics close to the Arunachaleswarar Temple and the Girivalam path.",
    distance: "Near main temple",
    mapsUrl: "https://maps.google.com/?q=hospital+near+Arunachaleswarar+Temple+Tiruvannamalai",
    tags: ["Clinics", "Medical"],
  },
  {
    id: "u-pharm",
    name: "Pharmacies & Medical Shops",
    category: "utilities",
    subType: "pharmacy",
    description: "Medical shops and pharmacies around the temple area for medicines, first aid, and essentials.",
    distance: "Near main temple",
    mapsUrl: "https://maps.google.com/?q=pharmacy+medical+shop+near+Arunachaleswarar+Temple+Tiruvannamalai",
    tags: ["Medicines", "First Aid"],
  },
  {
    id: "u-atm",
    name: "ATMs & Banks",
    category: "utilities",
    subType: "atm",
    description: "ATMs and banks near the Arunachaleswarar Temple to withdraw cash before your walk.",
    distance: "Near main temple",
    mapsUrl: "https://maps.google.com/?q=ATM+near+Arunachaleswarar+Temple+Tiruvannamalai",
    tags: ["Cash", "Bank"],
  },
  {
    id: "u-toilet",
    name: "Public Toilets",
    category: "utilities",
    subType: "toilets",
    description: "Public toilets along the Girivalam path and around the main temple for pilgrims.",
    distance: "Along the Girivalam path",
    mapsUrl: "https://maps.google.com/?q=public+toilets+near+Arunachaleswarar+Temple+Tiruvannamalai",
    tags: ["Restrooms", "On the Route"],
  },
  {
    id: "u-water",
    name: "Drinking Water Points",
    category: "utilities",
    subType: "water",
    description: "Drinking water stalls and points along the 14 km Girivalam path — stay hydrated during your walk.",
    distance: "Along the Girivalam path",
    mapsUrl: "https://maps.google.com/?q=drinking+water+Girivalam+path+Tiruvannamalai",
    tags: ["Hydration", "On the Route"],
  },
  {
    id: "u-park",
    name: "Parking",
    category: "utilities",
    subType: "parking",
    description: "Parking areas near the Arunachaleswarar Temple for cars, two-wheelers, and buses.",
    distance: "Near main temple",
    mapsUrl: "https://maps.google.com/?q=parking+near+Arunachaleswarar+Temple+Tiruvannamalai",
    tags: ["Cars", "Two-Wheelers"],
  },
  {
    id: "u-trans1",
    name: "Tiruvannamalai Bus Stand",
    category: "utilities",
    subType: "transport",
    description: "The main bus stand for buses to Chennai, Bengaluru, Pondicherry, and surrounding towns.",
    distance: "Tiruvannamalai town",
    mapsUrl: "https://maps.google.com/?q=Tiruvannamalai+Bus+Stand",
    tags: ["Buses", "Travel"],
  },
  {
    id: "u-trans2",
    name: "Taxis & Auto Stands",
    category: "utilities",
    subType: "transport",
    description: "Find taxis and auto-rickshaw stands near the temple for local travel around Tiruvannamalai.",
    distance: "Near main temple",
    mapsUrl: "https://maps.google.com/?q=taxi+auto+stand+near+Arunachaleswarar+Temple+Tiruvannamalai",
    tags: ["Taxi", "Auto"],
  },
];

const NEARBY_ESSENTIALS: { label: string; icon: string; url: string }[] = [
  {
    label: "Water",
    icon: "water-outline",
    url: "https://maps.google.com/?q=drinking+water+Girivalam+path+Tiruvannamalai",
  },
  {
    label: "Toilets",
    icon: "male-female-outline",
    url: "https://maps.google.com/?q=public+toilets+near+Arunachaleswarar+Temple+Tiruvannamalai",
  },
  {
    label: "Medical",
    icon: "medkit-outline",
    url: "https://maps.google.com/?q=hospital+near+Arunachaleswarar+Temple+Tiruvannamalai",
  },
  {
    label: "ATM",
    icon: "card-outline",
    url: "https://maps.google.com/?q=ATM+near+Arunachaleswarar+Temple+Tiruvannamalai",
  },
  {
    label: "Parking",
    icon: "car-outline",
    url: "https://maps.google.com/?q=parking+near+Arunachaleswarar+Temple+Tiruvannamalai",
  },
];

const LOCAL_CONTACT_CATEGORIES: { label: string; icon: string }[] = [
  { label: "Local Guides", icon: "person-outline" },
  { label: "Volunteers", icon: "people-outline" },
  { label: "Temple Offices", icon: "business-outline" },
  { label: "Ashrams", icon: "leaf-outline" },
  { label: "Emergency Services", icon: "alert-circle-outline" },
];

const CATEGORIES: { id: Category; label: string; icon: string; color: string }[] = [
  { id: "temples", label: "Temples", icon: "business", color: Colors.saffron },
  { id: "ashrams", label: "Ashrams", icon: "flower-outline", color: Colors.green },
  { id: "meditation", label: "Meditation", icon: "body", color: Colors.blue },
  { id: "food", label: "Food", icon: "restaurant", color: Colors.teal },
  { id: "stay", label: "Stay", icon: "bed", color: Colors.purple },
  { id: "utilities", label: "Utilities", icon: "medkit", color: Colors.gold },
];

const CATEGORY_COLORS: Record<Category, string> = {
  temples: Colors.saffron,
  ashrams: Colors.green,
  meditation: Colors.blue,
  food: Colors.teal,
  stay: Colors.purple,
  utilities: Colors.gold,
};

const MORE_SEARCH: Record<Category, { q: string; label: string }> = {
  temples: { q: "temples", label: "temples" },
  ashrams: { q: "ashrams", label: "ashrams" },
  meditation: { q: "meditation+centres", label: "meditation centres" },
  food: { q: "vegetarian+restaurants", label: "restaurants" },
  stay: { q: "hotels", label: "hotels" },
  utilities: { q: "ATM+pharmacy+hospital", label: "essentials" },
};

const UTILITY_SECTIONS: { subType: SubType; label: string; emoji: string; desc: string }[] = [
  { subType: "medical", label: "Medical", emoji: "🏥", desc: "Hospitals and clinics for emergencies" },
  { subType: "pharmacy", label: "Pharmacy", emoji: "💊", desc: "Medical shops for medicines and first aid" },
  { subType: "atm", label: "ATM & Banks", emoji: "🏧", desc: "Withdraw cash before your walk" },
  { subType: "toilets", label: "Toilets", emoji: "🚻", desc: "Public restrooms on the path and in town" },
  { subType: "water", label: "Drinking Water", emoji: "💧", desc: "Stay hydrated along the Girivalam path" },
  { subType: "parking", label: "Parking", emoji: "🅿️", desc: "Parking near the main temple" },
  { subType: "transport", label: "Transport", emoji: "🚌", desc: "Buses, taxis, and autos" },
];

function formatDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

type LatLng = { lat: number; lng: number };

// Accurate coordinates for places we can geolocate (sourced from the route-map
// data + well-known Tiruvannamalai landmarks). Places not listed here fall back
// to their descriptive distance string.
const PLACE_COORDS: Record<string, LatLng> = {
  t1: { lat: 12.2319, lng: 79.0676 }, // Arunachaleswarar Temple
  t3: { lat: 12.2233, lng: 79.056 }, // Adi Annamalaiyar Temple
  a1: { lat: 12.2238, lng: 79.0682 }, // Sri Ramana Ashram
  a2: { lat: 12.2247, lng: 79.0689 }, // Seshadri Swamigal Ashram
  a3: { lat: 12.2272, lng: 79.0709 }, // Skandashram (on the hill)
  a4: { lat: 12.2268, lng: 79.0701 }, // Virupaksha Cave
  th1: { lat: 12.234, lng: 79.0688 }, // Siva Ganga Theertham
  th2: { lat: 12.2358, lng: 79.0651 }, // Brahma Theertham
  th3: { lat: 12.2255, lng: 79.066 }, // Agastya Theertham
  free1: { lat: 12.2348, lng: 79.0668 }, // Annadanam – Main Temple
  free2: { lat: 12.2238, lng: 79.0682 }, // Sri Ramana Ashram – Free Meals
  free3: { lat: 12.2247, lng: 79.0689 }, // Seshadri Ashram – Free Meals
};

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  return `${km.toFixed(1)} km away`;
}

// Build a directions URL that routes from the user's current location to the
// place — using exact coords when available, otherwise the place's search query.
function directionsUrl(place: Place, userLoc: LatLng | null): string {
  const coords = PLACE_COORDS[place.id];
  let destination: string;
  if (coords) {
    destination = `${coords.lat},${coords.lng}`;
  } else {
    let q: string | null = null;
    try {
      q = new URL(place.mapsUrl).searchParams.get("q");
    } catch {
      q = null;
    }
    if (!q) return place.mapsUrl;
    destination = q;
  }
  const params = new URLSearchParams({ api: "1", destination });
  // Route explicitly from the user's fetched GPS position when we have it;
  // otherwise Google Maps defaults the origin to the device's location.
  if (userLoc) params.set("origin", `${userLoc.lat},${userLoc.lng}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

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

function PlaceCard({ place, userLoc }: { place: Place; userLoc: LatLng | null }) {
  const categoryColor = CATEGORY_COLORS[place.category] ?? Colors.saffron;
  const coords = PLACE_COORDS[place.id];
  const liveKm = userLoc && coords ? haversineKm(userLoc, coords) : null;
  const distanceLabel = liveKm != null ? formatDistanceKm(liveKm) : place.distance;

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
          onPress={() => openMaps(directionsUrl(place, userLoc))}
          accessibilityRole="button"
          accessibilityLabel={`Navigate to ${place.name}`}
        >
          <Ionicons name="navigate" size={16} color={Colors.white} />
        </Pressable>
      </View>
      <Text style={styles.placeDesc}>{place.description}</Text>
      <View style={styles.tagsRow}>
        <View
          style={[
            styles.distanceBadge,
            { borderColor: categoryColor },
            liveKm != null && { backgroundColor: categoryColor },
          ]}
        >
          <Ionicons
            name={liveKm != null ? "navigate" : "location-outline"}
            size={12}
            color={liveKm != null ? Colors.white : categoryColor}
          />
          <Text
            style={[
              styles.distanceText,
              { color: liveKm != null ? Colors.white : categoryColor },
            ]}
          >
            {distanceLabel}
          </Text>
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
  { subType: "theertham", label: "Sacred Theerthams", emoji: "💧", desc: "Holy water bodies on the Girivalam path" },
];

export default function LocalGuideScreen() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const bottomInset = isWeb ? 34 : insets.bottom;
  const [active, setActive] = useState<Category>("temples");
  const [query, setQuery] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const listY = useRef(0);

  const handleCategory = useCallback((id: Category) => {
    setActive(id);
    const doScroll = (attempt: number) => {
      // The anchor may not have measured yet (listY still 0), e.g. before the
      // async "Continue reading" card lays out. Retry briefly until it has.
      if (listY.current <= 0 && attempt < 6) {
        setTimeout(() => doScroll(attempt + 1), 60);
        return;
      }
      scrollRef.current?.scrollTo({
        y: Math.max(listY.current - 12, 0),
        animated: true,
      });
    };
    requestAnimationFrame(() => doScroll(0));
  }, []);

  const [lastWalk, setLastWalk] = useState<Walk | null>(null);
  const [ongoing, setOngoing] = useState(false);
  const [continueRead, setContinueRead] = useState<LibraryProgress[]>([]);
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const [userLoc, setUserLoc] = useState<LatLng | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (Platform.OS === "web") {
          if (typeof navigator === "undefined" || !navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!cancelled) {
                setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              }
            },
            () => {},
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
          );
        } else {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") return;
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (!cancelled) {
            setUserLoc({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          }
        }
      } catch {
        // Location unavailable — fall back to descriptive distance labels.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const walks = await getWalks();
        const sorted = [...walks].sort((a, b) => b.startedAt - a.startedAt);
        const latest = sorted[0] ?? null;
        setLastWalk(latest);
        setOngoing(latest != null && latest.endedAt == null);
        setContinueRead(await getContinue("read"));
        setRecents(await getRecentlyOpened());
      })().catch((e) => console.warn("Failed to load Local Guide journey state", e));
    }, [])
  );

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
      <TopBar title="Arunachala Guide" subtitle="Explore · Learn · Experience" />
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

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomInset + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!searching && (
          <>
            <LinearGradient
              colors={[Colors.saffron, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <Text style={styles.heroWelcome}>Welcome to</Text>
              <Text style={styles.heroTitle}>Arunachala</Text>
              <Text style={styles.heroSub}>Explore · Learn · Experience</Text>
              <Ionicons
                name="triangle"
                size={72}
                color="rgba(255,255,255,0.12)"
                style={styles.heroMountain}
              />
            </LinearGradient>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderTitle}>Quick Access</Text>
              <Pressable
                onPress={() => openMaps("https://maps.google.com/?q=places+to+visit+Tiruvannamalai")}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="View all places on the map"
              >
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>
            <View style={styles.quickGrid}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={styles.quickTile}
                  onPress={() => handleCategory(cat.id)}
                  accessibilityRole="button"
                  accessibilityLabel={cat.label}
                >
                  <View
                    style={[
                      styles.quickIcon,
                      { backgroundColor: active === cat.id ? cat.color : Colors.primaryFaint },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={22}
                      color={active === cat.id ? Colors.white : cat.color}
                    />
                  </View>
                  <Text
                    style={[styles.quickLabel, active === cat.id && styles.quickLabelActive]}
                    numberOfLines={1}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.essentialsCard}>
              <View style={styles.essentialsHeader}>
                <Text style={styles.essentialsTitle}>Nearby Essentials</Text>
                <Pressable
                  onPress={() => openMaps("https://maps.google.com/?q=ATM+pharmacy+hospital+drinking+water+Tiruvannamalai")}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="View all essentials on the map"
                >
                  <Text style={styles.viewAll}>View All</Text>
                </Pressable>
              </View>
              <View style={styles.essentialsRow}>
                {NEARBY_ESSENTIALS.map((e) => (
                  <Pressable
                    key={e.label}
                    style={styles.essentialChip}
                    onPress={() => openMaps(e.url)}
                    accessibilityRole="button"
                    accessibilityLabel={`Find ${e.label} nearby`}
                  >
                    <View style={styles.essentialIcon}>
                      <Ionicons name={e.icon as any} size={20} color={Colors.primary} />
                    </View>
                    <Text style={styles.essentialLabel}>{e.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Text style={styles.sectionHeaderTitle}>Continue Your Journey</Text>
            <Pressable
              style={[styles.continueCard, styles.continueCardTop]}
              onPress={() => router.push("/(tabs)/route-map" as any)}
              accessibilityRole="button"
              accessibilityLabel="Continue your journey on the map"
            >
              <View style={[styles.continueIcon, { backgroundColor: Colors.saffron }]}>
                <Ionicons name="walk" size={20} color={Colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.continueTitle}>
                  {ongoing ? "Resume your walk" : lastWalk ? "Continue your journey" : "Begin your Girivalam"}
                </Text>
                <Text style={styles.continueSub} numberOfLines={1}>
                  {ongoing
                    ? "Your Girivalam is in progress"
                    : lastWalk
                      ? `Last walk · ${formatDate(lastWalk.startedAt)}`
                      : "Open the sacred route map to start"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
            </Pressable>

            {(continueRead.length > 0 || recents.length > 0) && (
              <Pressable
                style={styles.continueCard}
                onPress={() => router.push("/(tabs)/history" as any)}
                accessibilityRole="button"
                accessibilityLabel="Continue reading in Wisdom"
              >
                <View style={[styles.continueIcon, { backgroundColor: Colors.amber }]}>
                  <Ionicons name="book" size={18} color={Colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.continueTitle}>Continue reading</Text>
                  <Text style={styles.continueSub} numberOfLines={1}>
                    {continueRead[0]?.title ?? recents[0]?.title ?? "Pick up where you left off"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
              </Pressable>
            )}
          </>
        )}

        <View
          onLayout={(e) => {
            listY.current = e.nativeEvent.layout.y;
          }}
        />

        {!searching && (
          <View style={styles.listTitleRow}>
            <Ionicons
              name={(CATEGORIES.find((c) => c.id === active)?.icon ?? "list") as any}
              size={18}
              color={CATEGORY_COLORS[active] ?? Colors.saffron}
            />
            <Text style={styles.listTitle}>
              {CATEGORIES.find((c) => c.id === active)?.label ?? "Places"}
            </Text>
          </View>
        )}

        {searching ? (
          searchResults.length > 0 ? (
            searchResults.map((place) => (
              <PlaceCard key={place.id} place={place} userLoc={userLoc} />
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
                  <PlaceCard key={place.id} place={place} userLoc={userLoc} />
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
              <PlaceCard key={place.id} place={place} userLoc={userLoc} />
            ))}

            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionEmoji}>🍛</Text>
              <View style={styles.subSectionTitles}>
                <Text style={styles.subSectionLabel}>Famous Veg & South Indian</Text>
                <Text style={styles.subSectionDesc}>Most popular restaurants — highly reviewed by pilgrims</Text>
              </View>
            </View>
            {filtered.filter(p => p.subType === "popular").map((place) => (
              <PlaceCard key={place.id} place={place} userLoc={userLoc} />
            ))}

            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionEmoji}>🍱</Text>
              <View style={styles.subSectionTitles}>
                <Text style={styles.subSectionLabel}>Budget & Local Food</Text>
                <Text style={styles.subSectionDesc}>Affordable, authentic, and filling meals for pilgrims</Text>
              </View>
            </View>
            {filtered.filter(p => p.subType === "budget").map((place) => (
              <PlaceCard key={place.id} place={place} userLoc={userLoc} />
            ))}

            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionEmoji}>☕</Text>
              <View style={styles.subSectionTitles}>
                <Text style={styles.subSectionLabel}>Cafes & Chill Spots</Text>
                <Text style={styles.subSectionDesc}>Popular with tourists — peaceful atmosphere to relax after Girivalam</Text>
              </View>
            </View>
            {filtered.filter(p => p.subType === "cafe").map((place) => (
              <PlaceCard key={place.id} place={place} userLoc={userLoc} />
            ))}
          </>
        ) : active === "ashrams" ? (
          <>
            <Text style={styles.sectionInfo}>
              Ashrams and spiritual places around Arunachala — open to all sincere seekers.
            </Text>
            {filtered.map((place) => (
              <PlaceCard key={place.id} place={place} userLoc={userLoc} />
            ))}
          </>
        ) : active === "meditation" ? (
          <>
            <Text style={styles.sectionInfo}>
              Meditation halls and centres where pilgrims sit in silence near the holy hill.
            </Text>
            {filtered.map((place) => (
              <PlaceCard key={place.id} place={place} userLoc={userLoc} />
            ))}
          </>
        ) : active === "utilities" ? (
          <>
            <Text style={styles.sectionInfo}>
              Everyday essentials around Tiruvannamalai and the Girivalam path.
            </Text>
            {UTILITY_SECTIONS.map((section) => {
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
                    <PlaceCard key={place.id} place={place} userLoc={userLoc} />
                  ))}
                </View>
              );
            })}
          </>
        ) : (
          <>
            <Text style={styles.sectionInfo}>
              Accommodation options for pilgrims visiting Tiruvannamalai
            </Text>
            {filtered.map((place) => (
              <PlaceCard key={place.id} place={place} userLoc={userLoc} />
            ))}
          </>
        )}

        {!searching && (
          <Pressable
            style={styles.moreBtn}
            onPress={() =>
              openMaps(
                `https://www.google.com/maps/search/${MORE_SEARCH[active].q}+near+Tiruvannamalai`
              )
            }
            accessibilityRole="button"
          >
            <Ionicons name="search" size={18} color={Colors.saffron} />
            <Text style={styles.moreBtnText}>
              Find more {MORE_SEARCH[active].label} on Google Maps
            </Text>
          </Pressable>
        )}

        {!searching && (
          <View style={styles.contactsSection}>
            <View style={styles.subSectionHeader}>
              <Text style={styles.subSectionEmoji}>📞</Text>
              <View style={styles.subSectionTitles}>
                <Text style={styles.subSectionLabel}>Local Contacts</Text>
                <Text style={styles.subSectionDesc}>
                  Helpful people and offices — directory coming soon
                </Text>
              </View>
            </View>
            {LOCAL_CONTACT_CATEGORIES.map((c) => (
              <View key={c.label} style={styles.contactRow}>
                <View style={styles.contactIcon}>
                  <Ionicons name={c.icon as any} size={18} color={Colors.textLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactLabel}>{c.label}</Text>
                  <Text style={styles.contactPlaceholder}>No contacts yet</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
  content: {
    padding: 16,
  },
  hero: {
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 16,
    overflow: "hidden",
  },
  heroWelcome: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.85)",
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    marginTop: 2,
  },
  heroSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  heroMountain: {
    position: "absolute",
    right: 14,
    bottom: -8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.brown,
  },
  viewAll: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.saffron,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  quickTile: {
    width: "31%",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  quickIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.textMid,
  },
  quickLabelActive: {
    fontFamily: "Inter_700Bold",
    color: Colors.brown,
  },
  essentialsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  continueCardTop: {
    marginTop: 10,
  },
  sectionInfo: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
    lineHeight: 19,
    marginBottom: 16,
  },
  listTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
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
  continueCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 2,
  },
  continueIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  continueTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.brown,
    marginBottom: 2,
  },
  continueSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textLight,
  },
  essentialsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 2,
  },
  essentialsTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.brown,
  },
  essentialsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  essentialChip: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  essentialIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryFaint,
    alignItems: "center",
    justifyContent: "center",
  },
  essentialLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.textMid,
  },
  contactsSection: {
    marginTop: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  contactIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  contactLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.brown,
    marginBottom: 1,
  },
  contactPlaceholder: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textFaint,
  },
});
