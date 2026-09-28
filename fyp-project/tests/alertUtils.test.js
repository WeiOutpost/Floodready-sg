// Unit tests for alert and rain notification logic.
// Test cases chosen by boundary value analysis and equivalence partitioning.
import { test } from 'node:test';
import assert from 'node:assert';
import {
  filterNearbyAlerts, selectNewAlerts, shouldNotifyRain, getRainIntensity,
  ALERT_RADIUS_KM, HEAVY_RAIN_MM, MODERATE_RAIN_MM, RAIN_COOLDOWN_MINUTES,
} from '../utils/alertUtils.js';
import { buildMockFloodAlert } from '../data/mockAlerts.js';

const USER = { lat: 1.3521, lon: 103.8198 };
const KM_PER_DEGREE_LAT = 111; // matches calculateDistanceKm
const alertAtKm = (id, km) => ({ id, latitude: USER.lat + km / KM_PER_DEGREE_LAT, longitude: USER.lon });

// --- Flood alerts: boundaries around the 5 km radius
test('Alert at the user location is kept', () => {
  assert.strictEqual(filterNearbyAlerts([alertAtKm('a', 0)], USER.lat, USER.lon).length, 1);
});
test('Alert just inside the radius is kept', () => {
  assert.strictEqual(filterNearbyAlerts([alertAtKm('b', ALERT_RADIUS_KM - 0.01)], USER.lat, USER.lon).length, 1);
});
test('Alert just outside the radius is dropped', () => {
  assert.strictEqual(filterNearbyAlerts([alertAtKm('c', ALERT_RADIUS_KM + 0.01)], USER.lat, USER.lon).length, 0);
});

// --- Flood alerts: invalid input partitions
test('Empty or null alert lists return an empty list', () => {
  assert.deepStrictEqual(filterNearbyAlerts([], USER.lat, USER.lon), []);
  assert.deepStrictEqual(filterNearbyAlerts(null, USER.lat, USER.lon), []);
});
test('Alerts without coordinates are skipped', () => {
  assert.deepStrictEqual(filterNearbyAlerts([{ id: 'x', latitude: null, longitude: null }], USER.lat, USER.lon), []);
});
test('Mixed list keeps only the nearby alert', () => {
  const mixed = [alertAtKm('near', 1), alertAtKm('far', 20), { id: 'nocoords', latitude: null, longitude: null }];
  assert.deepStrictEqual(filterNearbyAlerts(mixed, USER.lat, USER.lon).map((a) => a.id), ['near']);
});

// --- Flood alerts: de-duplication
test('De-duplication with no, full and partial history', () => {
  const alerts = [{ id: '1' }, { id: '2' }, { id: '3' }];
  assert.strictEqual(selectNewAlerts(alerts, []).length, 3);
  assert.strictEqual(selectNewAlerts(alerts, ['1', '2', '3']).length, 0);
  assert.deepStrictEqual(selectNewAlerts(alerts, ['2']).map((a) => a.id), ['1', '3']);
  assert.strictEqual(selectNewAlerts(alerts, undefined).length, 3);
});
test('Simulated alert passes the real radius filter', () => {
  const mock = buildMockFloodAlert(USER.lat, USER.lon);
  assert.strictEqual(filterNearbyAlerts([mock], USER.lat, USER.lon).length, 1);
});

// --- Rain: boundaries around the heavy rain threshold
test('No rain or just below the threshold does not notify', () => {
  assert.strictEqual(shouldNotifyRain(0, null), false);
  assert.strictEqual(shouldNotifyRain(HEAVY_RAIN_MM - 0.1, null), false);
});
test('Exactly at or above the threshold notifies', () => {
  assert.strictEqual(shouldNotifyRain(HEAVY_RAIN_MM, null), true);
  assert.strictEqual(shouldNotifyRain(HEAVY_RAIN_MM + 0.1, null), true);
});
test('Missing or non-numeric rainfall does not notify', () => {
  assert.strictEqual(shouldNotifyRain(undefined, null), false);
  assert.strictEqual(shouldNotifyRain('5', null), false);
});

// --- Rain: boundaries around the 60-minute cooldown
test('Cooldown boundaries at 59, 60 and 61 minutes', () => {
  const NOW = 1_000_000_000_000;
  const minutesAgo = (m) => NOW - m * 60000;
  assert.strictEqual(shouldNotifyRain(5, minutesAgo(RAIN_COOLDOWN_MINUTES - 1), NOW), false);
  assert.strictEqual(shouldNotifyRain(5, minutesAgo(RAIN_COOLDOWN_MINUTES), NOW), true);
  assert.strictEqual(shouldNotifyRain(5, minutesAgo(RAIN_COOLDOWN_MINUTES + 1), NOW), true);
});

// --- Rain intensity labels
test('Rain intensity boundaries between bands', () => {
  assert.strictEqual(getRainIntensity(0), 'No rain');
  assert.strictEqual(getRainIntensity(0.1), 'Light rain');
  assert.strictEqual(getRainIntensity(MODERATE_RAIN_MM), 'Moderate rain');
  assert.strictEqual(getRainIntensity(HEAVY_RAIN_MM - 0.1), 'Moderate rain');
  assert.strictEqual(getRainIntensity(HEAVY_RAIN_MM), 'Heavy rain');
  assert.strictEqual(getRainIntensity(undefined), 'No rain');
});