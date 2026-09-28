import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { styles } from '../styles/theme';
import { getUserLocation } from '../services/locationService';
import { fetchFloodAlerts } from '../services/floodAlertsApi';
import { fetchAllRainfallReadings, fetchRegionalRainfall } from '../services/rainfallApi';

const SINGAPORE_REGION = {
  latitude: 1.3521,
  longitude: 103.8198,
  latitudeDelta: 0.3,
  longitudeDelta: 0.3,
};

const RAIN_THRESHOLD_MM = 0.2;

export default function FloodMapScreen({ navigation }) {
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [stations, setStations] = useState([]);
  const [regionalRainfall, setRegionalRainfall] = useState({ status: 'loading' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    setLoading(true);

    const location = await getUserLocation();

    if (location.status === 'success') {
      setUserLocation({ latitude: location.latitude, longitude: location.longitude });
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      });
    } else {
      setRegion(SINGAPORE_REGION);
    }

    const alertsResult = await fetchFloodAlerts();
    if (alertsResult.status === 'success') {
      const alertsWithCoords = alertsResult.alerts.filter(
        (a) => a.latitude != null && a.longitude != null
      );
      setAlerts(alertsWithCoords);
    }

    const allStationsResult = await fetchAllRainfallReadings();
    if (allStationsResult.status === 'success') {
      setStations(allStationsResult.stations);
    }

    const rainfallResult = await fetchRegionalRainfall();
    setRegionalRainfall(rainfallResult);

    setLoading(false);
  };

  if (loading || !region) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#0b75bd" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Flood Map</Text>
      <Text style={styles.subtitle}>
        {userLocation
          ? 'Your location, weather by station, and any active flood alerts.'
          : 'Showing Singapore-wide view (location unavailable).'}
      </Text>

      <View style={styles.mapContainer}>
        <MapView style={styles.map} initialRegion={region} toolbarEnabled={false}>
          {userLocation && (
            <Marker coordinate={userLocation} title="You are here" pinColor="blue" />
          )}

          {stations.map((station) => {
            const isRaining = station.value >= RAIN_THRESHOLD_MM;
            return (
              <Marker
                key={station.id}
                coordinate={{ latitude: station.latitude, longitude: station.longitude }}
                title={station.name}
                description={isRaining ? `Raining · ${station.value}mm` : 'Sunny / Dry'}
              >
                <View style={isRaining ? styles.mapIconBubbleRain : styles.mapIconBubbleSun}>
                  <Text style={styles.mapIconEmoji}>{isRaining ? '🌧️' : '☀️'}</Text>
                </View>
              </Marker>
            );
          })}

          {alerts.map((alert) => (
            <Marker
              key={alert.id}
              coordinate={{ latitude: alert.latitude, longitude: alert.longitude }}
              title={alert.area}
              description={alert.message}
              pinColor="red"
            />
          ))}
        </MapView>
      </View>

      {alerts.length === 0 && (
        <Text style={styles.smallText}>No active flood alerts to display on the map.</Text>
      )}

      <Text style={styles.sectionHeading}>Rainfall by Region</Text>

      {regionalRainfall.status === 'loading' && (
        <ActivityIndicator size="small" color="#0b75bd" style={{ marginTop: 8 }} />
      )}

      {regionalRainfall.status === 'error' && (
        <Text style={styles.smallText}>{regionalRainfall.message}</Text>
      )}

      {regionalRainfall.status === 'success' && regionalRainfall.regions.map((r) => (
        <View key={r.region} style={[styles.regionRow, r.isRaining && styles.regionRowRaining]}>
          <View>
            <Text style={styles.regionName}>{r.region}</Text>
            <Text style={styles.regionSubtext}>
              {r.rainingStationCount} of {r.totalStations} stations reporting rain
            </Text>
          </View>
          <Text style={[styles.regionStatusText, { color: r.isRaining ? '#0b75bd' : '#8a9ba8' }]}>
            {r.isRaining ? `🌧️ Raining · ${r.maxValue}mm` : '☀️ Dry'}
          </Text>
        </View>
      ))}

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.secondaryButtonText}>Back Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}