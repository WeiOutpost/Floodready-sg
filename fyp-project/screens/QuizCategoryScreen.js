import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles/theme';
import { questions, quizCategories } from '../data/quizQuestions';

export default function QuizCategoryScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Preparedness Quiz</Text>
      <Text style={styles.subtitle}>Choose a topic to test your knowledge.</Text>

      {quizCategories.map((category) => {
        const count = questions.filter((q) => q.category === category).length;
        return (
          <TouchableOpacity
            key={category}
            style={styles.categoryCard}
            onPress={() => navigation.navigate('Quiz', { category })}
          >
            <View>
              <Text style={styles.categoryCardTitle}>{category}</Text>
              <Text style={styles.categoryCardSubtitle}>{count} questions · +20 XP each</Text>
            </View>
            <Text style={styles.listRowChevron}>›</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.secondaryButtonText}>Back Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}