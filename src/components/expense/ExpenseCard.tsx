import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Expense } from '../../types/expense';
import { PRIORITIES } from '../../types/priority';
import { FREQUENCY_LABELS } from '../../types/frequency';
import { formatCurrency } from '../../utils/format';
import { calculateConvertedAmount } from '../../utils/calculation';
import { useTagContext } from '../../contexts/TagContext';

interface Props {
  expense: Expense;
}

export function ExpenseCard({ expense }: Props) {
  const router = useRouter();
  const { getTagById } = useTagContext();
  const priority = PRIORITIES[expense.priority];
  const converted = calculateConvertedAmount(expense);
  const isMonthly = expense.frequency.type === 'monthly';

  return (
    <Card style={styles.card} onPress={() => router.push(`/expenses/${expense.id}`)}>
      <Card.Title
        title={expense.name}
        subtitle={FREQUENCY_LABELS[expense.frequency.type]}
        right={() => (
          <Chip
            icon={priority.icon}
            style={[styles.priorityChip, { backgroundColor: priority.color }]}
            textStyle={{ color: '#fff', fontSize: 12 }}
            compact
          >
            {priority.label}
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
        {expense.tags.length > 0 && (
          <View style={styles.tagContainer}>
            {expense.tags.map((tagId) => {
              const tag = getTagById(tagId);
              if (!tag) return null;
              return (
                <Chip
                  key={tagId}
                  style={[styles.tagChip, { backgroundColor: tag.color }]}
                  textStyle={{ color: '#fff', fontSize: 10 }}
                  compact
                >
                  {tag.label}
                </Chip>
              );
            })}
          </View>
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
  priorityChip: {
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
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  tagChip: {
    // height制約なし - テキストに合わせる
  },
  memo: {
    marginTop: 8,
    color: '#666',
    fontStyle: 'italic',
  },
});
