import React from 'react';
import { useRouter } from 'expo-router';
import { useCategoryContext } from '../../src/contexts/CategoryContext';
import { CategoryForm } from '../../src/components/category/CategoryForm';
import { CustomCategoryInput } from '../../src/types/category';

export default function NewCategoryScreen() {
  const router = useRouter();
  const { addCategory } = useCategoryContext();

  const handleSubmit = async (data: CustomCategoryInput) => {
    await addCategory(data);
    router.back();
  };

  return <CategoryForm onSubmit={handleSubmit} onCancel={() => router.back()} submitLabel="追加" />;
}
