import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip } from 'react-native-paper';
import { useTagContext } from '../../contexts/TagContext';

interface Props {
  selected: string | 'all';
  onSelect: (tagId: string | 'all') => void;
}

export function TagFilter({ selected, onSelect }: Props) {
  const { allTags } = useTagContext();

  if (allTags.length === 0) {
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
      {allTags.map((tag) => (
        <Chip
          key={tag.id}
          selected={selected === tag.id}
          onPress={() => onSelect(tag.id)}
          style={[styles.chip, selected === tag.id && { backgroundColor: tag.color }]}
          textStyle={selected === tag.id ? { color: '#fff' } : undefined}
          mode="outlined"
        >
          {tag.label}
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
