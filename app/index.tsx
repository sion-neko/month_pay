import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useExpenseContext } from '../src/contexts/ExpenseContext';
import { SummaryCard, CategoryPieChart } from '../src/components';
import { calculateTotals, calculateCategorySummaries } from '../src/utils/calculation';

export default function DashboardScreen() {
  const router = useRouter();
  const { state } = useExpenseContext();
  const [displayMode, setDisplayMode] = useState<'monthly' | 'annual'>('monthly');

  if (state.isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const totals = calculateTotals(state.expenses);
  const categorySummaries = calculateCategorySummaries(state.expenses);

  return (
    <ScrollView style={styles.container}>
      <SummaryCard
        monthlyTotal={totals.monthly}
        annualTotal={totals.annual}
        displayMode={displayMode}
        onModeChange={setDisplayMode}
      />

      {state.expenses.length > 0 ? (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            カテゴリ別内訳
          </Text>
          <CategoryPieChart data={categorySummaries} displayMode={displayMode} />
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            固定費が登録されていません
          </Text>
          <Text variant="bodySmall" style={styles.emptySubText}>
            「固定費を追加」ボタンから登録してください
          </Text>
        </View>
      )}

      <View style={styles.buttons}>
        <Button
          mode="outlined"
          onPress={() => router.push('/expenses')}
          style={styles.button}
          icon="format-list-bulleted"
        >
          一覧を見る
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push('/expenses/new')}
          style={styles.button}
          icon="plus"
        >
          固定費を追加
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
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  emptySubText: {
    color: '#999',
    marginTop: 8,
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
