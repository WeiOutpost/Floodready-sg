import { findNearestStation } from '../utils/locationUtils';

const RAINFALL_ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/rainfall';

// Fallback station used only if the user's location isn't available
// (permission denied, or location fetch failed).
// S209 = Yishun Ring Road
const DEFAULT_STATION_ID = 'S209';

export async function fetchRainfall(userLatitude, userLongitude) {
  try {
    const response = await fetch(RAINFALL_ENDPOINT);

    if (!response.ok) {
      return { status: 'error', message: `Server responded with ${response.status}` };
    }

    const json = await response.json();

    if (json.code !== 0) {
      return { status: 'error', message: json.errorMsg || 'Unknown API error' };
    }

    const stations = json.data?.stations || [];
    const readings = json.data?.readings || [];

    if (readings.length === 0) {
      return { status: 'no-data', message: 'No rainfall readings available right now.' };
    }

    const latestReading = readings[0];

    let targetStation = null;

    if (userLatitude != null && userLongitude != null) {
      targetStation = findNearestStation(userLatitude, userLongitude, stations);
    }

    if (!targetStation) {
      targetStation = stations.find((s) => s.id === DEFAULT_STATION_ID);
    }

    if (!targetStation) {
      return { status: 'no-data', message: 'No rainfall station data available.' };
    }

    const stationReading = latestReading.data.find((r) => r.stationId === targetStation.id);

    if (!stationReading) {
      return { status: 'no-data', message: 'No reading found for the nearest station.' };
    }

    return {
      status: 'success',
      stationName: targetStation.name,
      value: stationReading.value,
      timestamp: latestReading.timestamp,
      isUserLocationBased: userLatitude != null && userLongitude != null,
    };
  } catch (error) {
    return { status: 'error', message: 'Unable to reach rainfall service. Check your connection.' };
  }
}

export async function fetchAllRainfallReadings() {
  try {
    const response = await fetch(RAINFALL_ENDPOINT);

    if (!response.ok) {
      return { status: 'error', message: `Server responded with ${response.status}` };
    }

    const json = await response.json();

    if (json.code !== 0) {
      return { status: 'error', message: json.errorMsg || 'Unknown API error' };
    }

    const stations = json.data?.stations || [];
    const readings = json.data?.readings || [];

    if (readings.length === 0) {
      return { status: 'no-data', stations: [] };
    }

    const latestReading = readings[0];
    const readingMap = {};
    latestReading.data.forEach((r) => {
      readingMap[r.stationId] = r.value;
    });

    const combined = stations.map((station) => ({
      id: station.id,
      name: station.name && !/^S\d+$/.test(station.name) ? station.name : `Station ${station.id}`,
      latitude: station.location.latitude,
      longitude: station.location.longitude,
      value: readingMap[station.id] ?? 0,
    }));

    return { status: 'success', stations: combined, timestamp: latestReading.timestamp };
  } catch (error) {
    return { status: 'error', message: 'Unable to reach rainfall service.' };
  }
}

import { classifyRegion } from '../utils/regionUtils';

const RAIN_THRESHOLD_MM = 0.2;

export async function fetchRegionalRainfall() {
  const allReadings = await fetchAllRainfallReadings();

  if (allReadings.status !== 'success') {
    return allReadings;
  }

  const regions = {
    Central: { totalStations: 0, rainingStations: 0, maxValue: 0 },
    North: { totalStations: 0, rainingStations: 0, maxValue: 0 },
    South: { totalStations: 0, rainingStations: 0, maxValue: 0 },
    East: { totalStations: 0, rainingStations: 0, maxValue: 0 },
    West: { totalStations: 0, rainingStations: 0, maxValue: 0 },
  };

  allReadings.stations.forEach((station) => {
    const region = classifyRegion(station.latitude, station.longitude);
    regions[region].totalStations += 1;
    if (station.value >= RAIN_THRESHOLD_MM) {
      regions[region].rainingStations += 1;
    }
    if (station.value > regions[region].maxValue) {
      regions[region].maxValue = station.value;
    }
  });

  const summary = Object.keys(regions).map((regionName) => ({
    region: regionName,
    isRaining: regions[regionName].rainingStations > 0,
    rainingStationCount: regions[regionName].rainingStations,
    totalStations: regions[regionName].totalStations,
    maxValue: regions[regionName].maxValue,
  }));

  return { status: 'success', regions: summary, timestamp: allReadings.timestamp };
}