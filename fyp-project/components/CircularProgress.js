import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export default function CircularProgress({
  size = 90,
  strokeWidth = 8,
  percentage = 0,
  color = '#0b75bd',
  trackColor = '#d6e8f5',
  topLabel,
  bottomLabel,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference * (1 - clampedPercentage / 100);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        {topLabel && <Text style={{ fontSize: 12, color: '#35556b' }}>{topLabel}</Text>}
        {bottomLabel && <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0b3d66' }}>{bottomLabel}</Text>}
      </View>
    </View>
  );
}