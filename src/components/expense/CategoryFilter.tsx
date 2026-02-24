import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { CategoryType } from '../../types/category';
import { useCategoryContext } from '../../contexts/CategoryContext';

interface Props {
  selected: CategoryType | 'all';
  onSelect: (category: CategoryType | 'all') => void;
}

export function CategoryFilter({ selected, onSelect }: Props) {
  const { allCategories } = useCategoryContext();

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
      {allCategories.map((cat) => (
        <Chip
          key={cat.type}
          selected={selected === cat.type}
          onPress={() => onSelect(cat.type)}
          style={[styles.chip, selected === cat.type && { backgroundColor: cat.color }]}
          textStyle={selected === cat.type ? { color: '#fff' } : undefined}
          icon={cat.icon}
          mode="outlined"
        >
          {cat.label}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    paddingVertical: 8,
  },
  content: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  chip: {
    marginRight: 8,
  },
});
