import { calculateDistanceKm } from './locationUtils.js';

export const ALERT_RADIUS_KM = 5;
export const HEAVY_RAIN_MM = 1.0;
export const RAIN_COOLDOWN_MINUTES = 60;
export const MODERATE_RAIN_MM = 0.2;

//checks whether an alert has a real longitude and latitude, making sure both are numbers.
function hasCoords(alert) {
  return typeof alert?.latitude === 'number' && typeof alert?.longitude === 'number';
}

//keep only the flood alertsd that are within 5km of user
export function filterNearbyAlerts(alerts, userLat, userLon, radiusKm = ALERT_RADIUS_KM) {
  if (!Array.isArray(alerts)) return [];
  return alerts.filter(
    (a) => hasCoords(a) && calculateDistanceKm(userLat, userLon, a.latitude, a.longitude) <= radiusKm
  );
}

//removes alerts the user has already been notified about
export function selectNewAlerts(alerts, notifiedIds) {
  const seen = new Set(notifiedIds || []);
  return alerts.filter((a) => !seen.has(a.id));
}

//function to determine if rainfall reading deserves a notification.
export function shouldNotifyRain(valueMm, lastNotifiedAt, now = Date.now()) {
  if (typeof valueMm !== 'number' || valueMm < HEAVY_RAIN_MM) return false;
  if (!lastNotifiedAt) return true;
  const minutesSince = (now - lastNotifiedAt) / 60000;
  return minutesSince >= RAIN_COOLDOWN_MINUTES;
}

//adds labels to the rain level
export function getRainIntensity(valueMm) {
  if (typeof valueMm !== 'number' || valueMm <= 0) return 'No rain';
  if (valueMm < MODERATE_RAIN_MM) return 'Light rain';
  if (valueMm < HEAVY_RAIN_MM) return 'Moderate rain';
  return 'Heavy rain';
}