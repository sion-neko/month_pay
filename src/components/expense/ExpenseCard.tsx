import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Expense } from '../../types/expense';
import { CATEGORIES } from '../../types/category';
import { FREQUENCY_LABELS } from '../../types/frequency';
import { formatCurrency } from '../../utils/format';
import { calculateConvertedAmount } from '../../utils/calculation';

interface Props {
  expense: Expense;
}

export function ExpenseCard({ expense }: Props) {
  const router = useRouter();
  const category = CATEGORIES[expense.category];
  const converted = calculateConvertedAmount(expense);
  const isMonthly = expense.frequency.type === 'monthly';

  return (
    <Card style={styles.card} onPress={() => router.push(`/expenses/${expense.id}`)}>
      <Card.Title
        title={expense.name}
        subtitle={FREQUENCY_LABELS[expense.frequency.type]}
        right={() => (
          <Chip
            icon={category.icon}
            style={[styles.categoryChip, { backgroundColor: category.color }]}
            textStyle={{ color: '#fff', fontSize: 12 }}
            compact
          >
            {category.label}
          </Chip>
        )}
      />
      <Card.Content>
        <Text variant="bodyLarge" style={styles.amount}>
          {formatCurrency(expense.amount)}
          {!isMonthly && <Text style={styles.perPayment}> / 回</Text>}
        </Text>
        {!isMonthly && (
          <Text variant="bodySmall" style={styles.converted}>
            月額換算: {formatCurrency(converted.monthly)}
          </Text>
        )}
        {expense.memo && (
          <Text variant="bodySmall" style={styles.memo} numberOfLines={1}>
            {expense.memo}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  categoryChip: {
    marginRight: 16,
  },
  amount: {
    fontWeight: 'bold',
  },
  perPayment: {
    fontWeight: 'normal',
    fontSize: 14,
    color: '#666',
  },
  converted: {
    color: '#1976D2',
    marginTop: 4,
  },
  memo: {
    marginTop: 8,
    color: '#666',
    fontStyle: 'italic',
  },
});
