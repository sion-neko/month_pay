import React from 'react';
import { useRouter } from 'expo-router';
import { useExpenseContext } from '../../src/contexts/ExpenseContext';
import { ExpenseForm } from '../../src/components';
import { ExpenseInput } from '../../src/types/expense';

export default function NewExpenseScreen() {
  const router = useRouter();
  const { addExpense } = useExpenseContext();

  const handleSubmit = async (data: ExpenseInput) => {
    await addExpense(data);
    router.back();
  };

  return <ExpenseForm onSubmit={handleSubmit} onCancel={() => router.back()} submitLabel="追加" />;
}
