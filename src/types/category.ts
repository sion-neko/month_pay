/**
 * カテゴリ情報
 */
export interface Category {
  id: string;
  label: string;
  color: string;
}

/**
 * カテゴリ入力
 */
export type CategoryInput = Omit<Category, 'id'>;

/**
 * プリセットカテゴリ
 */
export const PRESET_CATEGORIES: Category[] = [
  { id: 'subscription', label: 'サブスク', color: '#9966FF' },
  { id: 'insurance', label: '保険', color: '#4BC0C0' },
  { id: 'housing', label: '住居', color: '#FF6384' },
  { id: 'communication', label: '通信', color: '#36A2EB' },
  { id: 'utility', label: '光熱費', color: '#FF9F40' },
  { id: 'investment', label: '投資', color: '#4CAF50' },
];

/**
 * カテゴリの色オプション
 */
export const CATEGORY_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
  '#9966FF', '#FF9F40', '#4CAF50', '#E91E63',
  '#2196F3', '#FF5722', '#795548', '#607D8B',
];
