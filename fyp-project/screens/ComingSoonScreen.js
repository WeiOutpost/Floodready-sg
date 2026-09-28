import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/theme';

export default function ComingSoonScreen({ route, navigation }) {
  const { title } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        This feature is coming in a later phase of development.
      </Text>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.secondaryButtonText}>Back Home</Text>
      </TouchableOpacity>
    </View>
  );
}