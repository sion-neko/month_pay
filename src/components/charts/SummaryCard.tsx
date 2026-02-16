import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { formatCurrency } from '../../utils/format';

interface Props {
  monthlyTotal: number;
  annualTotal: number;
  displayMode: 'monthly' | 'annual';
  onModeChange: (mode: 'monthly' | 'annual') => void;
}

export function SummaryCard({ monthlyTotal, annualTotal, displayMode, onModeChange }: Props) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleButton, displayMode === 'monthly' && styles.toggleButtonActive]}
            onPress={() => onModeChange('monthly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, displayMode === 'monthly' && styles.toggleTextActive]}>
              月額
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, displayMode === 'annual' && styles.toggleButtonActive]}
            onPress={() => onModeChange('annual')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, displayMode === 'annual' && styles.toggleTextActive]}>
              年額
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.amountContainer}>
          <Text variant="headlineLarge" style={styles.mainAmount}>
            {formatCurrency(displayMode === 'monthly' ? monthlyTotal : annualTotal)}
          </Text>
          <Text variant="bodySmall" style={styles.subAmount}>
            {displayMode === 'monthly'
              ? `年額換算: ${formatCurrency(annualTotal)}`
              : `月額換算: ${formatCurrency(monthlyTotal)}`}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1976D2',
    overflow: 'hidden',
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: '#1976D2',
  },
  toggleText: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  toggleTextActive: {
    color: '#fff',
  },
  amountContainer: {
    alignItems: 'center',
  },
  mainAmount: {
    fontWeight: 'bold',
    color: '#1976D2',
  },
  subAmount: {
    color: '#666',
    marginTop: 4,
  },
});
