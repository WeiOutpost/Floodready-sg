import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/theme';

export default function ResultScreen({ route, navigation }) {
  const { xpEarned, score, total } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Complete</Text>

      <Text style={styles.resultText}>
        Score: {score}/{total}
      </Text>

      <Text style={styles.resultText}>XP Earned: {xpEarned}</Text>

      <Text style={styles.subtitle}>
        Badge unlocked: Flood Aware
      </Text>

      {score === total && (
        <Text style={styles.subtitle}>Bonus badge unlocked: Quiz Master</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.buttonText}>View Progress</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.secondaryButtonText}>Back Home</Text>
      </TouchableOpacity>
    </View>
  );
}