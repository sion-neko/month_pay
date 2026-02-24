import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useExpenseContext } from '../src/contexts/ExpenseContext';
import { SummaryCard, CategoryPieChart, ExpenseCard, CategoryFilter } from '../src/components';
import { calculateTotals, calculateCategorySummaries } from '../src/utils/calculation';

export default function DashboardScreen() {
  const router = useRouter();
  const { state, filteredExpenses, setFilter } = useExpenseContext();
  const [displayMode, setDisplayMode] = useState<'monthly' | 'annual'>('monthly');

  const totals = useMemo(() => calculateTotals(state.expenses), [state.expenses]);
  const categorySummaries = useMemo(() => calculateCategorySummaries(state.expenses), [state.expenses]);

  if (state.isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const ListHeader = (
    <View>
      <SummaryCard
        monthlyTotal={totals.monthly}
        annualTotal={totals.annual}
        displayMode={displayMode}
        onModeChange={setDisplayMode}
      />

      {state.expenses.length > 0 && (
        <>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            カテゴリ別内訳
          </Text>
          <CategoryPieChart data={categorySummaries} displayMode={displayMode} />

          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">固定費一覧</Text>
            <TouchableOpacity onPress={() => router.push('/categories')} style={styles.settingsButton}>
              <MaterialCommunityIcons name="cog" size={20} color="#666" />
              <Text style={styles.settingsText}>カテゴリ管理</Text>
            </TouchableOpacity>
          </View>
          <CategoryFilter selected={state.filterCategory} onSelect={setFilter} />
        </>
      )}
    </View>
  );

  const EmptyList = () => (
    <View style={styles.emptyState}>
      <Text variant="bodyLarge" style={styles.emptyText}>
        固定費が登録されていません
      </Text>
      <Text variant="bodySmall" style={styles.emptySubText}>
        右下の＋ボタンから登録してください
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExpenseCard expense={item} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={state.expenses.length === 0 ? EmptyList : undefined}
        contentContainerStyle={styles.list}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/expenses/new')}
      />
    </View>
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
  list: {
    paddingBottom: 100,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingsText: {
    color: '#666',
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
