import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, HelperText, Text, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { ExpenseInput } from '../../types/expense';
import { PriorityType, PRIORITY_LIST } from '../../types/priority';
import { FrequencyType, FREQUENCY_OPTIONS } from '../../types/frequency';
import { validateExpenseInput, hasErrors, ValidationErrors } from '../../utils/validation';
import { useTagContext } from '../../contexts/TagContext';

interface Props {
  initialValues?: Partial<ExpenseInput>;
  onSubmit: (data: ExpenseInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ExpenseForm({ initialValues, onSubmit, onCancel, submitLabel = '保存' }: Props) {
  const router = useRouter();
  const { allTags } = useTagContext();
  const [name, setName] = useState(initialValues?.name ?? '');
  const [amount, setAmount] = useState(initialValues?.amount?.toString() ?? '');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(initialValues?.frequency?.type ?? 'monthly');
  const [customMonths, setCustomMonths] = useState(initialValues?.frequency?.customMonths?.toString() ?? '');
  const [priority, setPriority] = useState<PriorityType>(initialValues?.priority ?? 'semi-essential');
  const [categoryId, setCategoryId] = useState<string | undefined>(initialValues?.categoryId);
  const [memo, setMemo] = useState(initialValues?.memo ?? '');
  const [errors, setErrors] = useState<ValidationErrors>({});

  const toggleCategory = (id: string) => {
    setCategoryId((prev) => (prev === id ? undefined : id));
  };

  const handleSubmit = () => {
    const data: ExpenseInput = {
      name: name.trim(),
      amount: parseInt(amount, 10) || 0,
      frequency: {
        type: frequencyType,
        ...(frequencyType === 'custom' && { customMonths: parseInt(customMonths, 10) }),
      },
      priority,
      categoryId,
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
      <View style={styles.chipContainer}>
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
        重要度
      </Text>
      <View style={styles.chipContainer}>
        {PRIORITY_LIST.map((p) => (
          <Chip
            key={p.type}
            selected={priority === p.type}
            onPress={() => setPriority(p.type)}
            style={[styles.chip, priority === p.type && { backgroundColor: p.color }]}
            textStyle={priority === p.type ? { color: '#fff' } : undefined}
            icon={p.icon}
            mode="outlined"
          >
            {p.label}
          </Chip>
        ))}
      </View>

      <Text variant="titleSmall" style={styles.sectionTitle}>
        カテゴリ（任意）
      </Text>
      <View style={styles.chipContainer}>
        {allTags.map((tag) => (
          <Chip
            key={tag.id}
            selected={categoryId === tag.id}
            onPress={() => toggleCategory(tag.id)}
            style={[styles.chip, categoryId === tag.id && { backgroundColor: tag.color }]}
            textStyle={categoryId === tag.id ? { color: '#fff' } : undefined}
            mode="outlined"
          >
            {tag.label}
          </Chip>
        ))}
        <Chip
          icon="plus"
          onPress={() => router.push('/tags/new')}
          style={styles.addChip}
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    marginBottom: 4,
  },
  addChip: {
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
