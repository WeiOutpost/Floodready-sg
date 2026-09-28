import * as Location from 'expo-location';

export async function getUserLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return { status: 'denied', message: 'Location permission was not granted.' };
    }

    const position = await Location.getCurrentPositionAsync({});

    return {
      status: 'success',
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch (error) {
    return { status: 'error', message: 'Unable to determine your location.' };
  }
}