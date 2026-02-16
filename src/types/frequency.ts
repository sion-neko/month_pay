/**
 * 支払い頻度の種類
 */
export type FrequencyType =
  | 'monthly' // 毎月
  | 'bimonthly' // 2ヶ月に1回
  | 'quarterly' // 3ヶ月に1回
  | 'semiannual' // 半年に1回
  | 'annual' // 年1回
  | 'custom'; // カスタム

/**
 * 支払い頻度
 */
export interface Frequency {
  type: FrequencyType;
  /** カスタム時の月数 */
  customMonths?: number;
}

/**
 * 支払い頻度の表示ラベル
 */
export const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  monthly: '毎月',
  bimonthly: '2ヶ月に1回',
  quarterly: '3ヶ月に1回',
  semiannual: '半年に1回',
  annual: '年1回',
  custom: 'カスタム',
};

/**
 * 各頻度の月数
 */
export const FREQUENCY_MONTHS: Record<Exclude<FrequencyType, 'custom'>, number> = {
  monthly: 1,
  bimonthly: 2,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
};

/**
 * 頻度選択用オプション
 */
export const FREQUENCY_OPTIONS = Object.entries(FREQUENCY_LABELS).map(([value, label]) => ({
  value: value as FrequencyType,
  label,
}));
