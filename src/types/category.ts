/**
 * プリセットカテゴリの種類
 */
export type PresetCategoryType =
  | 'housing' // 住居
  | 'communication' // 通信
  | 'subscription' // サブスク
  | 'insurance' // 保険
  | 'beauty' // 美容
  | 'transportation' // 交通
  | 'other'; // その他

/**
 * カテゴリの種類（プリセット + カスタム）
 */
export type CategoryType = PresetCategoryType | string;

/**
 * カテゴリ情報
 */
export interface Category {
  type: CategoryType;
  label: string;
  icon: string;
  color: string;
  isCustom?: boolean;
  order?: number;
}

/**
 * カスタムカテゴリの入力
 */
export type CustomCategoryInput = Omit<Category, 'type' | 'isCustom'>;

/**
 * 選択可能な色
 */
export const CATEGORY_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
  '#9966FF', '#FF9F40', '#C9CBCF', '#E91E63',
  '#2196F3', '#4CAF50', '#FF5722', '#795548',
];

/**
 * 選択可能なアイコン
 */
export const CATEGORY_ICONS = [
  'home', 'cellphone', 'play-circle', 'shield-check',
  'content-cut', 'train', 'car', 'food', 'medical-bag',
  'school', 'basketball', 'music', 'music-note', 'book-open-variant',
  'shopping', 'gift', 'heart', 'star', 'lightning-bolt',
  'dots-horizontal',
];

/**
 * プリセットカテゴリ定義マスター
 */
export const PRESET_CATEGORIES: Record<PresetCategoryType, Category> = {
  housing: {
    type: 'housing',
    label: '住居',
    icon: 'home',
    color: '#FF6384',
  },
  communication: {
    type: 'communication',
    label: '通信',
    icon: 'cellphone',
    color: '#36A2EB',
  },
  subscription: {
    type: 'subscription',
    label: 'サブスク',
    icon: 'play-circle',
    color: '#FFCE56',
  },
  insurance: {
    type: 'insurance',
    label: '保険',
    icon: 'shield-check',
    color: '#4BC0C0',
  },
  beauty: {
    type: 'beauty',
    label: '美容',
    icon: 'content-cut',
    color: '#9966FF',
  },
  transportation: {
    type: 'transportation',
    label: '交通',
    icon: 'train',
    color: '#FF9F40',
  },
  other: {
    type: 'other',
    label: 'その他',
    icon: 'dots-horizontal',
    color: '#C9CBCF',
  },
};

/**
 * プリセットカテゴリ一覧（配列）
 */
export const PRESET_CATEGORY_LIST = Object.values(PRESET_CATEGORIES);

/**
 * 後方互換性のためのエイリアス
 */
export const CATEGORIES = PRESET_CATEGORIES;
export const CATEGORY_LIST = PRESET_CATEGORY_LIST;
