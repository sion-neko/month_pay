/**
 * カテゴリの種類
 */
export type CategoryType =
  | 'housing' // 住居
  | 'communication' // 通信
  | 'subscription' // サブスク
  | 'insurance' // 保険
  | 'beauty' // 美容
  | 'transportation' // 交通
  | 'other'; // その他

/**
 * カテゴリ情報
 */
export interface Category {
  type: CategoryType;
  label: string;
  icon: string;
  color: string;
}

/**
 * カテゴリ定義マスター
 */
export const CATEGORIES: Record<CategoryType, Category> = {
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
 * カテゴリ一覧（配列）
 */
export const CATEGORY_LIST = Object.values(CATEGORIES);
