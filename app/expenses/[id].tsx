import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Card, Text, Button, Divider } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useExpenseContext } from '../../src/contexts/ExpenseContext';
import { ExpenseForm } from '../../src/components';
import { ExpenseInput } from '../../src/types/expense';
import { CATEGORIES } from '../../src/types/category';
import { FREQUENCY_LABELS } from '../../src/types/frequency';
import { formatCurrency } from '../../src/utils/format';
import { calculateConvertedAmount } from '../../src/utils/calculation';

export default function ExpenseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getExpenseById, updateExpense, deleteExpense } = useExpenseContext();
  const [isEditing, setIsEditing] = useState(false);

  const expense = getExpenseById(id);

  if (!expense) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const category = CATEGORIES[expense.category];
  const converted = calculateConvertedAmount(expense);

  const handleUpdate = async (data: ExpenseInput) => {
    await updateExpense(expense.id, data);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert('削除の確認', `「${expense.name}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await deleteExpense(expense.id);
          router.back();
        },
      },
    ]);
  };

  if (isEditing) {
    return (
      <ExpenseForm
        initialValues={{
          name: expense.name,
          amount: expense.amount,
          frequency: expense.frequency,
          category: expense.category,
          memo: expense.memo,
        }}
        onSubmit={handleUpdate}
        onCancel={() => setIsEditing(false)}
        submitLabel="更新"
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="headlineSmall">{expense.name}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
              <Text style={styles.categoryText}>{category.label}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.label}>
              支払額
            </Text>
            <Text variant="titleMedium">{formatCurrency(expense.amount)}</Text>
          </View>

          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.label}>
              支払い頻度
            </Text>
            <Text variant="bodyLarge">{FREQUENCY_LABELS[expense.frequency.type]}</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.label}>
              月額換算
            </Text>
            <Text variant="titleMedium" style={styles.highlight}>
              {formatCurrency(converted.monthly)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.label}>
              年額換算
            </Text>
            <Text variant="titleMedium" style={styles.highlight}>
              {formatCurrency(converted.annual)}
            </Text>
          </View>

          {expense.memo && (
            <>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium" style={styles.label}>
                メモ
              </Text>
              <Text variant="bodyLarge">{expense.memo}</Text>
            </>
          )}
        </Card.Content>
      </Card>

      <View style={styles.buttons}>
        <Button mode="outlined" onPress={() => setIsEditing(true)} style={styles.button} icon="pencil">
          編集
        </Button>
        <Button mode="contained" onPress={handleDelete} style={styles.button} icon="delete" buttonColor="#D32F2F">
          削除
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#666',
  },
  highlight: {
    color: '#1976D2',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    padding: 16,
    marginBottom: 32,
  },
  button: {
    flex: 1,
  },
});
