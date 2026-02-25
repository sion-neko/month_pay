import React from 'react';
import { useRouter } from 'expo-router';
import { useTagContext } from '../../src/contexts/TagContext';
import { TagForm } from '../../src/components/tag/TagForm';
import { TagInput } from '../../src/types/tag';

export default function NewTagScreen() {
  const router = useRouter();
  const { addTag } = useTagContext();

  const handleSubmit = async (data: TagInput) => {
    await addTag(data);
    router.back();
  };

  return (
    <TagForm
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitLabel="追加"
    />
  );
}
