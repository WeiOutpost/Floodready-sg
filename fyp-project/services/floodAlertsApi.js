const FLOOD_ALERTS_ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/weather/flood-alerts';

export async function fetchFloodAlerts() {
  try {
    const response = await fetch(FLOOD_ALERTS_ENDPOINT);

    if (!response.ok) {
      return { status: 'error', message: `Server responded with ${response.status}` };
    }

    const json = await response.json();

    if (json.code !== 0) {
      return { status: 'error', message: json.errorMsg || 'Unknown API error' };
    }

    const records = json.data?.records || [];

    if (records.length === 0) {
      return { status: 'no-alerts', message: 'No active flood alerts currently.', updatedTimestamp: null };
    }

    const latestRecord = records[0];
    const readings = latestRecord.item?.readings || [];

    if (readings.length === 0) {
      return {
        status: 'no-alerts',
        message: 'No active flood alerts currently.',
        updatedTimestamp: latestRecord.updatedTimestamp,
      };
    }


    const alerts = readings.map((reading, index) => ({
      id: reading.id || `alert-${index}`,
      area: reading.area || reading.location || reading.description || 'Unknown location',
      message: reading.message || reading.description || 'Flood alert issued.',
      severity: reading.severity || 'Unknown',
      latitude: reading.latitude || reading.coordinates?.latitude || null,
      longitude: reading.longitude || reading.coordinates?.longitude || null,
    }));

    return {
      status: 'success',
      alerts,
      updatedTimestamp: latestRecord.updatedTimestamp,
    };
  } catch (error) {
    return { status: 'error', message: 'Unable to reach flood alerts service. Check your connection.' };
  }
}