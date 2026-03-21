/**
 * GCP Vertex AI agriRisk 農業風險預測模型
 * Endpoint ID: 5505740704413908992
 *
 * 輸入特徵欄位名稱：agriRisk (你只知道這個名稱)
 * 實際特徵需要根據模型訓練時的欄位來調整
 */

/**
 * Vertex AI 預測請求格式
 * 根據 GCP 文件，需要包裝成 instances 陣列
 */
export interface AgriRiskPredictRequest {
  instances: AgriRiskFeature[];
}

/**
 * agriRisk 特徵資料結構
 * TODO: 請根據你的模型實際訓練欄位調整此介面
 *
 * 常見農業風險特徵欄位範例：
 * - temperature: 溫度
 * - humidity: 濕度
 * - rainfall: 降雨量
 * - soilMoisture: 土壤濕度
 * - windSpeed: 風速
 * - season: 季節
 * - cropType: 作物類型
 */
export interface AgriRiskFeature {
  // 方案 1: 如果模型只接受單一欄位 "agriRisk"
  agriRisk?: string | number;

  // 方案 2: 如果模型接受多個氣象欄位（依你的模型訓練資料決定）
  // temperature?: number;
  // humidity?: number;
  // rainfall?: number;
  // soilMoisture?: number;
  // windSpeed?: number;

  // 方案 3: 彈性設計，允許任意欄位
  [key: string]: any;
}

/**
 * Vertex AI 預測回應格式
 */
export interface AgriRiskPredictResponse {
  predictions: AgriRiskPrediction[];
  deployedModelId?: string;
  model?: string;
  modelDisplayName?: string;
  modelVersionId?: string;
}

/**
 * agriRisk 預測結果
 * 模型輸出：農產品價格預測 (avg_price)
 *
 * 實際回應範例：
 * {
 *   "value": 1539.224609375,
 *   "lower_bound": 14318.9208984375,
 *   "upper_bound": 18668.828125
 * }
 */
export interface AgriRiskPrediction {
  /** 預測平均價格 */
  value?: number;

  /** 95% 信賴區間下界 */
  lower_bound?: number;

  /** 95% 信賴區間上界 */
  upper_bound?: number;

  // 保留彈性設計，允許其他未定義欄位
  [key: string]: any;
}

/**
 * 錯誤回應格式
 */
export interface AgriRiskErrorResponse {
  error: {
    code: number;
    message: string;
    status: string;
    details?: any[];
  };
}
