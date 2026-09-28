import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { styles } from '../styles/theme';
import { checklistItems } from '../data/checklistItems';
import { getChecklistCompletion, saveChecklistCompletion, getXP, getBadges, saveBadges } from '../services/storage';
import { getLevel, checkProgressBadges } from '../utils/gamification';

export default function ChecklistScreen({ navigation }) {
  const [completion, setCompletion] = useState({});

  useEffect(() => {
    loadCompletion();
  }, []);

  const loadCompletion = async () => {
    const stored = await getChecklistCompletion();
    setCompletion(stored);
  };

  const toggleItem = async (itemId) => {
    const updated = {
      ...completion,
      [itemId]: !completion[itemId],
    };
    setCompletion(updated);
    await saveChecklistCompletion(updated);

    const completedCount = checklistItems.filter((item) => updated[item.id]).length;
    const totalXP = await getXP();
    const level = getLevel(totalXP);
    const existingBadges = await getBadges();
    const updatedBadges = checkProgressBadges(level, completedCount, checklistItems.length, existingBadges);

    if (updatedBadges.length > existingBadges.length) {
      await saveBadges(updatedBadges);
      const newBadge = updatedBadges.find((b) => !existingBadges.includes(b));
      Alert.alert('Badge Unlocked!', newBadge);
    }
  };

  const completedCount = checklistItems.filter((item) => completion[item.id]).length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Preparedness Checklist</Text>
      <Text style={styles.subtitle}>
        {completedCount} / {checklistItems.length} completed
      </Text>

      {checklistItems.map((item) => {
        const isChecked = !!completion[item.id];
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.checklistItem}
            onPress={() => toggleItem(item.id)}
          >
            <View
              style={[
                styles.checklistCheckbox,
                isChecked && styles.checklistCheckboxChecked,
              ]}
            >
              {isChecked && <Text style={{ color: 'white', fontWeight: 'bold' }}>✓</Text>}
            </View>
            <View style={styles.checklistTextContainer}>
              <Text style={styles.resourceItemTitle}>{item.title}</Text>
              <Text style={styles.resourceItemDetail}>{item.detail}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.secondaryButtonText}>Back Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}