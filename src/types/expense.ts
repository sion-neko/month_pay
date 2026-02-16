import { CategoryType } from './category';
import { Frequency } from './frequency';

/**
 * 固定費データ
 */
export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  category: CategoryType;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 固定費の入力フォーム用型
 */
export type ExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 換算結果
 */
export interface ConvertedAmount {
  monthly: number;
  annual: number;
}

/**
 * カテゴリ別集計
 */
export interface CategorySummary {
  category: CategoryType;
  totalMonthly: number;
  totalAnnual: number;
  count: number;
  percentage: number;
}
