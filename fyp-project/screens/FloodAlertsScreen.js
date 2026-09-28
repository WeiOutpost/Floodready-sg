import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { styles } from '../styles/theme';
import { fetchFloodAlerts } from '../services/floodAlertsApi';

export default function FloodAlertsScreen({ navigation }) {
  const [alertsState, setAlertsState] = useState({ status: 'loading' });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setAlertsState({ status: 'loading' });
    const result = await fetchFloodAlerts();
    setAlertsState(result);
  };

  const renderContent = () => {
    if (alertsState.status === 'loading') {
      return (
        <View style={{ marginTop: 40 }}>
          <ActivityIndicator size="large" color="#0b75bd" />
        </View>
      );
    }

    if (alertsState.status === 'error') {
      return (
        <View style={styles.errorCard}>
          <Text style={styles.noAlertsText}>Unable to check flood alerts</Text>>
          <Text style={styles.smallText}>{alertsState.message}</Text>
          <TouchableOpacity style={styles.button} onPress={loadAlerts}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (alertsState.status === 'no-alerts') {
      return (
        <View style={styles.noAlertsCard}>
          <Text style={styles.noAlertsText}>No active flood alerts currently.</Text>
        </View>
      );
    }

    return (
      <>
        {alertsState.alerts.map((alert) => (
          <View key={alert.id} style={styles.alertCard}>
            <Text style={styles.alertArea}>{alert.area}</Text>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            <Text style={styles.alertSeverity}>Severity: {alert.severity}</Text>
          </View>
        ))}
      </>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Flood Alerts</Text>
      <Text style={styles.subtitle}>Official real-time alerts from PUB.</Text>

      {renderContent()}

      {alertsState.updatedTimestamp && (
        <Text style={styles.lastUpdatedText}>
          Last updated: {new Date(alertsState.updatedTimestamp).toLocaleTimeString()}
        </Text>
      )}

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.secondaryButtonText}>Back Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}