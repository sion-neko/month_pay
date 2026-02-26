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
  const innerRadius = radius * 0.6; // ドーナツの穴のサイズ
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
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G>
            {slices.length === 1 ? (
              <Circle
                cx={cx}
                cy={cy}
                r={radius}
                fill={slices[0].color}
              />
            ) : (
              slices.map((slice, i) => (
                <Path
                  key={i}
                  d={slice.path}
                  fill={slice.color}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              ))
            )}
            {/* ドーナツの穴 */}
            <Circle cx={cx} cy={cy} r={innerRadius} fill="#FFFFFF" />
          </G>
        </Svg>
        {/* 中心に合計金額などを表示することも可能ですが、一旦シンプルに穴だけにします */}
      </View>
      <View style={styles.legend}>
        {slices.map((slice, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
            <View style={styles.legendTextContainer}>
              <Text variant="labelMedium" style={styles.legendLabel}>{slice.label}</Text>
              <View style={styles.legendValueRow}>
                <Text variant="bodySmall" style={styles.legendPercentage}>{slice.percentage}%</Text>
                <Text variant="bodySmall" style={styles.legendValue}>{formatCurrency(slice.value)}</Text>
              </View>
            </View>
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
    marginVertical: 16,
    paddingHorizontal: 16,
    gap: 24,
  },
  chartWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#fff',
    borderRadius: 80,
  },
  empty: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    flex: 1,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  legendValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendPercentage: {
    color: '#666',
    fontSize: 11,
  },
  legendValue: {
    color: '#666',
    fontSize: 11,
    fontWeight: '500',
  },
});
