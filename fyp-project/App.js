import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import QuizCategoryScreen from './screens/QuizCategoryScreen';
import QuizScreen from './screens/QuizScreen';
import ResultScreen from './screens/ResultsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ResourceHubScreen from './screens/ResourceHubScreen';
import ChecklistScreen from './screens/ChecklistScreen';
import FloodAlertsScreen from './screens/FloodAlertsScreen';
import FloodMapScreen from './screens/FloodMapScreen';
import { initNotifications, scheduleChecklistReminder } from './services/notificationService';

const Stack = createNativeStackNavigator();

export default function App() {
    useEffect(() => {
    initNotifications().then((granted) => {
      if (granted) scheduleChecklistReminder();
    });
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="QuizCategory" component={QuizCategoryScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="FloodAlerts" component={FloodAlertsScreen} />
        <Stack.Screen name="FloodMap" component={FloodMapScreen} />
        <Stack.Screen name="ResourceHub" component={ResourceHubScreen} />
        <Stack.Screen name="Checklist" component={ChecklistScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}