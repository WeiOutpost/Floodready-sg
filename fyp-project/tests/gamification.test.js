// Unit tests for gamification, preparedness score and location utilities.
// Test cases chosen by boundary value analysis (values either side of each threshold)
// and equivalence partitioning (valid, empty and edge-case inputs).
import { test } from 'node:test';
import assert from 'node:assert';
import { getLevel, getLevelName, getXPProgress, checkBadges, checkProgressBadges } from '../utils/gamification.js';
import { getPreparednessScore } from '../utils/preparednessScore.js';
import { calculateDistanceKm, findNearestStation } from '../utils/locationUtils.js';

// --- Levels: boundaries at 100, 250, 450 and 700 XP
test('0 XP is Level 1, Flood Beginner', () => {
  assert.strictEqual(getLevel(0), 1);
  assert.strictEqual(getLevelName(0), 'Flood Beginner');
});
test('99 XP is still Level 1; 100 XP is Level 2', () => {
  assert.strictEqual(getLevel(99), 1);
  assert.strictEqual(getLevel(100), 2);
});
test('249 XP is Level 2; 250 XP is Level 3', () => {
  assert.strictEqual(getLevel(249), 2);
  assert.strictEqual(getLevel(250), 3);
});
test('449 XP is Level 3; 450 XP is Level 4', () => {
  assert.strictEqual(getLevel(449), 3);
  assert.strictEqual(getLevel(450), 4);
});
test('699 XP is Level 4; 700 XP is Level 5, Community Protector', () => {
  assert.strictEqual(getLevel(699), 4);
  assert.strictEqual(getLevel(700), 5);
  assert.strictEqual(getLevelName(700), 'Community Protector');
});
test('999 XP is capped at Level 5', () => {
  assert.strictEqual(getLevel(999), 5);
});

// --- XP progress ring
test('XP progress at the start of Level 2', () => {
  assert.deepStrictEqual(getXPProgress(100), { currentLevelStart: 100, nextLevelXP: 250, isMaxLevel: false });
});
test('XP progress at max level', () => {
  assert.strictEqual(getXPProgress(700).isMaxLevel, true);
  assert.strictEqual(getXPProgress(999).isMaxLevel, true);
});

// --- Quiz badges
test('Any completed quiz awards Flood Aware', () => {
  assert.deepStrictEqual(checkBadges(0, 5, []), ['Flood Aware']);
});
test('Perfect score awards both Flood Aware and Quiz Master', () => {
  assert.deepStrictEqual(checkBadges(5, 5, []), ['Flood Aware', 'Quiz Master']);
});
test('One below perfect does not award Quiz Master', () => {
  assert.deepStrictEqual(checkBadges(4, 5, []), ['Flood Aware']);
});
test('Badges already earned are not duplicated', () => {
  assert.deepStrictEqual(checkBadges(5, 5, ['Flood Aware', 'Quiz Master']), ['Flood Aware', 'Quiz Master']);
});

// --- Progress badges
test('Full checklist awards Prepared Resident', () => {
  assert.deepStrictEqual(checkProgressBadges(1, 6, 6, []), ['Prepared Resident']);
});
test('One checklist item short does not award Prepared Resident', () => {
  assert.deepStrictEqual(checkProgressBadges(1, 5, 6, []), []);
});
test('Empty checklist (0 of 0) does not award Prepared Resident', () => {
  assert.deepStrictEqual(checkProgressBadges(1, 0, 0, []), []);
});
test('Level 3 does not award Flood Expert; Level 4 does', () => {
  assert.deepStrictEqual(checkProgressBadges(3, 0, 6, []), []);
  assert.deepStrictEqual(checkProgressBadges(4, 0, 6, []), ['Flood Expert']);
});

// --- Preparedness score (50% XP, 50% checklist)
test('No XP and no checklist is 0%', () => {
  assert.strictEqual(getPreparednessScore(0, 0, 6), 0);
});
test('60 XP and full checklist is 54%', () => {
  // xpPercent = floor(60/700*100) = 8, checklistPercent = 100
  assert.strictEqual(getPreparednessScore(60, 6, 6), 54);
});
test('700 XP and full checklist is 100%', () => {
  assert.strictEqual(getPreparednessScore(700, 6, 6), 100);
});
test('XP above 700 is capped, so XP alone cannot exceed 50%', () => {
  assert.strictEqual(getPreparednessScore(1000, 0, 6), 50);
});
test('Empty checklist does not divide by zero', () => {
  assert.strictEqual(getPreparednessScore(700, 0, 0), 50);
});

// --- Location
test('Distance from a point to itself is 0 km', () => {
  assert.strictEqual(calculateDistanceKm(1.35, 103.82, 1.35, 103.82), 0);
});
test('findNearestStation returns null for empty or missing station lists', () => {
  assert.strictEqual(findNearestStation(1.35, 103.82, []), null);
  assert.strictEqual(findNearestStation(1.35, 103.82, null), null);
});
test('findNearestStation picks the genuinely closest station', () => {
  const stations = [
    { name: 'Far', location: { latitude: 1.45, longitude: 103.82 } },
    { name: 'Near', location: { latitude: 1.36, longitude: 103.82 } },
    { name: 'Middle', location: { latitude: 1.40, longitude: 103.82 } },
  ];
  assert.strictEqual(findNearestStation(1.35, 103.82, stations).name, 'Near');
});