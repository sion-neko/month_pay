import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense } from '../types/expense';

const STORAGE_KEY = '@fixed_cost_manager/expenses';

/**
 * 固定費リストを読み込み
 */
export async function loadExpenses(): Promise<Expense[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      return JSON.parse(json) as Expense[];
    }
    return [];
  } catch (error) {
    console.error('Failed to load expenses:', error);
    return [];
  }
}

/**
 * 固定費リストを保存
 */
export async function saveExpenses(expenses: Expense[]): Promise<void> {
  try {
    const json = JSON.stringify(expenses);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save expenses:', error);
    throw error;
  }
}

/**
 * 全データをクリア
 */
export async function clearAllData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
