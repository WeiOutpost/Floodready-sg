import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { styles } from '../styles/theme';
import { getLevel, getLevelName, getXPProgress } from '../utils/gamification';
import { getPreparednessScore } from '../utils/preparednessScore';
import { getXP, getChecklistCompletion } from '../services/storage';
import { checklistItems } from '../data/checklistItems';
import { fetchRainfall } from '../services/rainfallApi';
import { fetchFloodAlerts } from '../services/floodAlertsApi';
import { getUserLocation } from '../services/locationService';
import {
  notifyNearbyAlerts,
  notifyHeavyRain,
  simulateFloodAlert,
  simulateHeavyRain,
} from '../services/notificationService';
import { getRainIntensity } from '../utils/alertUtils';
import CircularProgress from '../components/CircularProgress';

export default function HomeScreen({ navigation }) {
  const [totalXP, setTotalXP] = useState(0);
  const [completedChecklistCount, setCompletedChecklistCount] = useState(0);
  const [rainfall, setRainfall] = useState({ status: 'loading' });
  const [alerts, setAlerts] = useState({ status: 'loading' });
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProgress();
      loadLiveData();
    });
    return unsubscribe;
  }, [navigation]);

  // Location is fetched once and shared by rainfall and flood alerts.
  const loadLiveData = async () => {
    const result = await getUserLocation();
    const location = result.status === 'success' ? result : null;
    setUserLocation(location);
    loadRainfall(location);
    loadAlerts(location);
  };

  const loadProgress = async () => {
    const storedXp = await getXP();
    const storedCompletion = await getChecklistCompletion();
    setTotalXP(storedXp);
    setCompletedChecklistCount(
      checklistItems.filter((item) => storedCompletion[item.id]).length
    );
  };

  const loadRainfall = async (location) => {
    setRainfall({ status: 'loading' });
    const result = location
      ? await fetchRainfall(location.latitude, location.longitude)
      : await fetchRainfall();
    setRainfall(result);
    notifyHeavyRain(result);
  };

  const loadAlerts = async (location) => {
    setAlerts({ status: 'loading' });
    const result = await fetchFloodAlerts();
    setAlerts(result);
    if (result.status === 'success' && location) {
      notifyNearbyAlerts(result.alerts, location.latitude, location.longitude);
    }
  };

  // Demo only: send mock data through the real notification pipeline.
  const handleSimulateFlood = async () => {
    if (!userLocation) return;
    const mock = await simulateFloodAlert(userLocation.latitude, userLocation.longitude);
    setAlerts({ status: 'success', alerts: [mock], updatedTimestamp: new Date().toISOString() });
  };

  const handleSimulateRain = async () => {
    const mock = await simulateHeavyRain();
    setRainfall(mock);
  };

  const level = getLevel(totalXP);
  const levelName = getLevelName(totalXP);
  const preparednessScore = getPreparednessScore(totalXP, completedChecklistCount, checklistItems.length);
  const { currentLevelStart, nextLevelXP, isMaxLevel } = getXPProgress(totalXP);
  const xpRingPercent = isMaxLevel
    ? 100
    : Math.round(((totalXP - currentLevelStart) / (nextLevelXP - currentLevelStart)) * 100);

  const headerSubtitle = rainfall.status === 'success'
    ? `Near ${rainfall.stationName} · ${new Date(rainfall.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'FloodReady SG';

  const isAlertActive = alerts.status === 'success' && alerts.alerts.length > 0;
  const isAlertError = alerts.status === 'error';

  // An error is never shown as "safe": it gets its own amber state.
  let bannerStyle = styles.statusBannerGreen;
  let bannerTitle = 'No flood risk right now';
  let bannerSubtext = 'Rainfall and alert data from PUB and NEA';
  let bannerIcon = '✅';
  if (isAlertActive) {
    bannerStyle = styles.statusBannerRed;
    bannerTitle = `${alerts.alerts.length} active flood alert(s)`;
    bannerIcon = '⚠️';
  } else if (isAlertError) {
    bannerStyle = styles.statusBannerAmber;
    bannerTitle = 'Flood alert status unavailable';
    bannerSubtext = `${alerts.message} Check PUB's official channels. Tap to retry.`;
    bannerIcon = '❔';
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>FloodReady SG</Text>
        <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
      </View>

      {alerts.status === 'loading' && (
        <View style={{ marginBottom: 16 }}><ActivityIndicator size="small" color="#0b75bd" /></View>
      )}

      {alerts.status !== 'loading' && (
        <TouchableOpacity
          style={bannerStyle}
          onPress={isAlertError ? () => loadAlerts(userLocation) : () => navigation.navigate('FloodAlerts')}
        >
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.statusBannerText}>{bannerTitle}</Text>
            <Text style={styles.statusBannerSubtext}>{bannerSubtext}</Text>
          </View>
          <Text style={{ fontSize: 22 }}>{bannerIcon}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.demoRow}>
        {userLocation && (
          <TouchableOpacity style={styles.demoButton} onPress={handleSimulateFlood}>
            <Text style={styles.demoButtonText}>Simulate flood alert</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.demoButton} onPress={handleSimulateRain}>
          <Text style={styles.demoButtonText}>Simulate heavy rain</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ringCardRow}>
        <CircularProgress
          percentage={preparednessScore}
          topLabel=""
          bottomLabel={`${preparednessScore}%`}
        />
        <View style={styles.ringCardTextContainer}>
          <Text style={styles.ringCardLabel}>Your Preparedness</Text>
          <Text style={styles.ringCardValue}>{preparednessScore}%</Text>
          <Text style={styles.listRowSubtitle}>{completedChecklistCount} of {checklistItems.length} checklist steps done</Text>
        </View>
      </View>

      <View style={styles.ringCardRow}>
        <CircularProgress
          percentage={xpRingPercent}
          color="#2e9e5b"
          topLabel="Level"
          bottomLabel={`${level}`}
        />
        <View style={styles.ringCardTextContainer}>
          <Text style={styles.ringCardLabel}>{levelName}</Text>
          <Text style={styles.ringCardValue}>
            {isMaxLevel ? 'Max Level' : `${totalXP} / ${nextLevelXP} XP`}
          </Text>
          {!isMaxLevel && (
            <Text style={styles.listRowSubtitle}>{nextLevelXP - totalXP} XP to next level</Text>
          )}
        </View>
      </View>

      <View style={styles.dashboardCard}>
        <Text style={styles.dashboardCardTitle}>Rainfall</Text>
        {rainfall.status === 'loading' && <ActivityIndicator size="small" color="#0b75bd" style={{ marginTop: 8 }} />}
        {(rainfall.status === 'error' || rainfall.status === 'no-data') && (
          <Text style={styles.smallText}>{rainfall.message}</Text>
        )}
        {rainfall.status === 'success' && (
          <>
            <Text style={styles.dashboardCardValue}>{rainfall.value} mm</Text>
            <Text style={styles.smallText}>{getRainIntensity(rainfall.value)} in the last 5 minutes</Text>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.listRow} onPress={() => navigation.navigate('FloodAlerts')}>
        <View style={styles.listRowTextContainer}>
          <Text style={styles.listRowTitle}>Flood Alerts</Text>
          <Text style={styles.listRowSubtitle}>
            {isAlertActive
              ? `${alerts.alerts.length} active`
              : alerts.status === 'no-alerts'
                ? 'No active alerts'
                : isAlertError
                  ? 'Unavailable'
                  : 'Live from PUB'}
          </Text>
        </View>
        <Text style={styles.listRowChevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.listRow} onPress={() => navigation.navigate('FloodMap')}>
        <View style={styles.listRowTextContainer}>
          <Text style={styles.listRowTitle}>Flood Map</Text>
          <Text style={styles.listRowSubtitle}>View alerts near you</Text>
        </View>
        <Text style={styles.listRowChevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.listRow} onPress={() => navigation.navigate('QuizCategory')}>
        <View style={styles.listRowTextContainer}>
          <Text style={styles.listRowTitle}>Preparedness Quiz</Text>
          <Text style={styles.listRowSubtitle}>5 Categories +20 XP each question</Text>
        </View>
        <Text style={styles.listRowChevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.listRow} onPress={() => navigation.navigate('ResourceHub')}>
        <View style={styles.listRowTextContainer}>
          <Text style={styles.listRowTitle}>Resource Hub</Text>
          <Text style={styles.listRowSubtitle}>Guides from PUB and IFRC</Text>
        </View>
        <Text style={styles.listRowChevron}></Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.listRow} onPress={() => navigation.navigate('Profile')}>
        <View style={styles.listRowTextContainer}>
          <Text style={styles.listRowTitle}>Profile</Text>
          <Text style={styles.listRowSubtitle}>Badges, level and progress</Text>
        </View>
        <Text style={styles.listRowChevron}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}