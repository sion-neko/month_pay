import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useCategoryContext } from '../../src/contexts/CategoryContext';
import { Category } from '../../src/types/category';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

function CategoryCard({ category, onPress }: CategoryCardProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.cardContent}>
        <View style={[styles.colorDot, { backgroundColor: category.color }]} />
        <Text variant="titleMedium">{category.label}</Text>
      </Card.Content>
    </Card>
  );
}

export default function CategoryListScreen() {
  const router = useRouter();
  const { allCategories } = useCategoryContext();

  const ListHeader = () => (
    <Text variant="titleMedium" style={styles.sectionTitle}>
      カテゴリ一覧
    </Text>
  );

  const EmptyList = () => (
    <View style={styles.emptyState}>
      <Text variant="bodyLarge" style={styles.emptyText}>
        カテゴリがありません
      </Text>
      <Text variant="bodySmall" style={styles.emptySubText}>
        右下の＋ボタンからカテゴリを追加してください
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={allCategories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() => router.push(`/categories/${item.id}`)}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyList}
        contentContainerStyle={styles.list}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/categories/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    paddingBottom: 100,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
