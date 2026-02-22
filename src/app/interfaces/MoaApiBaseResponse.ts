/**
 * 農業部 API 共用回應格式基礎介面
 * 所有農業部 API 的回應都遵循此結構
 */
export interface MoaApiBaseResponse<T> {
  /** 回應狀態碼 */
  RS: string;
  /** 資料陣列 */
  Data: T[];
  /** 是否有下一頁 */
  Next: boolean;
}
