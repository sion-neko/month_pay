import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { CategoryType, CATEGORY_LIST } from '../../types/category';

interface Props {
  selected: CategoryType | 'all';
  onSelect: (category: CategoryType | 'all') => void;
}

export function CategoryFilter({ selected, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <Chip
        selected={selected === 'all'}
        onPress={() => onSelect('all')}
        style={styles.chip}
        mode="outlined"
      >
        すべて
      </Chip>
      {CATEGORY_LIST.map((cat) => (
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
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    marginRight: 8,
  },
});
