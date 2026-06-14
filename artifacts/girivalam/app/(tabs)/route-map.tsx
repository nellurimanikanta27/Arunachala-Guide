import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGirivalamSession, SACRED_LOCATIONS } from '../../hooks/useGirivalamSession';

const { width, height } = Dimensions.get('window');

// Fallback track polygon overlay for official 14KM circumambulation ring
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

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* LAYER A: SACRED MAP INTERFACE */}
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
        showsMyLocationButton={false}
      >
        {/* Render Holy Mountain Center Boundary representation placeholder */}
        <Marker coordinate={{ latitude: 12.2389, longitude: 79.0512 }} title="Arunachala Holy Hill">
          <View style={styles.mountainMarker}>
            <Text style={{ fontSize: 18 }}>🌋</Text>
          </View>
        </Marker>

        {/* Route Line Geometry */}
        <Polyline
          coordinates={OFFICAL_ROUTE_POLYLINE}
          strokeColor="#FF9933"
          strokeWidth={4}
          lineDashPattern={[1]}
        />

        {/* Lingam Assets Mapping */}
        {SACRED_LOCATIONS.map((loc) => {
          const isVisited = session.visitedLocationIds.includes(loc.id);
          return (
            <Marker
              key={loc.id}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              title={loc.name}
              onPress={() => session.setActiveGeofence(loc)}
            >
              <View style={[styles.lingamMarker, isVisited && styles.lingamVisited]}>
                <MaterialCommunityIcons name="om" size={14} color="#FFF" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* NON-ACTIVE INBOUND INTERCEPT HUD */}
      {!session.isActive && (
        <View style={styles.startOverlay}>
          <Text style={styles.startTitle}>Girivalam Journey Mode</Text>
          <Text style={styles.startSubtitle}>Step into an immersive, stateful guided pilgrimage tracking portal.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => session.setShowPreparation(true)}>
            <Text style={styles.primaryButtonText}>Start Girivalam</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LAYER B: ACTIVE SESSION DASHBOARD */}
      {session.isActive && (
        <View style={styles.progressPanel}>
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{session.distanceCovered.toFixed(2)} km</Text>
              <Text style={styles.metricLabel}>Covered</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{(14 - session.distanceCovered > 0 ? 14 - session.distanceCovered : 0).toFixed(2)} km</Text>
              <Text style={styles.metricLabel}>Remaining</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{formatTime(session.elapsedSeconds)}</Text>
              <Text style={styles.metricLabel}>Duration</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{session.visitedLocationIds.length} / 8</Text>
              <Text style={styles.metricLabel}>Lingams</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.drawerTrigger} onPress={() => setDrawerOpen(true)}>
            <Ionicons name="apps-sharp" size={18} color="#FF9933" />
            <Text style={styles.drawerTriggerText}>Open Utilities Drawer</Text>
          </TouchableOpacity>
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
          {session.activeGeofence.mantra && (
            <View style={styles.mantraBox}>
              <Text style={styles.mantraLabel}>Sacred Chanting Reflection:</Text>
              <Text style={styles.mantraText}>{session.activeGeofence.mantra}</Text>
            </View>
          )}
          <View style={styles.guidanceActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => session.addMemory('text', { text: `Reflecting at ${session.activeGeofence?.name}` })}>
              <Ionicons name="journal" size={16} color="#FF9933" />
              <Text style={styles.actionBtnText}>Log Insight</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* PREPARATION & CHECKLIST ENTRY EXPERIENCE MODAL */}
      <Modal visible={session.showPrep} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.prepTitle}>Pradakshina Preparation</Text>
            <Text style={styles.prepSectionHeader}>Pilgrimage Metrics</Text>
            <View style={styles.metricsGrid}>
              <Text style={styles.bulletItem}>📏 Total Circuit Path: 14 Kilometers</Text>
              <Text style={styles.bulletItem}>⏱️ Normal Average Pace: 3.5 to 5 Hours</Text>
              <Text style={styles.bulletItem}>☀️ Advised Windows: Early Morning or Barefoot Night Paths</Text>
            </View>

            <Text style={styles.prepSectionHeader}>Sacred Spiritual Checklist Guidelines</Text>
            <Text style={styles.bulletItem}>🕉️ Always walk clockwise keeping the hill to your right side.</Text>
            <Text style={styles.bulletItem}>🤫 Maintain silence or soft interior chanting of mantras.</Text>
            <Text style={styles.bulletItem}>🚯 Respect the holy environment—strictly zero littering.</Text>
            <Text style={styles.bulletItem}>💧 Stay constantly hydrated throughout the loop.</Text>

            <View style={styles.actionSpacing} />
            <TouchableOpacity style={styles.beginBtn} onPress={session.beginPilgrimage}>
              <Text style={styles.beginBtnText}>Begin My Girivalam</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => session.setShowPreparation(false)}>
              <Text style={styles.cancelBtnText}>Back to Map</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* LAYER D: COLLAPSIBLE UTILITY DRAWER MODAL */}
      <Modal visible={drawerOpen} animationType="slide" transparent={true}>
        <View style={styles.drawerBackdrop}>
          <View style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Pilgrimage Assistant Portfolio</Text>
              <TouchableOpacity onPress={() => setDrawerOpen(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.utilGrid}>
              {/* Japa Counter Utility component abstraction */}
              <View style={styles.utilityCard}>
                <Text style={styles.utilityCardTitle}>Active Japa Counter</Text>
                <Text style={styles.japaBigText}>{japaCount}</Text>
                <TouchableOpacity style={styles.japaBtn} onPress={() => setJapaCount((p) => p + 1)}>
                  <Text style={styles.japaBtnText}>Chant Counter +1</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setJapaCount(0)}>
                  <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
              </View>

              {/* Memory Log Terminal Injection point shortcut widget */}
              <View style={styles.utilityCard}>
                <Text style={styles.utilityCardTitle}>Instant Memory Log</Text>
                <TouchableOpacity style={styles.logShortcut} onPress={() => { session.addMemory('text', { text: "Spiritual insight logged manually." }); setDrawerOpen(false); }}>
                  <Ionicons name="create" size={20} color="#FFF" />
                  <Text style={styles.logShortcutText}>Save Journal Entry</Text>
                </TouchableOpacity>
                <Text style={styles.memoryCountText}>Total Logged Memories: {session.memories.length}</Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.terminateBtn} onPress={() => { session.terminatePilgrimage(); setDrawerOpen(false); }}>
              <Text style={styles.terminateBtnText}>Stop / Reset Journey Mode</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  map: { width: width, height: height },
  mountainMarker: { padding: 6, backgroundColor: '#FFFAF0', borderRadius: 20, borderWidth: 1, borderColor: '#DEB887' },
  lingamMarker: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#8B0000', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFF' },
  lingamVisited: { backgroundColor: '#4CAF50' },
  startOverlay: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: '#FFF', padding: 20, borderRadius: 16, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
  startTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  startSubtitle: { fontSize: 14, color: '#666', marginBottom: 16, lineHeight: 20 },
  primaryButton: { backgroundColor: '#FF9933', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  primaryButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  progressPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.2 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  metricItem: { alignItems: 'center', flex: 1 },
  metricValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  metricLabel: { fontSize: 11, color: '#777', marginTop: 2 },
  drawerTrigger: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 12 },
  drawerTriggerText: { marginLeft: 8, color: '#FF9933', fontWeight: '600', fontSize: 14 },
  guidanceCard: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 16, right: 16, backgroundColor: '#FFF', borderRadius: 14, padding: 16, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2 },
  guidanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { backgroundColor: '#FFEAD2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#FF9933' },
  locationTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  locationDesc: { fontSize: 13, color: '#555', marginTop: 4, lineHeight: 18 },
  mantraBox: { marginTop: 12, padding: 10, backgroundColor: '#FFF8F2', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#FF9933' },
  mantraLabel: { fontSize: 11, fontWeight: '600', color: '#888' },
  mantraText: { fontSize: 14, fontStyle: 'italic', color: '#FF9933', marginTop: 2, fontWeight: '500' },
  guidanceActions: { flexDirection: 'row', marginTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionBtnText: { marginLeft: 6, fontSize: 13, color: '#FF9933', fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#FFF', paddingHorizontal: 20 },
  scrollContainer: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 40 },
  prepTitle: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  prepSectionHeader: { fontSize: 18, fontWeight: '600', color: '#FF9933', marginTop: 20, marginBottom: 10 },
  bulletItem: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 8 },
  metricsGrid: { backgroundColor: '#F9F9F9', padding: 14, borderRadius: 10, marginBottom: 10 },
  actionSpacing: { height: 30 },
  beginBtn: { backgroundColor: '#FF9933', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  beginBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { color: '#777', fontSize: 14 },
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  drawerContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, minHeight: height * 0.4 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  drawerTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  utilGrid: { flexDirection: 'row', marginBottom: 20 },
  utilityCard: { width: width * 0.65, backgroundColor: '#F9F9F9', borderRadius: 14, padding: 14, marginRight: 14, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  utilityCardTitle: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 10 },
  japaBigText: { fontSize: 36, fontWeight: 'bold', color: '#FF9933', marginBottom: 10 },
  japaBtn: { backgroundColor: '#FF9933', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 6 },
  japaBtnText: { color: '#FFF', fontWeight: '600' },
  resetText: { fontSize: 12, color: '#999', textDecorationLine: 'underline' },
  logShortcut: { backgroundColor: '#333', flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  logShortcutText: { color: '#FFF', marginLeft: 8, fontWeight: '500' },
  memoryCountText: { fontSize: 11, color: '#777', marginTop: 4 },
  terminateBtn: { backgroundColor: '#FFF0F0', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  terminateBtnText: { color: '#D32F2F', fontWeight: 'bold' },
});