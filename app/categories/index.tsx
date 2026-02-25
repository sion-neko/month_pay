import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Text, Card, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCategoryContext } from '../../src/contexts/CategoryContext';
import { Category } from '../../src/types/category';

interface CategoryCardProps {
  category: Category;
  onEdit?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function CategoryCard({ category, onEdit, onMoveUp, onMoveDown, isFirst, isLast }: CategoryCardProps) {
  return (
    <Card style={styles.card} onPress={onEdit}>
      <Card.Content style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
          <MaterialCommunityIcons
            name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={24}
            color="#fff"
          />
        </View>
        <View style={styles.cardInfo}>
          <Text variant="titleMedium">{category.label}</Text>
          {category.isCustom && (
            <Text variant="bodySmall" style={styles.customLabel}>カスタム</Text>
          )}
        </View>
        <View style={styles.actions}>
          <IconButton
            icon="chevron-up"
            size={20}
            onPress={onMoveUp}
            disabled={isFirst}
            iconColor={isFirst ? '#ccc' : '#666'}
          />
          <IconButton
            icon="chevron-down"
            size={20}
            onPress={onMoveDown}
            disabled={isLast}
            iconColor={isLast ? '#ccc' : '#666'}
          />
          <IconButton icon="pencil-outline" size={20} onPress={onEdit} iconColor="#666" />
        </View>
      </Card.Content>
    </Card>
  );
}

export default function CategoryListScreen() {
  const router = useRouter();
  const { allCategories, moveCategory } = useCategoryContext();

  const ListHeader = () => (
    <Text variant="titleMedium" style={styles.sectionTitle}>
      カテゴリ一覧
    </Text>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={allCategories}
        keyExtractor={(item) => item.type}
        renderItem={({ item, index }) => (
          <CategoryCard
            category={item}
            onEdit={() => router.push(`/categories/${item.type}`)}
            onMoveUp={() => moveCategory(item.type, 'up')}
            onMoveDown={() => moveCategory(item.type, 'down')}
            isFirst={index === 0}
            isLast={index === allCategories.length - 1}
          />
        )}
        ListHeaderComponent={ListHeader}
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
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customLabel: {
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
