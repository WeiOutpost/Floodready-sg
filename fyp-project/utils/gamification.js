const LEVELS = [
  { level: 1, name: 'Flood Beginner', minXP: 0, nextXP: 100 },
  { level: 2, name: 'Flood Aware', minXP: 100, nextXP: 250 },
  { level: 3, name: 'Prepared Resident', minXP: 250, nextXP: 450 },
  { level: 4, name: 'Flood Ready', minXP: 450, nextXP: 700 },
  { level: 5, name: 'Community Protector', minXP: 700, nextXP: 700 },
];

export function getLevel(xp) {
  let current = LEVELS[0];
  for (const tier of LEVELS) {
    if (xp >= tier.minXP) current = tier;
  }
  return current.level;
}

export function getLevelName(xp) {
  let current = LEVELS[0];
  for (const tier of LEVELS) {
    if (xp >= tier.minXP) current = tier;
  }
  return current.name;
}

export function getXPProgress(xp) {
  const tierIndex = LEVELS.findIndex((t, i) => {
    const next = LEVELS[i + 1];
    return xp >= t.minXP && (!next || xp < next.minXP);
  });
  const tier = LEVELS[tierIndex];
  const isMaxLevel = tier.level === 5;

  return {
    currentLevelStart: tier.minXP,
    nextLevelXP: tier.nextXP,
    isMaxLevel,
  };
}

export function checkBadges(finalScore, totalQuestions, existingBadges) {
  const badges = [...existingBadges];

  if (!badges.includes('Flood Aware')) {
    badges.push('Flood Aware');
  }

  if (finalScore === totalQuestions && !badges.includes('Quiz Master')) {
    badges.push('Quiz Master');
  }

  return badges;
}

export function checkProgressBadges(level, completedChecklistCount, totalChecklistCount, existingBadges) {
  const badges = [...existingBadges];

  if (
    totalChecklistCount > 0 &&
    completedChecklistCount === totalChecklistCount &&
    !badges.includes('Prepared Resident')
  ) {
    badges.push('Prepared Resident');
  }

  if (level >= 4 && !badges.includes('Flood Expert')) {
    badges.push('Flood Expert');
  }

  return badges;
}