import { PriorityType } from './priority';
import { Frequency } from './frequency';

/**
 * 固定費データ
 */
export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  priority: PriorityType;
  tags: string[]; // タグIDの配列
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
 * 重要度別集計
 */
export interface PrioritySummary {
  priority: PriorityType;
  totalMonthly: number;
  totalAnnual: number;
  count: number;
  percentage: number;
}

/**
 * タグ別集計
 */
export interface TagSummary {
  tagId: string;
  totalMonthly: number;
  totalAnnual: number;
  count: number;
}
