import { Expense, ConvertedAmount, PrioritySummary, TagSummary } from '../types/expense';
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
 * タグ別に集計
 */
export function calculateTagSummaries(expenses: Expense[]): TagSummary[] {
  // 使用されているタグを抽出
  const tagIds = new Set<string>();
  for (const expense of expenses) {
    for (const tagId of expense.tags) {
      tagIds.add(tagId);
    }
  }

  const totals = calculateTotals(expenses);

  const summaries = Array.from(tagIds).map((tagId) => {
    const tagExpenses = expenses.filter((e) => e.tags.includes(tagId));
    const tagTotals = calculateTotals(tagExpenses);

    return {
      tagId,
      totalMonthly: tagTotals.monthly,
      totalAnnual: tagTotals.annual,
      count: tagExpenses.length,
      percentage: totals.monthly > 0 ? Math.round((tagTotals.monthly / totals.monthly) * 100) : 0,
    };
  });

  // タグなしの集計を追加
  const untaggedExpenses = expenses.filter((e) => e.tags.length === 0);
  if (untaggedExpenses.length > 0) {
    const untaggedTotals = calculateTotals(untaggedExpenses);
    summaries.push({
      tagId: 'untagged',
      totalMonthly: untaggedTotals.monthly,
      totalAnnual: untaggedTotals.annual,
      count: untaggedExpenses.length,
      percentage: totals.monthly > 0 ? Math.round((untaggedTotals.monthly / totals.monthly) * 100) : 0,
    });
  }

  return summaries;
}
