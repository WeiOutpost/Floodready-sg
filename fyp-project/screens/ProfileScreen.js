import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { styles } from '../styles/theme';
import { getLevel, getLevelName } from '../utils/gamification';
import { getPreparednessScore } from '../utils/preparednessScore';
import { getXP, getBadges, resetAllProgress, getChecklistCompletion } from '../services/storage';
import { checklistItems } from '../data/checklistItems';

export default function ProfileScreen() {
  const [totalXP, setTotalXP] = useState(0);
  const [badges, setBadges] = useState([]);
  const [completedChecklistCount, setCompletedChecklistCount] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const storedXp = await getXP();
    const storedBadges = await getBadges();
    const storedCompletion = await getChecklistCompletion();

    setTotalXP(storedXp);
    setBadges(storedBadges);
    setCompletedChecklistCount(
      checklistItems.filter((item) => storedCompletion[item.id]).length
    );
  };

  const resetProgress = async () => {
    await resetAllProgress();
    setTotalXP(0);
    setBadges([]);
    setCompletedChecklistCount(0);
    Alert.alert('Progress reset');
  };

  const level = getLevel(totalXP);
  const levelName = getLevelName(totalXP);
  const preparednessScore = getPreparednessScore(totalXP, completedChecklistCount, checklistItems.length);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Profile</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total XP</Text>
        <Text style={styles.cardValue}>{totalXP}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preparedness Level</Text>
        <Text style={styles.cardValue}>{levelName}</Text>
        <Text style={styles.smallText}>Level {level} of 5</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preparedness Score</Text>
        <Text style={styles.cardValue}>{preparednessScore}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Checklist Completion</Text>
        <Text style={styles.cardValue}>{completedChecklistCount} / {checklistItems.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Badges</Text>
        {badges.length === 0 ? (
          <Text style={styles.smallText}>No badges yet</Text>
        ) : (
          badges.map((badge, index) => (
            <Text key={index} style={styles.badge}>🏅 {badge}</Text>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetProgress}>
        <Text style={styles.buttonText}>Reset Progress</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}