import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Expense, ExpenseInput } from '../types/expense';
import { PriorityType } from '../types/priority';
import { loadExpenses, saveExpenses } from '../utils/storage';
import { generateId } from '../utils/format';

// フィルター型
interface ExpenseFilter {
  priority: PriorityType | 'all';
  categoryId: string | 'all';
}

// State
interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  filter: ExpenseFilter;
}

// Action
type ExpenseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_FILTER'; payload: Partial<ExpenseFilter> }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: ExpenseState = {
  expenses: [],
  isLoading: true,
  error: null,
  filter: {
    priority: 'all',
    categoryId: 'all',
  },
};

function expenseReducer(state: ExpenseState, action: ExpenseAction): ExpenseState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload, isLoading: false };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) => (e.id === action.payload.id ? action.payload : e)),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };
    case 'SET_FILTER':
      return { ...state, filter: { ...state.filter, ...action.payload } };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// 旧データからのマイグレーション
interface LegacyExpense {
  id: string;
  name: string;
  amount: number;
  frequency: { type: string; customMonths?: number };
  category?: string;
  priority?: PriorityType;
  tags?: string[];
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

function migrateExpense(legacy: LegacyExpense): Expense {
  // 既に新形式(categoryId)の場合はそのまま返す
  // 型チェックのためにあえて明示的にプロパティを確認
  if ((legacy as any).categoryId) {
    return legacy as unknown as Expense;
  }

  // 旧カテゴリから重要度と新カテゴリへのマッピング
  const categoryToPriority: Record<string, PriorityType> = {
    housing: 'essential',
    communication: 'semi-essential',
    subscription: 'discretionary',
    insurance: 'essential',
    beauty: 'discretionary',
    investment: 'semi-essential',
    other: 'semi-essential',
  };

  const categoryToId: Record<string, string> = {
    housing: 'housing',
    communication: 'communication',
    subscription: 'subscription',
    insurance: 'insurance',
    utility: 'utility',
  };

  const oldCategory = legacy.category || 'other';
  const priority = legacy.priority || categoryToPriority[oldCategory] || 'semi-essential';

  // 以前のtagsがあれば最初の1つをcategoryIdにする
  let categoryId = legacy.tags && legacy.tags.length > 0 ? legacy.tags[0] : undefined;

  // なければ旧カテゴリから変換
  if (!categoryId) {
    categoryId = categoryToId[oldCategory];
  }

  return {
    id: legacy.id,
    name: legacy.name,
    amount: legacy.amount,
    frequency: legacy.frequency as Expense['frequency'],
    priority,
    categoryId,
    memo: legacy.memo,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
  };
}

// Context
interface ExpenseContextType {
  state: ExpenseState;
  addExpense: (input: ExpenseInput) => Promise<void>;
  updateExpense: (id: string, input: Partial<ExpenseInput>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setFilter: (filter: Partial<ExpenseFilter>) => void;
  getExpenseById: (id: string) => Expense | undefined;
  filteredExpenses: Expense[];
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // 初期ロード（マイグレーション付き）
  useEffect(() => {
    const init = async () => {
      try {
        const rawExpenses = await loadExpenses();
        // マイグレーション実行
        const expenses = rawExpenses.map((e) => migrateExpense(e as LegacyExpense));
        dispatch({ type: 'SET_EXPENSES', payload: expenses });
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'データの読み込みに失敗しました' });
      }
    };
    init();
  }, []);

  // 変更時の永続化
  useEffect(() => {
    if (!state.isLoading) {
      saveExpenses(state.expenses);
    }
  }, [state.expenses, state.isLoading]);

  const addExpense = async (input: ExpenseInput) => {
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...input,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  const updateExpense = async (id: string, input: Partial<ExpenseInput>) => {
    const existing = state.expenses.find((e) => e.id === id);
    if (!existing) return;

    const updated: Expense = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'UPDATE_EXPENSE', payload: updated });
  };

  const deleteExpense = async (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };

  const setFilter = (filter: Partial<ExpenseFilter>) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const getExpenseById = (id: string) => {
    return state.expenses.find((e) => e.id === id);
  };

  // フィルタリング
  const filteredExpenses = state.expenses.filter((expense) => {
    // 重要度フィルター
    if (state.filter.priority !== 'all' && expense.priority !== state.filter.priority) {
      return false;
    }
    // カテゴリフィルター
    if (state.filter.categoryId !== 'all' && expense.categoryId !== state.filter.categoryId) {
      return false;
    }
    return true;
  });

  return (
    <ExpenseContext.Provider
      value={{
        state,
        addExpense,
        updateExpense,
        deleteExpense,
        setFilter,
        getExpenseById,
        filteredExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenseContext() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenseContext must be used within ExpenseProvider');
  }
  return context;
}
