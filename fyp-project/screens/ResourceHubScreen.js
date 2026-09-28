import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles/theme';
import { beforeFlood, duringFlood, afterFlood, emergencyContacts } from '../data/resourceContent';
import { checklistItems } from '../data/checklistItems';
import { getChecklistCompletion } from '../services/storage';
import CircularProgress from '../components/CircularProgress';

const TABS = [
  { key: 'before', label: 'Before', data: beforeFlood },
  { key: 'during', label: 'During', data: duringFlood },
  { key: 'after', label: 'After', data: afterFlood },
];

export default function ResourceHubScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('before');
  const [completion, setCompletion] = useState({});

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadCompletion();
    });
    return unsubscribe;
  }, [navigation]);

  const loadCompletion = async () => {
    const stored = await getChecklistCompletion();
    setCompletion(stored);
  };

  const completedCount = checklistItems.filter((item) => completion[item.id]).length;
  const nextItem = checklistItems.find((item) => !completion[item.id]);
  const checklistPercent = Math.round((completedCount / checklistItems.length) * 100);

  const activeTabData = TABS.find((t) => t.key === activeTab).data;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resource Hub</Text>
      <Text style={styles.subtitle}>Reliable flood safety information from official sources.</Text>

      <View style={styles.checklistWidgetRow}>
        <CircularProgress
          size={64}
          strokeWidth={6}
          percentage={checklistPercent}
          bottomLabel={`${completedCount}/${checklistItems.length}`}
        />
        <View style={styles.checklistWidgetText}>
          <Text style={styles.checklistWidgetTitle}>Preparedness checklist</Text>
          <Text style={styles.checklistWidgetSubtitle}>
            {nextItem ? `Next: ${nextItem.title}` : 'All steps complete'}
          </Text>
        </View>
        <TouchableOpacity style={styles.resumeButton} onPress={() => navigation.navigate('Checklist')}>
          <Text style={styles.resumeButtonText}>{nextItem ? 'Resume' : 'View'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>What to do?</Text>
      <View style={styles.tabPillRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabPill, activeTab === tab.key && styles.tabPillActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabPillText, activeTab === tab.key && styles.tabPillTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTabData.map((item, index) => (
        <View key={index} style={styles.resourceItem}>
          <Text style={styles.resourceItemTitle}>{item.title}</Text>
          <Text style={styles.resourceItemDetail}>{item.detail}</Text>
        </View>
      ))}

      <Text style={styles.sectionHeading}>Emergency Contacts</Text>
      {emergencyContacts.map((contact, index) => (
        <View key={index} style={styles.contactRow}>
          <Text style={styles.contactName}>{contact.name}</Text>
          <Text style={styles.contactNumber}>{contact.number}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.secondaryButtonText}>Back Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}