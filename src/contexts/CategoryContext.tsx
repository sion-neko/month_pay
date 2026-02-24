import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, CustomCategoryInput, PRESET_CATEGORY_LIST } from '../types/category';
import { generateId } from '../utils/format';

const STORAGE_KEY = '@fixed_cost_manager/custom_categories';
const ORDER_STORAGE_KEY = '@fixed_cost_manager/category_order';

// State
interface CategoryState {
  customCategories: Category[];
  categoryOrder: string[]; // カテゴリtypeの配列（順序）
  isLoading: boolean;
}

// Action
type CategoryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INIT'; payload: { customCategories: Category[]; categoryOrder: string[] } }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_ORDER'; payload: string[] };

const initialState: CategoryState = {
  customCategories: [],
  categoryOrder: [],
  isLoading: true,
};

function categoryReducer(state: CategoryState, action: CategoryAction): CategoryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'INIT':
      return {
        ...state,
        customCategories: action.payload.customCategories,
        categoryOrder: action.payload.categoryOrder,
        isLoading: false,
      };
    case 'ADD_CATEGORY':
      return {
        ...state,
        customCategories: [...state.customCategories, action.payload],
        categoryOrder: [...state.categoryOrder, action.payload.type],
      };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        customCategories: state.customCategories.map((c) =>
          c.type === action.payload.type ? action.payload : c
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        customCategories: state.customCategories.filter((c) => c.type !== action.payload),
        categoryOrder: state.categoryOrder.filter((t) => t !== action.payload),
      };
    case 'SET_ORDER':
      return {
        ...state,
        categoryOrder: action.payload,
      };
    default:
      return state;
  }
}

// Context
interface CategoryContextType {
  state: CategoryState;
  allCategories: Category[];
  addCategory: (input: CustomCategoryInput) => Promise<void>;
  updateCategory: (type: string, input: Partial<CustomCategoryInput>) => Promise<void>;
  deleteCategory: (type: string) => Promise<void>;
  getCategoryByType: (type: string) => Category | undefined;
  moveCategory: (type: string, direction: 'up' | 'down') => void;
  reorderCategories: (newOrder: string[]) => void;
}

const CategoryContext = createContext<CategoryContextType | null>(null);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(categoryReducer, initialState);

  // 初期ロード
  useEffect(() => {
    const init = async () => {
      try {
        const [categoriesJson, orderJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(ORDER_STORAGE_KEY),
        ]);
        const customCategories = categoriesJson ? (JSON.parse(categoriesJson) as Category[]) : [];
        let categoryOrder = orderJson ? (JSON.parse(orderJson) as string[]) : [];

        // 初回または順序が空の場合、デフォルト順序を設定
        if (categoryOrder.length === 0) {
          categoryOrder = [
            ...PRESET_CATEGORY_LIST.map((c) => c.type),
            ...customCategories.map((c) => c.type),
          ];
        } else {
          // 新しく追加されたカテゴリを末尾に追加
          const allTypes = new Set([
            ...PRESET_CATEGORY_LIST.map((c) => c.type),
            ...customCategories.map((c) => c.type),
          ]);
          const existingTypes = new Set(categoryOrder);
          for (const t of allTypes) {
            if (!existingTypes.has(t)) {
              categoryOrder.push(t);
            }
          }
          // 削除されたカテゴリを除去
          categoryOrder = categoryOrder.filter((t) => allTypes.has(t));
        }

        dispatch({ type: 'INIT', payload: { customCategories, categoryOrder } });
      } catch {
        dispatch({
          type: 'INIT',
          payload: {
            customCategories: [],
            categoryOrder: PRESET_CATEGORY_LIST.map((c) => c.type),
          },
        });
      }
    };
    init();
  }, []);

  // 変更時の永続化
  useEffect(() => {
    if (!state.isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.customCategories));
      AsyncStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(state.categoryOrder));
    }
  }, [state.customCategories, state.categoryOrder, state.isLoading]);

  const addCategory = async (input: CustomCategoryInput) => {
    const newCategory: Category = {
      type: `custom_${generateId()}`,
      label: input.label,
      icon: input.icon,
      color: input.color,
      isCustom: true,
    };
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
  };

  const updateCategory = async (type: string, input: Partial<CustomCategoryInput>) => {
    const existing = state.customCategories.find((c) => c.type === type);
    if (!existing) return;

    const updated: Category = {
      ...existing,
      ...input,
    };
    dispatch({ type: 'UPDATE_CATEGORY', payload: updated });
  };

  const deleteCategory = async (type: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: type });
  };

  const getCategoryByType = (type: string): Category | undefined => {
    // まずプリセットを検索
    const preset = PRESET_CATEGORY_LIST.find((c) => c.type === type);
    if (preset) return preset;
    // カスタムを検索
    return state.customCategories.find((c) => c.type === type);
  };

  const moveCategory = (type: string, direction: 'up' | 'down') => {
    const order = [...state.categoryOrder];
    const index = order.indexOf(type);
    if (index === -1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= order.length) return;

    // 位置を入れ替え
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
    dispatch({ type: 'SET_ORDER', payload: order });
  };

  const reorderCategories = (newOrder: string[]) => {
    dispatch({ type: 'SET_ORDER', payload: newOrder });
  };

  // 順序に従って全カテゴリを並び替え
  const allCategories = useMemo(() => {
    const categoryMap = new Map<string, Category>();
    for (const c of PRESET_CATEGORY_LIST) {
      categoryMap.set(c.type, c);
    }
    for (const c of state.customCategories) {
      categoryMap.set(c.type, c);
    }

    return state.categoryOrder
      .map((type) => categoryMap.get(type))
      .filter((c): c is Category => c !== undefined);
  }, [state.customCategories, state.categoryOrder]);

  return (
    <CategoryContext.Provider
      value={{
        state,
        allCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryByType,
        moveCategory,
        reorderCategories,
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
