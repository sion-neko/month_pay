import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Chip } from 'react-native-paper';
import { useCategoryContext } from '../../contexts/CategoryContext';

interface Props {
  selected: string | 'all';
  onSelect: (categoryId: string | 'all') => void;
}

export function CategoryFilter({ selected, onSelect }: Props) {
  const { allCategories } = useCategoryContext();

  if (allCategories.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Chip
        selected={selected === 'all'}
        onPress={() => onSelect('all')}
        style={styles.chip}
        mode="outlined"
      >
        すべて
      </Chip>
      {allCategories.map((category) => (
        <Chip
          key={category.id}
          selected={selected === category.id}
          onPress={() => onSelect(category.id)}
          style={[styles.chip, selected === category.id && { backgroundColor: category.color }]}
          textStyle={selected === category.id ? { color: '#fff' } : undefined}
          mode="outlined"
        >
          {category.label}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    marginRight: 4,
  },
});
