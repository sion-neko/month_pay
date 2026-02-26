import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useExpenseContext } from '../src/contexts/ExpenseContext';
import { SummaryCard, PriorityPieChart, CategoryPieChart, ExpenseCard, PriorityFilter, CategoryFilter } from '../src/components';
import { calculateTotals, calculatePrioritySummaries, calculateCategorySummaries } from '../src/utils/calculation';
import { useTagContext } from '../src/contexts/TagContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { state, filteredExpenses, setFilter } = useExpenseContext();
  const { state: tagState } = useTagContext();
  const [displayMode, setDisplayMode] = useState<'monthly' | 'annual'>('monthly');
  const [chartType, setChartType] = useState<'priority' | 'category'>('priority');

  const totals = useMemo(() => calculateTotals(state.expenses), [state.expenses]);
  const prioritySummaries = useMemo(() => calculatePrioritySummaries(state.expenses), [state.expenses]);
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
          <View style={styles.chartHeader}>
            <Text variant="titleMedium">
              {chartType === 'priority' ? '重要度別内訳' : 'カテゴリ別内訳'}
            </Text>
            <TouchableOpacity
              onPress={() => setChartType(prev => prev === 'priority' ? 'category' : 'priority')}
              style={styles.chartToggleButton}
            >
              <MaterialCommunityIcons
                name={chartType === 'priority' ? 'shape-outline' : 'shield-check-outline'}
                size={18}
                color="#1976D2"
              />
              <Text style={styles.chartToggleText}>
                {chartType === 'priority' ? 'カテゴリ別へ' : '重要度別へ'}
              </Text>
            </TouchableOpacity>
          </View>

          {chartType === 'priority' ? (
            <PriorityPieChart data={prioritySummaries} displayMode={displayMode} />
          ) : (
            <CategoryPieChart data={categorySummaries} allTags={tagState.tags} displayMode={displayMode} />
          )}

          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">固定費一覧</Text>
            <TouchableOpacity onPress={() => router.push('/tags')} style={styles.settingsButton}>
              <MaterialCommunityIcons name="tag-multiple" size={20} color="#666" />
              <Text style={styles.settingsText}>カテゴリ管理</Text>
            </TouchableOpacity>
          </View>
          <Text variant="bodySmall" style={styles.filterLabel}>重要度で絞り込み</Text>
          <PriorityFilter
            selected={state.filter.priority}
            onSelect={(priority) => setFilter({ priority })}
          />
          <Text variant="bodySmall" style={styles.filterLabel}>カテゴリで絞り込み</Text>
          <CategoryFilter
            selected={state.filter.categoryId}
            onSelect={(categoryId) => setFilter({ categoryId })}
          />
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  chartToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  chartToggleText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: 'bold',
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
  filterLabel: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
