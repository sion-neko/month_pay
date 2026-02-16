import React from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useExpenseContext } from '../../src/contexts/ExpenseContext';
import { ExpenseCard, CategoryFilter } from '../../src/components';

export default function ExpenseListScreen() {
  const router = useRouter();
  const { state, filteredExpenses, setFilter } = useExpenseContext();

  if (state.isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CategoryFilter selected={state.filterCategory} onSelect={setFilter} />

      {filteredExpenses.length > 0 ? (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ExpenseCard expense={item} />}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {state.filterCategory === 'all' ? '固定費が登録されていません' : 'このカテゴリの固定費はありません'}
          </Text>
        </View>
      )}

      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/expenses/new')} />
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
