/**
 * 重要度の種類
 */
export type PriorityType = 'essential' | 'semi-essential' | 'discretionary';

/**
 * 重要度の定義
 */
export interface Priority {
  type: PriorityType;
  label: string;
  color: string;
  icon: string;
}

/**
 * 重要度マスター
 */
export const PRIORITIES: Record<PriorityType, Priority> = {
  essential: {
    type: 'essential',
    label: '必須',
    color: '#FF7675', // Rose
    icon: 'shield-check',
  },
  'semi-essential': {
    type: 'semi-essential',
    label: '準必須',
    color: '#FACD5D', // Amber/Yellow
    icon: 'alert-circle',
  },
  discretionary: {
    type: 'discretionary',
    label: 'ゆとり',
    color: '#55EFC4', // Mint
    icon: 'leaf',
  },
};

/**
 * 重要度一覧（配列）
 */
export const PRIORITY_LIST = Object.values(PRIORITIES);

/**
 * 重要度ラベルマップ
 */
export const PRIORITY_LABELS: Record<PriorityType, string> = {
  essential: '必須',
  'semi-essential': '準必須',
  discretionary: 'ゆとり',
};
