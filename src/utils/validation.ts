import { ExpenseInput } from '../types/expense';

export interface ValidationErrors {
  name?: string;
  amount?: string;
  customMonths?: string;
}

/**
 * 固定費入力のバリデーション
 */
export function validateExpenseInput(input: ExpenseInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.name || input.name.trim() === '') {
    errors.name = '名称を入力してください';
  }

  if (!input.amount || input.amount <= 0) {
    errors.amount = '金額を入力してください';
  }

  if (input.frequency.type === 'custom') {
    if (!input.frequency.customMonths || input.frequency.customMonths <= 0) {
      errors.customMonths = '月数を入力してください';
    }
  }

  return errors;
}

/**
 * エラーがあるかどうかをチェック
 */
export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
