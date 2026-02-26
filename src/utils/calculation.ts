import { Expense, ConvertedAmount, PrioritySummary, CategorySummary } from '../types/expense';
import { FrequencyType, FREQUENCY_MONTHS } from '../types/frequency';
import { PriorityType, PRIORITY_LIST } from '../types/priority';

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
 * 重要度別に集計
 */
export function calculatePrioritySummaries(expenses: Expense[]): PrioritySummary[] {
  const totals = calculateTotals(expenses);

  return PRIORITY_LIST.map((p) => {
    const priorityExpenses = expenses.filter((e) => e.priority === p.type);
    const priorityTotals = calculateTotals(priorityExpenses);

    return {
      priority: p.type as PriorityType,
      totalMonthly: priorityTotals.monthly,
      totalAnnual: priorityTotals.annual,
      count: priorityExpenses.length,
      percentage: totals.monthly > 0 ? Math.round((priorityTotals.monthly / totals.monthly) * 100) : 0,
    };
  }).filter((summary) => summary.count > 0);
}

/**
 * カテゴリ別に集計
 */
export function calculateCategorySummaries(expenses: Expense[]): CategorySummary[] {
  // 使用されているカテゴリを抽出
  const categoryIds = new Set<string>();
  for (const expense of expenses) {
    if (expense.categoryId) {
      categoryIds.add(expense.categoryId);
    }
  }

  const totals = calculateTotals(expenses);

  const summaries: CategorySummary[] = Array.from(categoryIds).map((categoryId) => {
    const categoryExpenses = expenses.filter((e) => e.categoryId === categoryId);
    const categoryTotals = calculateTotals(categoryExpenses);

    return {
      categoryId,
      totalMonthly: categoryTotals.monthly,
      totalAnnual: categoryTotals.annual,
      count: categoryExpenses.length,
      percentage: totals.monthly > 0 ? Math.round((categoryTotals.monthly / totals.monthly) * 100) : 0,
    };
  });

  // カテゴリなしの集計を追加
  const uncategorizedExpenses = expenses.filter((e) => !e.categoryId);
  if (uncategorizedExpenses.length > 0) {
    const uncategorizedTotals = calculateTotals(uncategorizedExpenses);
    summaries.push({
      categoryId: 'uncategorized',
      totalMonthly: uncategorizedTotals.monthly,
      totalAnnual: uncategorizedTotals.annual,
      count: uncategorizedExpenses.length,
      percentage: totals.monthly > 0 ? Math.round((uncategorizedTotals.monthly / totals.monthly) * 100) : 0,
    });
  }

  return summaries;
}
