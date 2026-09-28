import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getXP() {
  try {
    const storedXp = await AsyncStorage.getItem('totalXP');
    return storedXp ? parseInt(storedXp) : 0;
  } catch (error) {
    console.log('Error getting XP:', error);
    return 0;
  }
}

export async function saveXP(newTotalXp) {
  try {
    await AsyncStorage.setItem('totalXP', newTotalXp.toString());
  } catch (error) {
    console.log('Error saving XP:', error);
  }
}

export async function getBadges() {
  try {
    const storedBadges = await AsyncStorage.getItem('badges');
    return storedBadges ? JSON.parse(storedBadges) : [];
  } catch (error) {
    console.log('Error getting badges:', error);
    return [];
  }
}

export async function saveBadges(badges) {
  try {
    await AsyncStorage.setItem('badges', JSON.stringify(badges));
  } catch (error) {
    console.log('Error saving badges:', error);
  }
}

export async function resetAllProgress() {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.log('Error resetting progress:', error);
  }
}

export async function getChecklistCompletion() {
  try {
    const stored = await AsyncStorage.getItem('checklistCompletion');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.log('Error getting checklist completion:', error);
    return {};
  }
}

export async function saveChecklistCompletion(completionMap) {
  try {
    await AsyncStorage.setItem('checklistCompletion', JSON.stringify(completionMap));
  } catch (error) {
    console.log('Error saving checklist completion:', error);
  }
}