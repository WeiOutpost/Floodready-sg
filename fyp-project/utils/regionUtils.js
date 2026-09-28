// Singapore's approximate geographic center.
const CENTER_LAT = 1.3521;
const CENTER_LON = 103.8198;

// Stations within this distance in km of the center are classified as Central,
// regardless of direction. 
const CENTRAL_RADIUS_KM = 6;

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const kmPerDegreeLat = 111;
  const kmPerDegreeLon = 111 * Math.cos(toRadians(lat1));
  const dLat = (lat2 - lat1) * kmPerDegreeLat;
  const dLon = (lon2 - lon1) * kmPerDegreeLon;
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

export function classifyRegion(lat, lon) {
  const distFromCenter = distanceKm(CENTER_LAT, CENTER_LON, lat, lon);

  if (distFromCenter <= CENTRAL_RADIUS_KM) {
    return 'Central';
  }

  const latDiff = lat - CENTER_LAT;
  const lonDiff = lon - CENTER_LON;

  // Whichever axis has the larger offset determines priority
  if (Math.abs(latDiff) > Math.abs(lonDiff)) {
    return latDiff > 0 ? 'North' : 'South';
  } else {
    return lonDiff > 0 ? 'East' : 'West';
  }
}