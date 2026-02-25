import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip } from 'react-native-paper';
import { PriorityType, PRIORITY_LIST } from '../../types/priority';

interface Props {
  selected: PriorityType | 'all';
  onSelect: (priority: PriorityType | 'all') => void;
}

export function PriorityFilter({ selected, onSelect }: Props) {
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
      {PRIORITY_LIST.map((priority) => (
        <Chip
          key={priority.type}
          selected={selected === priority.type}
          onPress={() => onSelect(priority.type)}
          style={[styles.chip, selected === priority.type && { backgroundColor: priority.color }]}
          textStyle={selected === priority.type ? { color: '#fff' } : undefined}
          icon={priority.icon}
          mode="outlined"
        >
          {priority.label}
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
