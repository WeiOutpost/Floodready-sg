export function buildMockFloodAlert(userLat, userLon) {
  return {
    id: `mock-${Date.now()}`,
    area: 'Simulated alert near you',
    message: 'Flash flood reported. Water level rising rapidly.',
    severity: 'High',
    latitude: userLat + 0.009,
    longitude: userLon,
    isSimulated: true,
  };
}

export function buildMockHeavyRain() {
  return {
    status: 'success',
    stationName: 'Simulated station',
    value: 3.2,
    timestamp: new Date().toISOString(),
    isUserLocationBased: true,
    isSimulated: true,
  };
}
