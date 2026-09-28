export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const kmPerDegreeLat = 111;
  const kmPerDegreeLon = 111 * Math.cos((lat1 * Math.PI) / 180);

  const dLat = (lat2 - lat1) * kmPerDegreeLat;
  const dLon = (lon2 - lon1) * kmPerDegreeLon;

  return Math.sqrt(dLat * dLat + dLon * dLon);
}


export function findNearestStation(userLat, userLon, stations) {
  if (!stations || stations.length === 0) {
    return null;
  }

  let nearest = stations[0];
  let shortestDistance = calculateDistanceKm(
    userLat,
    userLon,
    stations[0].location.latitude,
    stations[0].location.longitude
  );

  for (let i = 1; i < stations.length; i++) {
    const distance = calculateDistanceKm(
      userLat,
      userLon,
      stations[i].location.latitude,
      stations[i].location.longitude
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearest = stations[i];
    }
  }

  return nearest;
}