import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { styles } from '../styles/theme';
import { questions } from '../data/quizQuestions';
import { checkBadges, checkProgressBadges, getLevel } from '../utils/gamification';
import { getXP, saveXP, getBadges, saveBadges, getChecklistCompletion } from '../services/storage';
import { checklistItems } from '../data/checklistItems';

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function QuizScreen({ route, navigation }) {
  const category = route.params?.category;

  const [quizQuestions] = useState(() => {
    const filtered = category
      ? questions.filter((q) => q.category === category)
      : questions;
    const shuffledQuestions = shuffleArray(filtered);
    return shuffledQuestions.map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [score, setScore] = useState(0);

  const currentQuestion = quizQuestions[currentIndex];

  const handleAnswer = async (selectedAnswer) => {
    const isCorrect = selectedAnswer === currentQuestion.answer;
    let newXpEarned = xpEarned;
    let newScore = score;

    if (isCorrect) {
      newXpEarned += 20;
      newScore += 1;
      Alert.alert('Correct!', '+20 XP');
    } else {
      Alert.alert('Incorrect', `Correct answer: ${currentQuestion.answer}`);
    }

    setXpEarned(newXpEarned);
    setScore(newScore);

    if (currentIndex + 1 < quizQuestions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await saveProgress(newXpEarned, newScore);
      navigation.navigate('Result', {
        xpEarned: newXpEarned,
        score: newScore,
        total: quizQuestions.length,
      });
    }
  };

  const saveProgress = async (earnedXp, finalScore) => {
    try {
      const oldXp = await getXP();
      const newTotalXp = oldXp + earnedXp;

      const existingBadges = await getBadges();
      let updatedBadges = checkBadges(finalScore, quizQuestions.length, existingBadges);

      const storedCompletion = await getChecklistCompletion();
      const completedCount = checklistItems.filter((item) => storedCompletion[item.id]).length;
      const newLevel = getLevel(newTotalXp);
      updatedBadges = checkProgressBadges(newLevel, completedCount, checklistItems.length, updatedBadges);

      await saveXP(newTotalXp);
      await saveBadges(updatedBadges);
    } catch (error) {
      Alert.alert('Error saving progress', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Question {currentIndex + 1} of {quizQuestions.length}
      </Text>

      <Text style={styles.question}>{currentQuestion.question}</Text>

      {currentQuestion.options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.optionButton}
          onPress={() => handleAnswer(option)}
        >
          <Text style={styles.optionText}>{option}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.smallText}>XP earned this quiz: {xpEarned}</Text>
    </View>
  );
}