import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { FAB, Text, Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTagContext } from '../../src/contexts/TagContext';
import { Tag } from '../../src/types/tag';

interface TagCardProps {
  tag: Tag;
  onPress: () => void;
}

function TagCard({ tag, onPress }: TagCardProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.cardContent}>
        <View style={[styles.colorDot, { backgroundColor: tag.color }]} />
        <Text variant="titleMedium">{tag.label}</Text>
      </Card.Content>
    </Card>
  );
}

export default function TagListScreen() {
  const router = useRouter();
  const { allTags } = useTagContext();

  const ListHeader = () => (
    <Text variant="titleMedium" style={styles.sectionTitle}>
      タグ一覧
    </Text>
  );

  const EmptyList = () => (
    <View style={styles.emptyState}>
      <Text variant="bodyLarge" style={styles.emptyText}>
        タグがありません
      </Text>
      <Text variant="bodySmall" style={styles.emptySubText}>
        右下の＋ボタンからタグを追加してください
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={allTags}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TagCard
            tag={item}
            onPress={() => router.push(`/tags/${item.id}`)}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyList}
        contentContainerStyle={styles.list}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/tags/new')}
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
