import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, HelperText, Text, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ExpenseInput } from '../../types/expense';
import { CategoryType } from '../../types/category';
import { FrequencyType, FREQUENCY_OPTIONS } from '../../types/frequency';
import { validateExpenseInput, hasErrors, ValidationErrors } from '../../utils/validation';
import { useCategoryContext } from '../../contexts/CategoryContext';

interface Props {
  initialValues?: Partial<ExpenseInput>;
  onSubmit: (data: ExpenseInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({ initialValues, onSubmit, onCancel, submitLabel = '保存' }: Props) {
  const router = useRouter();
  const { allCategories } = useCategoryContext();
  const [name, setName] = useState(initialValues?.name ?? '');
  const [amount, setAmount] = useState(initialValues?.amount?.toString() ?? '');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(initialValues?.frequency?.type ?? 'monthly');
  const [customMonths, setCustomMonths] = useState(initialValues?.frequency?.customMonths?.toString() ?? '');
  const [category, setCategory] = useState<CategoryType>(initialValues?.category ?? 'other');
  const [memo, setMemo] = useState(initialValues?.memo ?? '');
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleSubmit = () => {
    const data: ExpenseInput = {
      name: name.trim(),
      amount: parseInt(amount, 10) || 0,
      frequency: {
        type: frequencyType,
        ...(frequencyType === 'custom' && { customMonths: parseInt(customMonths, 10) }),
      },
      category,
      memo: memo.trim() || undefined,
    };

    const validationErrors = validateExpenseInput(data);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(data);
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="名称"
        value={name}
        onChangeText={setName}
        mode="outlined"
        error={!!errors.name}
        style={styles.input}
      />
      {errors.name && <HelperText type="error">{errors.name}</HelperText>}

      <TextInput
        label="金額（円）"
        value={amount}
        onChangeText={setAmount}
        mode="outlined"
        keyboardType="numeric"
        left={<TextInput.Affix text="¥" />}
        error={!!errors.amount}
        style={styles.input}
      />
      {errors.amount && <HelperText type="error">{errors.amount}</HelperText>}

      <Text variant="titleSmall" style={styles.sectionTitle}>
        支払い頻度
      </Text>
      <View style={styles.frequencyContainer}>
        {FREQUENCY_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            selected={frequencyType === option.value}
            onPress={() => setFrequencyType(option.value)}
            style={styles.chip}
            mode="outlined"
          >
            {option.label}
          </Chip>
        ))}
      </View>

      {frequencyType === 'custom' && (
        <>
          <TextInput
            label="何ヶ月に1回"
            value={customMonths}
            onChangeText={setCustomMonths}
            mode="outlined"
            keyboardType="numeric"
            right={<TextInput.Affix text="ヶ月" />}
            error={!!errors.customMonths}
            style={styles.input}
          />
          {errors.customMonths && <HelperText type="error">{errors.customMonths}</HelperText>}
        </>
      )}

      <Text variant="titleSmall" style={styles.sectionTitle}>
        カテゴリ
      </Text>
      <View style={styles.categoryContainer}>
        {allCategories.map((cat) => (
          <Chip
            key={cat.type}
            selected={category === cat.type}
            onPress={() => setCategory(cat.type)}
            style={[styles.chip, category === cat.type && { backgroundColor: cat.color }]}
            textStyle={category === cat.type ? { color: '#fff' } : undefined}
            icon={cat.icon}
            mode="outlined"
          >
            {cat.label}
          </Chip>
        ))}
        <Chip
          icon="plus"
          onPress={() => router.push('/categories/new')}
          style={styles.addCategoryChip}
          mode="outlined"
        >
          追加
        </Chip>
      </View>

      <TextInput
        label="メモ（任意）"
        value={memo}
        onChangeText={setMemo}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <View style={styles.buttons}>
        {onCancel && (
          <Button mode="outlined" onPress={onCancel} style={styles.button}>
            キャンセル
          </Button>
        )}
        <Button mode="contained" onPress={handleSubmit} style={styles.button}>
          {submitLabel}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginBottom: 4,
  },
  addCategoryChip: {
    marginBottom: 4,
    borderStyle: 'dashed',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  button: {
    minWidth: 100,
  },
});
