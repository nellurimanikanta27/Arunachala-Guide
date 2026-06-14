import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, Dimensions, Platform, SafeAreaView } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useGirivalamSession, SACRED_LOCATIONS } from '../../hooks/useGirivalamSession';

const { width, height } = Dimensions.get('window');

// Offical 14KM ring polygon
const OFFICAL_ROUTE_POLYLINE = [
  { latitude: 12.2302, longitude: 79.0734 },
  { latitude: 12.2212, longitude: 79.0645 },
  { latitude: 12.2154, longitude: 79.0532 },
  { latitude: 12.2223, longitude: 79.0388 },
  { latitude: 12.2389, longitude: 79.0276 },
  { latitude: 12.2534, longitude: 79.0354 },
  { latitude: 12.2612, longitude: 79.0512 },
  { latitude: 12.2489, longitude: 79.0690 },
  { latitude: 12.2302, longitude: 79.0734 },
];

export default function RouteMapScreen() {
  const session = useGirivalamSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [japaCount, setJapaCount] = useState(0);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate Pace (minutes per km)
  const calculatePace = () => {
    if (session.distanceCovered <= 0.05) return "--"; // Wait until 50 meters
    const minutes = session.elapsedSeconds / 60;
    const pace = minutes / session.distanceCovered;
    return `${Math.floor(pace)} min/km`;
  };

  const remainingDistance = Math.max(14 - session.distanceCovered, 0).toFixed(1);

  return (
    <View style={styles.container}>
      {/* LAYER A: THE MAP */}
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: 12.2389,
          longitude: 79.0512,
          latitudeDelta: 0.06,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={session.isActive}
        followsUserLocation={true}
        showsCompass={true}
      >
        <Marker coordinate={{ latitude: 12.2389, longitude: 79.0512 }}>
          <View style={styles.mountainMarker}><Text style={{ fontSize: 18 }}>🌋</Text></View>
        </Marker>

        <Polyline coordinates={OFFICAL_ROUTE_POLYLINE} strokeColor="#FF8C00" strokeWidth={5} lineDashPattern={[2, 4]} />

        {SACRED_LOCATIONS.map((loc) => {
          const isVisited = session.visitedLocationIds.includes(loc.id);
          return (
            <Marker key={loc.id} coordinate={{ latitude: loc.latitude, longitude: loc.longitude }} onPress={() => session.setActiveGeofence(loc)}>
              <View style={[styles.lingamMarker, isVisited && styles.lingamVisited]}>
                <MaterialCommunityIcons name="om" size={14} color="#FFF" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* LAYER B: INACTIVE ENTRY SCREEN */}
      {!session.isActive && (
        <View style={styles.startCard}>
          <View style={styles.startHeader}>
            <MaterialCommunityIcons name="shoe-print" size={24} color="#FF8C00" />
            <Text style={styles.startTitle}>Sacred Girivalam</Text>
          </View>
          <Text style={styles.startSubtitle}>Prepare for the 14km circumambulation around Arunachala. Track your path, discover Lingams, and preserve your journey.</Text>
          
          <TouchableOpacity style={styles.primaryBtnFull} onPress={() => session.setShowPreparation(true)}>
            <Text style={styles.primaryBtnFullText}>Start Pilgrimage</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* LAYER B: ACTIVE SESSION TRACKING HUD */}
      {session.isActive && (
        <View style={styles.activeHudCard}>
          <View style={styles.hudHeader}>
            <Text style={styles.hudTitle}>Girivalam Progress</Text>
            <View style={styles.pillRemaining}>
              <Text style={styles.pillText}>{remainingDistance} km remaining</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Ionicons name="walk" size={20} color="#FF8C00" style={styles.metricIcon}/>
              <View>
                <Text style={styles.metricLabel}>Covered</Text>
                <Text style={styles.metricVal}>{session.distanceCovered.toFixed(2)} km</Text>
              </View>
            </View>

            <View style={styles.metricBox}>
              <Ionicons name="time-outline" size={20} color="#FF8C00" style={styles.metricIcon}/>
              <View>
                <Text style={styles.metricLabel}>Duration</Text>
                <Text style={styles.metricVal}>{formatTime(session.elapsedSeconds)}</Text>
              </View>
            </View>

            <View style={styles.metricBox}>
              <Ionicons name="speedometer-outline" size={20} color="#FF8C00" style={styles.metricIcon}/>
              <View>
                <Text style={styles.metricLabel}>Pace</Text>
                <Text style={styles.metricVal}>{calculatePace()}</Text>
              </View>
            </View>

            <View style={styles.metricBox}>
              <MaterialCommunityIcons name="temple-hindu" size={20} color="#FF8C00" style={styles.metricIcon}/>
              <View>
                <Text style={styles.metricLabel}>Lingams</Text>
                <Text style={styles.metricVal}>{session.visitedLocationIds.length} / 8 Visited</Text>
              </View>
            </View>
          </View>

          <View style={styles.hudActions}>
            <TouchableOpacity style={styles.outlineBtn} onPress={() => session.terminatePilgrimage()}>
              <Text style={styles.outlineBtnText}>End Journey</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setDrawerOpen(true)}>
              <Ionicons name="grid" size={16} color="#FFF" style={{marginRight: 6}} />
              <Text style={styles.primaryBtnText}>Utilities Drawer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* LAYER C: CONTEXTUAL SPIRITUAL GUIDANCE OVERLAY */}
      {session.isActive && session.activeGeofence && (
        <View style={styles.guidanceCard}>
          <View style={styles.guidanceHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{session.activeGeofence.type.toUpperCase()}</Text>
            </View>
            <TouchableOpacity onPress={() => session.setActiveGeofence(null)}>
              <Ionicons name="close-circle" size={24} color="#777" />
            </TouchableOpacity>
          </View>
          <Text style={styles.locationTitle}>{session.activeGeofence.name}</Text>
          <Text style={styles.locationDesc}>{session.activeGeofence.description}</Text>
        </View>
      )}

      {/* PREPARATION MODAL (Layer B Transition) */}
      <Modal visible={session.showPrep} animationType="slide">
        <SafeAreaView style={styles.modal