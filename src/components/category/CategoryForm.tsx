import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomCategoryInput, CATEGORY_COLORS, CATEGORY_ICONS } from '../../types/category';

interface Props {
  initialValues?: Partial<CustomCategoryInput>;
  onSubmit: (data: CustomCategoryInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function CategoryForm({ initialValues, onSubmit, onCancel, submitLabel = '保存' }: Props) {
  const [label, setLabel] = useState(initialValues?.label ?? '');
  const [color, setColor] = useState(initialValues?.color ?? CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState(initialValues?.icon ?? CATEGORY_ICONS[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!label.trim()) {
      setError('カテゴリ名を入力してください');
      return;
    }

    onSubmit({
      label: label.trim(),
      color,
      icon,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="カテゴリ名"
        value={label}
        onChangeText={(text) => {
          setLabel(text);
          setError(null);
        }}
        mode="outlined"
        error={!!error}
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}

      <Text variant="titleSmall" style={styles.sectionTitle}>
        色を選択
      </Text>
      <View style={styles.colorGrid}>
        {CATEGORY_COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorItem,
              { backgroundColor: c },
              color === c && styles.colorItemSelected,
            ]}
            onPress={() => setColor(c)}
          >
            {color === c && (
              <MaterialCommunityIcons name="check" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text variant="titleSmall" style={styles.sectionTitle}>
        アイコンを選択
      </Text>
      <View style={styles.iconGrid}>
        {CATEGORY_ICONS.map((i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.iconItem,
              icon === i && { backgroundColor: color },
            ]}
            onPress={() => setIcon(i)}
          >
            <MaterialCommunityIcons
              name={i as keyof typeof MaterialCommunityIcons.glyphMap}
              size={24}
              color={icon === i ? '#fff' : '#666'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.preview}>
        <Text variant="bodySmall" style={styles.previewLabel}>プレビュー</Text>
        <View style={[styles.previewBadge, { backgroundColor: color }]}>
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={16}
            color="#fff"
          />
          <Text style={styles.previewText}>{label || 'カテゴリ名'}</Text>
        </View>
      </View>

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
  error: {
    color: '#B00020',
    fontSize: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorItemSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconItem: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  preview: {
    marginTop: 24,
    alignItems: 'center',
  },
  previewLabel: {
    color: '#666',
    marginBottom: 8,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  previewText: {
    color: '#fff',
    fontWeight: 'bold',
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
