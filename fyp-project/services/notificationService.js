import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateDistanceKm } from '../utils/locationUtils';
import { filterNearbyAlerts, selectNewAlerts, shouldNotifyRain } from '../utils/alertUtils';
import { buildMockFloodAlert, buildMockHeavyRain } from '../data/mockAlerts';

const NOTIFIED_ALERTS_KEY = 'notifiedAlertIds';
const LAST_RAIN_KEY = 'lastRainNotifiedAt';
const REMINDER_KEY = 'checklistReminderId';

// Show notifications even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Call once on app start. Returns true if permission was granted.
export async function initNotifications() {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Flood alerts and reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.log('Error setting up notifications:', error);
    return false;
  }
}

// Flood alerts: notify about alerts within range that the user hasn't been told about yet.
export async function notifyNearbyAlerts(alerts, userLat, userLon) {
  try {
    const nearby = filterNearbyAlerts(alerts, userLat, userLon);
    const stored = await AsyncStorage.getItem(NOTIFIED_ALERTS_KEY);
    const notified = stored ? JSON.parse(stored) : [];
    const fresh = selectNewAlerts(nearby, notified);

    for (const alert of fresh) {
      const km = calculateDistanceKm(userLat, userLon, alert.latitude, alert.longitude).toFixed(1);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Flood alert: ${alert.area}`,
          body: `${alert.message} About ${km} km from you. Avoid the area and open FloodReady for what to do.`,
          data: { alertId: alert.id },
        },
        trigger: null, // deliver immediately
      });
    }

    if (fresh.length > 0) {
      await AsyncStorage.setItem(NOTIFIED_ALERTS_KEY, JSON.stringify([...notified, ...fresh.map((a) => a.id)]));
    }
    return fresh.length;
  } catch (error) {
    console.log('Error sending flood alert notification:', error);
    return 0;
  }
}

// Heavy rain: notify when the user's nearest station passes the threshold, at most once per cooldown.
export async function notifyHeavyRain(rainfall) {
  try {
    // Only warn about rain near the user, not the fallback station.
    if (rainfall?.status !== 'success' || !rainfall.isUserLocationBased) return false;

    const stored = await AsyncStorage.getItem(LAST_RAIN_KEY);
    const lastNotifiedAt = stored ? parseInt(stored, 10) : null;
    if (!shouldNotifyRain(rainfall.value, lastNotifiedAt)) return false;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Heavy rain near ${rainfall.stationName}`,
        body: `${rainfall.value} mm in the last 5 minutes. Flash floods can develop quickly. Avoid canals, drains and low-lying areas.`,
      },
      trigger: null,
    });
    await AsyncStorage.setItem(LAST_RAIN_KEY, Date.now().toString());
    return true;
  } catch (error) {
    console.log('Error sending heavy rain notification:', error);
    return false;
  }
}

// Demo: mock flood alert near the user, sent through the real pipeline.
export async function simulateFloodAlert(userLat, userLon) {
  const mock = buildMockFloodAlert(userLat, userLon);
  await notifyNearbyAlerts([mock], userLat, userLon);
  return mock;
}

// Demo: mock heavy rain reading. Clears the cooldown so the demo always fires.
export async function simulateHeavyRain() {
  await AsyncStorage.removeItem(LAST_RAIN_KEY);
  const mock = buildMockHeavyRain();
  await notifyHeavyRain(mock);
  return mock;
}

// Weekly nudge to review the checklist (Sunday 10:00). Replaces any existing one.
export async function scheduleChecklistReminder() {
  try {
    const oldId = await AsyncStorage.getItem(REMINDER_KEY);
    if (oldId) await Notifications.cancelScheduledNotificationAsync(oldId);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly preparedness check',
        body: 'Take two minutes to review your flood checklist and earn XP.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // 1 = Sunday
        hour: 10,
        minute: 0,
      },
    });
    await AsyncStorage.setItem(REMINDER_KEY, id);
  } catch (error) {
    console.log('Error scheduling checklist reminder:', error);
  }
}