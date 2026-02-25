import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, CustomCategoryInput, PRESET_CATEGORY_LIST } from '../types/category';
import { generateId } from '../utils/format';

const STORAGE_KEY = '@fixed_cost_manager/custom_categories';
const ORDER_STORAGE_KEY = '@fixed_cost_manager/category_order';
const DELETED_PRESETS_KEY = '@fixed_cost_manager/deleted_presets';

// State
interface CategoryState {
  customCategories: Category[];
  categoryOrder: string[]; // カテゴリtypeの配列（順序）
  deletedPresets: string[]; // 削除されたプリセットのtype
  isLoading: boolean;
}

// Action
type CategoryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INIT'; payload: { customCategories: Category[]; categoryOrder: string[]; deletedPresets: string[] } }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: { type: string; isPreset: boolean } }
  | { type: 'SET_ORDER'; payload: string[] };

const initialState: CategoryState = {
  customCategories: [],
  categoryOrder: [],
  deletedPresets: [],
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
        deletedPresets: action.payload.deletedPresets,
        isLoading: false,
      };
    case 'ADD_CATEGORY':
      return {
        ...state,
        customCategories: [...state.customCategories, action.payload],
        // 既に順序に含まれている場合は追加しない（プリセットのオーバーライド時）
        categoryOrder: state.categoryOrder.includes(action.payload.type)
          ? state.categoryOrder
          : [...state.categoryOrder, action.payload.type],
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
        customCategories: state.customCategories.filter((c) => c.type !== action.payload.type),
        categoryOrder: state.categoryOrder.filter((t) => t !== action.payload.type),
        deletedPresets: action.payload.isPreset
          ? [...state.deletedPresets, action.payload.type]
          : state.deletedPresets,
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
        const [categoriesJson, orderJson, deletedPresetsJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(ORDER_STORAGE_KEY),
          AsyncStorage.getItem(DELETED_PRESETS_KEY),
        ]);
        const customCategories = categoriesJson ? (JSON.parse(categoriesJson) as Category[]) : [];
        let categoryOrder = orderJson ? (JSON.parse(orderJson) as string[]) : [];
        const deletedPresets = deletedPresetsJson ? (JSON.parse(deletedPresetsJson) as string[]) : [];
        const deletedPresetsSet = new Set(deletedPresets);

        // 初回または順序が空の場合、デフォルト順序を設定
        if (categoryOrder.length === 0) {
          categoryOrder = [
            ...PRESET_CATEGORY_LIST.filter((c) => !deletedPresetsSet.has(c.type)).map((c) => c.type),
            ...customCategories.map((c) => c.type),
          ];
        } else {
          // 新しく追加されたカテゴリを末尾に追加（削除済みプリセットは除外）
          const allTypes = new Set([
            ...PRESET_CATEGORY_LIST.filter((c) => !deletedPresetsSet.has(c.type)).map((c) => c.type),
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

        dispatch({ type: 'INIT', payload: { customCategories, categoryOrder, deletedPresets } });
      } catch {
        dispatch({
          type: 'INIT',
          payload: {
            customCategories: [],
            categoryOrder: PRESET_CATEGORY_LIST.map((c) => c.type),
            deletedPresets: [],
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
      AsyncStorage.setItem(DELETED_PRESETS_KEY, JSON.stringify(state.deletedPresets));
    }
  }, [state.customCategories, state.categoryOrder, state.deletedPresets, state.isLoading]);

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
    // カスタムカテゴリの場合
    const existingCustom = state.customCategories.find((c) => c.type === type);
    if (existingCustom) {
      const updated: Category = {
        ...existingCustom,
        ...input,
      };
      dispatch({ type: 'UPDATE_CATEGORY', payload: updated });
      return;
    }

    // プリセットカテゴリの場合（オーバーライドとして保存）
    const preset = PRESET_CATEGORY_LIST.find((c) => c.type === type);
    if (preset) {
      const overridden: Category = {
        ...preset,
        ...input,
        isCustom: false, // プリセットのオーバーライドであることを示す
      };
      dispatch({ type: 'ADD_CATEGORY', payload: overridden });
    }
  };

  const deleteCategory = async (type: string) => {
    const isPreset = PRESET_CATEGORY_LIST.some((c) => c.type === type);
    dispatch({ type: 'DELETE_CATEGORY', payload: { type, isPreset } });
  };

  const getCategoryByType = (type: string): Category | undefined => {
    // まずカスタム（オーバーライド含む）を検索
    const custom = state.customCategories.find((c) => c.type === type);
    if (custom) return custom;
    // プリセットを検索
    return PRESET_CATEGORY_LIST.find((c) => c.type === type);
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
