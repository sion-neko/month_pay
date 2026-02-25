import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTagContext } from '../../src/contexts/TagContext';
import { TagForm } from '../../src/components/tag/TagForm';
import { TagInput } from '../../src/types/tag';

export default function EditTagScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTagById, updateTag, deleteTag } = useTagContext();

  const tag = getTagById(id ?? '');

  if (!tag) {
    return (
      <View style={styles.notFound}>
        <Text>タグが見つかりません</Text>
      </View>
    );
  }

  const handleSubmit = async (data: TagInput) => {
    await updateTag(tag.id, data);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      '削除確認',
      `「${tag.label}」を削除しますか？\nこのタグを使用している固定費からはタグが外れます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await deleteTag(tag.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TagForm
        initialValues={{
          label: tag.label,
          color: tag.color,
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        submitLabel="保存"
      />
      <View style={styles.deleteSection}>
        <Button
          mode="outlined"
          onPress={handleDelete}
          textColor="#B00020"
          style={styles.deleteButton}
          icon="delete-outline"
        >
          このタグを削除
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  deleteButton: {
    borderColor: '#B00020',
  },
});
