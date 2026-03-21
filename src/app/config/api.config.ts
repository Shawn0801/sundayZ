/**
 * API 配置檔案
 *
 * 用於管理開發與生產環境的 API 端點
 * - 開發環境：使用 proxy 代理（相對路徑）
 * - 生產環境：使用完整 URL（直接請求）
 */


interface ApiConfig {
  moa: string;
  dataGov: string;
  vertexAI: {
    projectId: string;
    location: string;
    endpointId: string;
    baseUrl: string;
  };
}

/**
 * 取得當前環境的 API 配置
 */
export function getApiConfig(): ApiConfig {

  // 生產環境：直接使用完整 URL
  return {
    moa: 'https://data.moa.gov.tw/api/v1',
    dataGov: 'https://data.gov.tw',
    vertexAI: {
      projectId: '342016522608',
      location: 'asia-east1',
      endpointId: '5505740704413908992',
      baseUrl: 'https://asia-east1-aiplatform.googleapis.com/v1'
    }
  };
}


/**
 * API 端點常數
 * 在組件或服務中使用 API_CONFIG 來取得 API URL
 */
export const API_CONFIG = getApiConfig();
