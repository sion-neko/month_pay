import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tag, TagInput, PRESET_TAGS } from '../types/tag';

const STORAGE_KEY = '@fixed_cost_manager/tags';

// State
interface TagState {
  tags: Tag[];
  isLoading: boolean;
}

// Action
type TagAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INIT'; payload: Tag[] }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: Tag }
  | { type: 'DELETE_TAG'; payload: string };

const initialState: TagState = {
  tags: [],
  isLoading: true,
};

function tagReducer(state: TagState, action: TagAction): TagState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'INIT':
      return { ...state, tags: action.payload, isLoading: false };
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] };
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter((t) => t.id !== action.payload),
      };
    default:
      return state;
  }
}

// Context
interface TagContextType {
  state: TagState;
  allTags: Tag[];
  addTag: (input: TagInput) => Promise<void>;
  updateTag: (id: string, input: Partial<TagInput>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  getTagById: (id: string) => Tag | undefined;
}

const TagContext = createContext<TagContextType | null>(null);

export function TagProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tagReducer, initialState);

  // 初期ロード
  useEffect(() => {
    const init = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const savedTags = JSON.parse(json) as Tag[];
          dispatch({ type: 'INIT', payload: savedTags });
        } else {
          // 初回はプリセットタグを設定
          dispatch({ type: 'INIT', payload: PRESET_TAGS });
        }
      } catch {
        dispatch({ type: 'INIT', payload: PRESET_TAGS });
      }
    };
    init();
  }, []);

  // 変更時の永続化
  useEffect(() => {
    if (!state.isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.tags));
    }
  }, [state.tags, state.isLoading]);

  const addTag = async (input: TagInput) => {
    const newTag: Tag = {
      id: `tag_${Date.now()}`,
      ...input,
    };
    dispatch({ type: 'ADD_TAG', payload: newTag });
  };

  const updateTag = async (id: string, input: Partial<TagInput>) => {
    const existing = state.tags.find((t) => t.id === id);
    if (!existing) return;
    const updated: Tag = { ...existing, ...input };
    dispatch({ type: 'UPDATE_TAG', payload: updated });
  };

  const deleteTag = async (id: string) => {
    dispatch({ type: 'DELETE_TAG', payload: id });
  };

  const getTagById = (id: string): Tag | undefined => {
    return state.tags.find((t) => t.id === id);
  };

  return (
    <TagContext.Provider
      value={{
        state,
        allTags: state.tags,
        addTag,
        updateTag,
        deleteTag,
        getTagById,
      }}
    >
      {children}
    </TagContext.Provider>
  );
}

export function useTagContext() {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error('useTagContext must be used within TagProvider');
  }
  return context;
}
