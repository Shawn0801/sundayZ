import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FirestoreJournalService } from './firestore-journal.service';
import { AuthService } from './auth.service';
import { PesticideType, WeatherInfo } from '../interfaces/PesticideTypeRes';
import { AgriProductsTransTypeRes } from '../interfaces/AgriProductsTransTypeRes';
import { AutoWeatherStation, AutoWeatherStationRes } from '../interfaces/AutoWeatherStationRes';
import { PlantEpidemicTypeRes } from '../interfaces/PlantEpidemicTypeRes';
import { JournalEntry } from '../interfaces/JournalEntry';
import {
  AgriRiskPredictRequest,
  AgriRiskPredictResponse,
  AgriRiskFeature
} from '../interfaces/AgriRiskRes';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private firestoreJournal = inject(FirestoreJournalService);
  private authService = inject(AuthService);

  constructor(private http: HttpClient) { }


  getData() {
    const url = `${API_CONFIG.moa}/PesticideType/`;
    return this.http.get<PesticideType>(url);
  }

  getWeather() {
    const url = `${API_CONFIG.moa}/AutoWeatherStationType/`;
    return this.http.get<WeatherInfo>(url);
  }

  postData() {
    const url = `${API_CONFIG.dataGov}/front/statistics/export`;
    const postData = { format: 'json', type: 'category' };
    return this.http.post<any[]>(url, postData);
  }



  getAgriProductsTransType() {
    const url = `${API_CONFIG.moa}/AgriProductsTransType/`;
    return this.http.get<AgriProductsTransTypeRes>(url);
  }

  /**
   * 查詢指定日期範圍的農產品交易資料
   * @param startDate 開始日期 (格式: YYYY-MM-DD)
   * @param endDate 結束日期 (格式: YYYY-MM-DD)
   * @param cropCode 農產品代碼 (選填)
   * @returns Observable<AgriProductsTransTypeRes>
   */
  getAgriProductsByDateRange(startDate: string, endDate: string, cropCode?: string) {
    let url = `${API_CONFIG.moa}/AgriProductsTransType/?Start_time=${startDate}&End_time=${endDate}`;
    if (cropCode) {
      url += `&CropCode=${cropCode}`;
    }
    return this.http.get<AgriProductsTransTypeRes>(url);
  }

  /**
   * 取得今日日期字串 (格式: YYYY-MM-DD``
   */
  getTodayString(): string {
    const today = new Date();
    return this.formatDate(today);
  }

  /**
   * 取得 N 天前的日期字串 (格式: YYYY-MM-DD)
   */
  getDaysAgoString(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.formatDate(date);
  }

  /**
   * 格式化日期為 YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ─────────────────────────────────────────
  // 氣象測站 Mock 資料
  // ─────────────────────────────────────────

  /** 根據氣象資料估算土壤含水量（0–100） */
  calculateSoilMoisture(weather: Omit<AutoWeatherStation, 'VIRTUAL_SOIL_HUMD'>): number {
    let moisture = 50; // 基礎濕度 50%

    // 1. 降雨補給：降雨量對濕度提升最明顯
    const rainEffect = weather.H_24R * 2.5;
    moisture += rainEffect;

    // 2. 溫度與日照蒸發：高溫與日照會加速水分流失
    const tempFactor = weather.TEMP > 20 ? (weather.TEMP - 20) * 0.8 : 0;
    const sunFactor = weather.SUN * 1.2;
    moisture -= (tempFactor + sunFactor);

    // 3. 邊界處理：確保數值在 0-100% 之間
    moisture = Math.min(Math.max(moisture, 0), 100);

    return Math.round(moisture);
  }

  /** 取得 Mock 氣象測站資料（含 VIRTUAL_SOIL_HUMD） */
  getMockWeatherStation(): AutoWeatherStationRes {
    const rawData: Omit<AutoWeatherStation, 'VIRTUAL_SOIL_HUMD'>[] = [
      {
        Start_time: '2026-02-18 00:00:00',
        End_time: '2026-02-18 23:59:59',
        Station_name: '梨山',
        Station_ID: 'C0F9E1',
        Station_Latitude: 24.2572,
        Station_Longitude: 121.2239,
        TIME: '2026-02-18 12:00:00',
        ELEV: 1963,
        WDIR: 45,
        WDSD: 1.8,
        TEMP: 16.2,
        HUMD: 0.72,
        PRES: 802.5,
        SUN: 3,
        H_24R: 8.5,
        CITY: '臺中市',
        CITY_SN: 8,
        TOWN: '和平區',
        TOWN_SN: 1,
      },
    ];

    const data: AutoWeatherStation[] = rawData.map(station => ({
      ...station,
      VIRTUAL_SOIL_HUMD: this.calculateSoilMoisture(station),
    }));

    return { RS: '1', Data: data, Next: false };
  }


  // ex https://data.moa.gov.tw/api/v1/PlantEpidemicType/?Year=2026
  getPlantEpidemicType() {
    const today = new Date();
    let url = `${API_CONFIG.moa}/PlantEpidemicType/?Year=${today.getFullYear()}`;
    return this.http.get<PlantEpidemicTypeRes>(url);
  }

  // ─────────────────────────────────────────
  // 農務日誌功能（已整合 Firestore）
  // ─────────────────────────────────────────

  /**
   * 計算自指定日期以來的累積雨量
   * @param sinceDate 起始日期
   * @returns 累積雨量（mm）
   */
  getAccumulatedRainfall(sinceDate: Date): number {
    // Mock: 使用氣象站資料的 24h 雨量 * 天數估算
    const weatherData = this.getMockWeatherStation();
    const dailyRainfall = weatherData.Data[0]?.H_24R || 0;

    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - sinceDate.getTime()) / (1000 * 60 * 60 * 24));

    // 簡化估算：每天雨量約為 24h 雨量的 50-150% 隨機變化
    const totalRainfall = dailyRainfall * daysDiff * (0.5 + Math.random());

    return Math.round(totalRainfall * 10) / 10; // 保留一位小數
  }

  // ─────────────────────────────────────────
  // 農務日誌儲存功能 (Firestore)
  // ─────────────────────────────────────────

  private readonly STORAGE_KEY = 'journal_entries';

  /**
   * 儲存農務日誌（使用 Firestore 雲端儲存）
   * @param entry 日誌條目
   * @returns Observable<string> 儲存成功後的文件 ID
   */
  saveJournalEntry$(entry: JournalEntry): Observable<string> {
    // 取得當前使用者 ID
    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.uid || 'anonymous';

    console.log('👤 當前使用者:', currentUser ? currentUser.uid : '未登入');
    console.log('📝 準備儲存的日誌 (Upsert):', entry.id);

    // 確保 entry 有 userId
    const entryWithUserId = { ...entry, userId };

    return this.firestoreJournal.addJournalEntry(entryWithUserId);
  }

  /**
   * 儲存農務日誌（相容性方法，為了不破壞現有其他元件）
   */
  saveJournalEntry(entry: JournalEntry): boolean {
    this.saveJournalEntry$(entry).subscribe({
      next: (id) => console.log('✅ 同步介面存儲完成:', id),
      error: (err) => {
        console.error('❌ 同步介面存儲失敗，降級到 localStorage:', err);
        this.saveToLocalStorage(entry);
      }
    });
    return true;
  }

  /**
   * 備援：儲存到 localStorage
   * @param entry 日誌條目
   */
  private saveToLocalStorage(entry: JournalEntry): void {
    try {
      const existingData = localStorage.getItem(this.STORAGE_KEY);
      const entries: JournalEntry[] = existingData ? JSON.parse(existingData) : [];
      const existingIndex = entries.findIndex(e => e.id === entry.id);

      if (existingIndex !== -1) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
      console.log('已降級儲存到 localStorage');
    } catch (error) {
      console.error('localStorage 儲存失敗:', error);
    }
  }

  /**
   * 從 Firestore 載入所有日誌（一次性查詢）
   * @returns JournalEntry 陣列
   */
  loadJournalEntries(): JournalEntry[] {
    // 注意：這是同步方法，但 Firestore 是非同步的
    // 建議使用 loadJournalEntries$() 取得 Observable
    console.warn('loadJournalEntries() 是同步方法，建議使用 loadJournalEntries$()');

    // 從 localStorage 讀取（降級備援）
    return this.loadFromLocalStorage();
  }

  /**
   * 從 Firestore 載入所有日誌（Observable 方式）
   * 會自動監聽使用者登入狀態變化
   * @returns Observable<JournalEntry[]>
   */
  loadJournalEntries$(): Observable<JournalEntry[]> {
    // 監聽使用者狀態變化，自動重新載入資料
    return this.authService.user$.pipe(
      switchMap(user => {
        if (!user) {
          console.warn('⚠️ 使用者未登入，返回空陣列');
          console.log('💡 請先登入以載入日誌資料');
          // 返回空陣列的 Observable
          return new Observable<JournalEntry[]>(observer => {
            observer.next([]);
            observer.complete();
          });
        }

        console.log('👤 使用者已登入:', user.uid);
        console.log('📡 開始監聽 Firestore 日誌資料...');

        // 使用者已登入，監聽 Firestore 資料
        return this.firestoreJournal.watchUserJournalEntries(user.uid);
      })
    );
  }

  /**
   * 從 localStorage 載入（備援方法）
   * @returns JournalEntry 陣列
   */
  private loadFromLocalStorage(): JournalEntry[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);

      if (data) {
        const entries: JournalEntry[] = JSON.parse(data);
        // 將日期字串轉換回 Date 物件
        return entries.map(entry => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
          phi_end_date: entry.phi_end_date ? new Date(entry.phi_end_date) : undefined
        }));
      }

      return [];
    } catch (error) {
      console.error('載入日誌失敗:', error);
      return [];
    }
  }

  /**
   * 刪除日誌 (Observable 方式)
   * @param id 日誌 ID
   * @returns Observable<void>
   */
  deleteJournalEntry$(id: string): Observable<void> {
    console.log('🗑️ 開始從 Firestore 刪除紀錄:', id);
    return this.firestoreJournal.deleteJournalEntry(id);
  }

  /**
   * 刪除日誌（相容性方法）
   */
  deleteJournalEntry(id: string): boolean {
    this.deleteJournalEntry$(id).subscribe({
      next: () => console.log('✅ 刪除完成'),
      error: (err) => console.error('❌ 刪除失敗:', err)
    });
    return true;
  }

  // ─────────────────────────────────────────
  // GCP Vertex AI - agriRisk 農業風險預測
  // ─────────────────────────────────────────

  /**
   * 呼叫 GCP Vertex AI agriRisk 模型進行農業風險預測
   *
   * @param features 預測特徵資料（根據你的模型欄位調整）
   * @param accessToken GCP OAuth 2.0 Access Token (使用 gcloud auth print-access-token 取得)
   * @returns Observable<AgriRiskPredictResponse>
   *
   * 使用範例：
   * ```typescript
   * const features: AgriRiskFeature = {
   *   agriRisk: 'your_value'  // 根據模型實際欄位調整
   * };
   * this.dataService.predictAgriRisk(features, accessToken).subscribe({
   *   next: (result) => console.log('預測結果:', result.predictions),
   *   error: (error) => console.error('預測失敗:', error)
   * });
   * ```
   */
  predictAgriRisk(
    features: AgriRiskFeature | AgriRiskFeature[],
    accessToken: string
  ): Observable<AgriRiskPredictResponse> {
    const url = this.getAgriRiskEndpointUrl();

    // 確保 features 是陣列格式
    const instances = Array.isArray(features) ? features : [features];

    const payload: AgriRiskPredictRequest = { instances };

    // 設定 HTTP Headers（需要 GCP Access Token）
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<AgriRiskPredictResponse>(url, payload, { headers });
  }

  /**
   * 根據當前測站氣象資料建立 agriRisk 預測特徵
   *
   * 模型用途：預測農產品平均價格 (avg_price)
   * 需要提供：交易資料（10個欄位）+ 氣象資料（7個欄位）
   *
   * @param station 氣象測站資料
   * @param cropName 作物名稱（選填，預設為「青江菜」）
   * @param cropCode 作物代碼（選填，預設為「L01」）
   * @param marketName 市場名稱（選填，預設為「台北市場」）
   * @param historicalPrice 歷史價格資料（選填，用於提供更準確的價格預測）
   * @returns AgriRiskFeature
   */
  buildAgriRiskFeatures(
    station: AutoWeatherStation,
    cropName: string = '青江菜',
    cropCode: string = 'L01',
    marketName: string = '台北市場',
    historicalPrice?: { upper: number; middle: number; lower: number; quantity: number }
  ): AgriRiskFeature {
    const today = new Date();

    // 轉換為民國年格式 (115.02.16)
    const rocYear = today.getFullYear() - 1911;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const trans_date = `${rocYear}.${month}.${day}`;

    // 西元年格式 (2026-02-16)
    const trans_date_parsed = this.formatDate(today);

    // 使用歷史價格資料或預設值
    const priceData = historicalPrice || {
      upper: 60,
      middle: 45,
      lower: 30,
      quantity: 150
    };

    // 交易資料欄位
    return {
      // === 交易相關欄位 ===
      trans_date: trans_date,                    // 民國年格式
      trans_date_parsed: trans_date_parsed,      // 西元年格式
      crop_name: cropName,                       // 作物名稱
      crop_code: cropCode,                       // 作物代碼
      tc_type: 'N04',                            // 交易類型
      market_name: marketName,                   // 市場名稱
      upper_price: priceData.upper,              // 上價
      middle_price: priceData.middle,            // 中價
      lower_price: priceData.lower,              // 下價
      trans_quantity: priceData.quantity,        // 交易數量

      // === 氣象相關欄位 ===
      city: station.CITY,                        // 城市
      avg_temp: station.TEMP,                    // 平均溫度
      avg_humd: station.HUMD * 100,              // 平均濕度（轉為百分比）
      avg_pres: station.PRES,                    // 平均氣壓
      avg_wdsd: station.WDSD,                    // 平均風速
      max_h_24r: station.H_24R,                  // 24小時最大雨量
      avg_rain: station.H_24R,                   // 平均雨量（使用24h雨量）
      max_hour_24: 1,                            // 24小時最大值（預設）
      max_daily_rain: station.H_24R              // 每日最大雨量
    };
  }

  /**
   * 建立完整的 Vertex AI Endpoint URL
   */
  private getAgriRiskEndpointUrl(): string {
    const { baseUrl, projectId, location, endpointId } = API_CONFIG.vertexAI;
    return `${baseUrl}/projects/${projectId}/locations/${location}/endpoints/${endpointId}:predict`;
  }

}
