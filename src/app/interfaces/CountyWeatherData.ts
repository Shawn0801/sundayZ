/**
 * 縣市天氣平均資料介面
 * 用於顯示地圖點擊後的氣象資訊
 */
export interface CountyWeatherData {
  /** 縣市名稱 */
  countyName: string;

  /** 縣市編號 */
  citySn: number;

  /** 該縣市的測站數量 */
  stationCount: number;

  /** 平均溫度 (°C) */
  avgTemp: number;

  /** 平均濕度 (0-1) */
  avgHumd: number;

  /** 平均氣壓 (hPa) */
  avgPres: number;

  /** 平均日照 (小時) */
  avgSun: number;

  /** 平均 24 小時累積雨量 (mm) */
  avgRainfall: number;

  /** 平均土壤濕度 (0-100) */
  avgSoilMoisture: number;

  /** 最後更新時間 */
  lastUpdateTime?: string;
}
