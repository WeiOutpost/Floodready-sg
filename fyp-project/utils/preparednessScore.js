export function getPreparednessScore(xp, completedChecklistCount, totalChecklistCount) {
  const MAX_XP_FOR_SCORE = 700;
  const xpPercent = Math.min(100, Math.floor((xp / MAX_XP_FOR_SCORE) * 100));

  const checklistPercent = totalChecklistCount > 0
    ? Math.floor((completedChecklistCount / totalChecklistCount) * 100)
    : 0;

  const combinedScore = Math.floor((xpPercent * 0.5) + (checklistPercent * 0.5));

  return combinedScore;
}