/**
 * 農務日誌操作類型
 */
export enum JournalType {
  PESTICIDE = 'Pesticide',    // 噴藥
  FERTILIZER = 'Fertilizer',  // 施肥
  HARVEST = 'Harvest',        // 採收
  WEEDING = 'Weeding',        // 除草
  TILLING = 'Tilling',        // 整地
  OBSERVATION = 'Observation' // 觀察紀錄
}

/**
 * 農務日誌類型標籤
 */
export const JournalTypeLabels: Record<JournalType, string> = {
  [JournalType.PESTICIDE]: '噴藥',
  [JournalType.FERTILIZER]: '施肥',
  [JournalType.HARVEST]: '採收',
  [JournalType.WEEDING]: '除草',
  [JournalType.TILLING]: '整地',
  [JournalType.OBSERVATION]: '觀察'
};

/**
 * 農務日誌類型圖示（PrimeIcons）
 */
export const JournalTypeIcons: Record<JournalType, string> = {
  [JournalType.PESTICIDE]: 'pi-shield',
  [JournalType.FERTILIZER]: 'pi-seedling',
  [JournalType.HARVEST]: 'pi-shopping-bag',
  [JournalType.WEEDING]: 'pi-scissors',
  [JournalType.TILLING]: 'pi-wrench',
  [JournalType.OBSERVATION]: 'pi-eye'
};

/**
 * 農務日誌類型顏色
 */
export const JournalTypeColors: Record<JournalType, string> = {
  [JournalType.PESTICIDE]: 'text-danger-500',
  [JournalType.FERTILIZER]: 'text-success-500',
  [JournalType.HARVEST]: 'text-accent-500',
  [JournalType.WEEDING]: 'text-warning-500',
  [JournalType.TILLING]: 'text-surface-600',
  [JournalType.OBSERVATION]: 'text-info-500'
};

/**
 * 農務日誌條目
 */
export interface JournalEntry {
  /** Firestore 自動生成 ID */
  id: string;

  /** 農夫唯一辨識碼 */
  userId: string;

  /** 紀錄發生的時間 */
  timestamp: Date;

  /** 動作分類 */
  type: JournalType;

  /** 對應作物（如：青江菜、高麗菜） */
  targetCrop: string;

  /** 資材名稱（如：益達胺） */
  itemName?: string;

  /** 使用劑量 */
  quantity?: number;

  /** 劑量單位（如：c.c.、包） */
  unit?: string;

  /** 安全採收天數（計算倒數用，僅噴藥時需要） */
  phi_days?: number;

  /** 計算後的安全期截止日期 */
  phi_end_date?: Date;

  /** 備註文字 */
  notes?: string;

  /** 圖片存儲路徑（Firebase Storage） */
  imageUrl?: string;
}

/**
 * 農務日誌 API 回應格式（未來擴充用）
 */
export interface JournalEntryRes {
  RS: string;
  Data: JournalEntry[];
  Next: boolean;
}
