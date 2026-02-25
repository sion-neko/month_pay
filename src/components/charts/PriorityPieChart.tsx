import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { PrioritySummary } from '../../types/expense';
import { PRIORITIES } from '../../types/priority';
import { formatCurrency } from '../../utils/format';

interface Props {
  data: PrioritySummary[];
  displayMode: 'monthly' | 'annual';
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function createArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

export function PriorityPieChart({ data, displayMode }: Props) {
  const filteredData = data.filter((item) =>
    displayMode === 'monthly' ? item.totalMonthly > 0 : item.totalAnnual > 0
  );

  if (filteredData.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>データがありません</Text>
      </View>
    );
  }

  const total = filteredData.reduce(
    (sum, item) => sum + (displayMode === 'monthly' ? item.totalMonthly : item.totalAnnual),
    0
  );

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;
  let currentAngle = 0;

  const slices = filteredData.map((item) => {
    const value = displayMode === 'monthly' ? item.totalMonthly : item.totalAnnual;
    const sliceAngle = (value / total) * 360;
    const path = createArcPath(cx, cy, radius, currentAngle, currentAngle + sliceAngle);
    const priority = PRIORITIES[item.priority];
    const color = priority?.color ?? '#C9CBCF';
    const label = priority?.label ?? 'その他';
    currentAngle += sliceAngle;
    return { path, color, label, value, percentage: item.percentage };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          {slices.length === 1 ? (
            <Circle cx={cx} cy={cy} r={radius} fill={slices[0].color} />
          ) : (
            slices.map((slice, i) => (
              <Path key={i} d={slice.path} fill={slice.color} />
            ))
          )}
        </G>
      </Svg>
      <View style={styles.legend}>
        {slices.map((slice, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
            <Text variant="bodySmall" style={styles.legendLabel}>{slice.label}</Text>
            <Text variant="bodySmall" style={styles.legendPercentage}>{slice.percentage}%</Text>
            <Text variant="bodySmall" style={styles.legendValue}>{formatCurrency(slice.value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
    gap: 16,
  },
  empty: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    flex: 1,
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
  },
  legendPercentage: {
    color: '#666',
    minWidth: 32,
    textAlign: 'right',
  },
  legendValue: {
    color: '#666',
    minWidth: 70,
    textAlign: 'right',
  },
});
