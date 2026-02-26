import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, CategoryInput, PRESET_CATEGORIES } from '../types/category';

const STORAGE_KEY = '@fixed_cost_manager/categories';

// State
interface CategoryState {
  categories: Category[];
  isLoading: boolean;
}

// Action
type CategoryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INIT'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string };

const initialState: CategoryState = {
  categories: [],
  isLoading: true,
};

function categoryReducer(state: CategoryState, action: CategoryAction): CategoryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'INIT':
      return { ...state, categories: action.payload, isLoading: false };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((t) => t.id !== action.payload),
      };
    default:
      return state;
  }
}

// Context
interface CategoryContextType {
  state: CategoryState;
  allCategories: Category[];
  addCategory: (input: CategoryInput) => Promise<void>;
  updateCategory: (id: string, input: Partial<CategoryInput>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
}

const CategoryContext = createContext<CategoryContextType | null>(null);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(categoryReducer, initialState);

  // 初期ロード
  useEffect(() => {
    const init = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const savedCategories = JSON.parse(json) as Category[];
          dispatch({ type: 'INIT', payload: savedCategories });
        } else {
          // 初回はプリセットカテゴリを設定
          dispatch({ type: 'INIT', payload: PRESET_CATEGORIES });
        }
      } catch {
        dispatch({ type: 'INIT', payload: PRESET_CATEGORIES });
      }
    };
    init();
  }, []);

  // 変更時の永続化
  useEffect(() => {
    if (!state.isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.categories));
    }
  }, [state.categories, state.isLoading]);

  const addCategory = async (input: CategoryInput) => {
    const newCategory: Category = {
      id: `category_${Date.now()}`,
      ...input,
    };
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
  };

  const updateCategory = async (id: string, input: Partial<CategoryInput>) => {
    const existing = state.categories.find((t) => t.id === id);
    if (!existing) return;
    const updated: Category = { ...existing, ...input };
    dispatch({ type: 'UPDATE_CATEGORY', payload: updated });
  };

  const deleteCategory = async (id: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  };

  const getCategoryById = (id: string): Category | undefined => {
    return state.categories.find((t) => t.id === id);
  };

  return (
    <CategoryContext.Provider
      value={{
        state,
        allCategories: state.categories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategoryContext() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategoryContext must be used within CategoryProvider');
  }
  return context;
}
