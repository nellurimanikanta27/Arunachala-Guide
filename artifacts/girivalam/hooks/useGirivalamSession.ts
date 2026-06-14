import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export interface SacredLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'lingam' | 'temple' | 'ashram' | 'milestone';
  description: string;
  mantra?: string;
}

export interface MemoryEntry {
  id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  type: 'photo' | 'voice' | 'text';
  uri?: string;
  text?: string;
}

const STORAGE_KEY = '@arunachala_guide_girivalam_session';

// Sacred Geofence Coordinates Array
export const SACRED_LOCATIONS: SacredLocation[] = [
  { id: 'l1', name: 'Indra Lingam', latitude: 12.2302, longitude: 79.0734, type: 'lingam', description: 'Associated with the East direction. Gives prosperity and power.', mantra: 'Om Lam Indraya Namah' },
  { id: 'l2', name: 'Agni Lingam', latitude: 12.2212, longitude: 79.0645, type: 'lingam', description: 'Associated with the South-East direction. Removes fear and mental blocks.', mantra: 'Om Ram Agnaye Namah' },
  { id: 'l3', name: 'Yama Lingam', latitude: 12.2154, longitude: 79.0532, type: 'lingam', description: 'Associated with the South direction. Blesses with longevity and clears sins.', mantra: 'Om Myam Yamaya Namah' },
  { id: 'l4', name: 'Niruthi Lingam', latitude: 12.2223, longitude: 79.0388, type: 'lingam', description: 'Associated with the South-West direction. Gives protection from negative energies.', mantra: 'Om Ksam Nirutaye Namah' },
  { id: 'l5', name: 'Varuna Lingam', latitude: 12.2389, longitude: 79.0276, type: 'lingam', description: 'Associated with the West direction. Cures water-related illnesses and brings peace.', mantra: 'Om Vam Varunaya Namah' },
  { id: 'l6', name: 'Vayu Lingam', latitude: 12.2534, longitude: 79.0354, type: 'lingam', description: 'Associated with the North-West direction. Grants good health and vital energy.', mantra: 'Om Yam Vayave Namah' },
  { id: 'l7', name: 'Kubera Lingam', latitude: 12.2612, longitude: 79.0512, type: 'lingam', description: 'Associated with the North direction. Wealth and psychological peace.', mantra: 'Om Sham Kuberaya Namah' },
  { id: 'l8', name: 'Isanya Lingam', latitude: 12.2489, longitude: 79.0690, type: 'lingam', description: 'Associated with the North-East direction. Removes illusions and grants liberation.', mantra: 'Om Ham Isanyaya Namah' },
];

// Haversine Distance Formula for Energy-Efficient Client-Side Geofencing
const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const useGirivalamSession = () => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [showPrep, setShowPreparation] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [distanceCovered, setDistanceCovered] = useState<number>(0);
  const [visitedLocationIds, setVisitedLocationIds] = useState<string[]>([]);
  const [activeGeofence, setActiveGeofence] = useState<SacredLocation | null>(null);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [currentCoord, setCurrentCoord] = useState<{ latitude: number; longitude: number } | null>(null);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const lastLoggedCoord = useRef<{ latitude: number; longitude: number } | null>(null);

  // Restore crashed/previous session on initialization
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          setIsActive(data.isActive);
          setStartTime(data.startTime);
          setDistanceCovered(data.distanceCovered || 0);
          setVisitedLocationIds(data.visitedLocationIds || []);
          setMemories(data.memories || []);
          
          if (data.startTime && data.isActive) {
            const diff = Math.floor((Date.now() - new Date(data.startTime).getTime()) / 1000);
            setElapsedSeconds(diff > 0 ? diff : 0);
          }
        }
      } catch (err) {
        console.error('Failed to restore running Girivalam state:', err);
      }
    };
    restoreSession();
  }, []);

  // Sync mutations back to storage layer for dynamic recovery
  useEffect(() => {
    if (isActive && startTime) {
      const stateDump = JSON.stringify({
        isActive, startTime, distanceCovered, visitedLocationIds, memories
      });
      AsyncStorage.setItem(STORAGE_KEY, stateDump);
    }
  }, [isActive, startTime, distanceCovered, visitedLocationIds, memories]);

  // Elapsed Timer Thread
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // High-Efficiency GPS Tracking Stream
  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 8000, // Balanced evaluation context to save battery over 4 hours
        distanceInterval: 10,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        setCurrentCoord({ latitude, longitude });

        if (lastLoggedCoord.current) {
          const delta = getDistanceInMeters(
            lastLoggedCoord.current.latitude,
            lastLoggedCoord.current.longitude,
            latitude,
            longitude
          );
          if (delta > 5 && delta < 500) { // Reject noisy spikes
            setDistanceCovered((prev) => prev + (delta / 1000));
          }
        }
        lastLoggedCoord.current = { latitude, longitude };

        // Evaluate Geofences Array
        let matchedFence: SacredLocation | null = null;
        SACRED_LOCATIONS.forEach((loc) => {
          const dist = getDistanceInMeters(latitude, longitude, loc.latitude, loc.longitude);
          if (dist <= 60) { // 60 meter geofence radius allocation
            matchedFence = loc;
            if (!visitedLocationIds.includes(loc.id)) {
              setVisitedLocationIds((prev) => [...prev, loc.id]);
            }
          }
        });
        setActiveGeofence(matchedFence);
      }
    );
  };

  const beginPilgrimage = () => {
    const timeString = new Date().toISOString();
    setStartTime(timeString);
    setIsActive(true);
    setShowPreparation(false);
    setElapsedSeconds(0);
    setDistanceCovered(0);
    setVisitedLocationIds([]);
    startTracking();
  };

  const terminatePilgrimage = async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
    setIsActive(false);
    setActiveGeofence(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const addMemory = (type: 'photo' | 'voice' | 'text', payload: { text?: string; uri?: string }) => {
    const entry: MemoryEntry = {
      id: `mem_${Date.now()}`,
      timestamp: new Date().toISOString(),
      latitude: currentCoord?.latitude || 0,
      longitude: currentCoord?.longitude || 0,
      locationName: activeGeofence?.name || 'On Route',
      type,
      ...payload
    };
    setMemories((prev) => [entry, ...prev]);
  };

  return {
    isActive,
    showPrep,
    setShowPreparation,
    startTime,
    elapsedSeconds,
    distanceCovered,
    visitedLocationIds,
    activeGeofence,
    setActiveGeofence,
    memories,
    currentCoord,
    beginPilgrimage,
    terminatePilgrimage,
    addMemory
  };
};