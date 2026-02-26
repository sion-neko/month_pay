import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCategoryContext } from '../../src/contexts/CategoryContext';
import { CategoryForm } from '../../src/components/category/CategoryForm';
import { CategoryInput } from '../../src/types/category';

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCategoryById, updateCategory, deleteCategory } = useCategoryContext();

  const category = getCategoryById(id ?? '');

  if (!category) {
    return (
      <View style={styles.notFound}>
        <Text>カテゴリが見つかりません</Text>
      </View>
    );
  }

  const handleSubmit = async (data: CategoryInput) => {
    await updateCategory(category.id, data);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      '削除確認',
      `「${category.label}」を削除しますか？\nこのカテゴリを使用している固定費からはカテゴリの設定が外れます。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(category.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CategoryForm
        initialValues={{
          label: category.label,
          color: category.color,
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
          このカテゴリを削除
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
