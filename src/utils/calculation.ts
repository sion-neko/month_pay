import { Expense, ConvertedAmount, CategorySummary } from '../types/expense';
import { FrequencyType, FREQUENCY_MONTHS } from '../types/frequency';
import { CategoryType } from '../types/category';

/**
 * 支払い頻度から月数を取得
 */
export function getFrequencyMonths(type: FrequencyType, customMonths?: number): number {
  if (type === 'custom' && customMonths) {
    return customMonths;
  }
  return FREQUENCY_MONTHS[type as Exclude<FrequencyType, 'custom'>] ?? 1;
}

/**
 * 1件の固定費を月額・年額に換算
 *
 * 計算ロジック:
 * - 月額 = 支払額 / 頻度の月数
 * - 年額 = 月額 × 12
 */
export function calculateConvertedAmount(expense: Expense): ConvertedAmount {
  const months = getFrequencyMonths(expense.frequency.type, expense.frequency.customMonths);
  const monthly = Math.round(expense.amount / months);
  const annual = monthly * 12;

  return { monthly, annual };
}

/**
 * 固定費リストの合計を計算
 */
export function calculateTotals(expenses: Expense[]): ConvertedAmount {
  return expenses.reduce(
    (acc, expense) => {
      const converted = calculateConvertedAmount(expense);
      return {
        monthly: acc.monthly + converted.monthly,
        annual: acc.annual + converted.annual,
      };
    },
    { monthly: 0, annual: 0 }
  );
}

/**
 * カテゴリ別に集計
 */
export function calculateCategorySummaries(expenses: Expense[]): CategorySummary[] {
  const totals = calculateTotals(expenses);

  // 固定費に含まれるすべてのカテゴリを抽出（プリセット + カスタム）
  const categorySet = new Set<CategoryType>();
  for (const expense of expenses) {
    categorySet.add(expense.category);
  }

  return Array.from(categorySet).map((category) => {
    const categoryExpenses = expenses.filter((e) => e.category === category);
    const categoryTotals = calculateTotals(categoryExpenses);

    return {
      category,
      totalMonthly: categoryTotals.monthly,
      totalAnnual: categoryTotals.annual,
      count: categoryExpenses.length,
      percentage: totals.monthly > 0 ? Math.round((categoryTotals.monthly / totals.monthly) * 100) : 0,
    };
  });
}
