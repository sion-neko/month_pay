import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Expense, ExpenseInput } from '../types/expense';
import { CategoryType } from '../types/category';
import { loadExpenses, saveExpenses } from '../utils/storage';
import { generateId } from '../utils/format';

// State
interface ExpenseState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  filterCategory: CategoryType | 'all';
}

// Action
type ExpenseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_FILTER'; payload: CategoryType | 'all' }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: ExpenseState = {
  expenses: [],
  isLoading: true,
  error: null,
  filterCategory: 'all',
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
      return { ...state, filterCategory: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Context
interface ExpenseContextType {
  state: ExpenseState;
  addExpense: (input: ExpenseInput) => Promise<void>;
  updateExpense: (id: string, input: Partial<ExpenseInput>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setFilter: (category: CategoryType | 'all') => void;
  getExpenseById: (id: string) => Expense | undefined;
  filteredExpenses: Expense[];
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // 初期ロード
  useEffect(() => {
    const init = async () => {
      try {
        const expenses = await loadExpenses();
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

  const setFilter = (category: CategoryType | 'all') => {
    dispatch({ type: 'SET_FILTER', payload: category });
  };

  const getExpenseById = (id: string) => {
    return state.expenses.find((e) => e.id === id);
  };

  const filteredExpenses =
    state.filterCategory === 'all'
      ? state.expenses
      : state.expenses.filter((e) => e.category === state.filterCategory);

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
