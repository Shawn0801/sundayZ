import { Component, OnInit } from '@angular/core';
import { NgClass, JsonPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DataService } from '../../services/data-service';
import { ConfigService } from '../../services/config.service';
import { AutoWeatherStation } from '../../interfaces/AutoWeatherStationRes';
import { WeatherType } from '../../interfaces/PesticideTypeRes';
import { AgriRiskPredictResponse } from '../../interfaces/AgriRiskRes';

export interface SoilStatusInfo {
  label: string;
  textClass: string;
  gaugeStroke: string; // SVG stroke 色碼，對應 tailwind.config.js 專案色系
  waterColor: string; // 水波主色
  waterColorLight: string; // 水波淺色（半透明）
}

interface StationOption {
  Station_ID: string;
  Station_name: string;
  CITY: string;
}

interface StationGroup {
  label: string;  // 縣市名稱
  items: StationOption[];  // 該縣市的測站列表
}

@Component({
  selector: 'app-spray',
  imports: [NgClass, JsonPipe, DecimalPipe, FormsModule, Select],
  templateUrl: './spray.html',
  styleUrl: './spray.scss'
})
export class Spray implements OnInit {
  // 所有測站資料
  allStations: AutoWeatherStation[] = [];

  // 測站選單選項（按縣市分組）
  stationGroups: StationGroup[] = [];
  selectedStationId: string | null = null;

  // 當前顯示的測站
  station: AutoWeatherStation | null = null;

  // 載入狀態
  loading = true;
  error: string | null = null;

  // agriRisk 風險預測
  riskPrediction: AgriRiskPredictResponse | null = null;
  riskLoading = false;
  riskError: string | null = null;

  // 暴露 Math 給模板使用
  Math = Math;

  constructor(
    private dataService: DataService,
    private configService: ConfigService
  ) { }

  ngOnInit(): void {
    this.loadWeatherData();
  }

  /**
   * 載入真實氣象資料
   */
  loadWeatherData(): void {
    this.loading = true;
    this.error = null;

    this.dataService.getWeather().subscribe({
      next: (response) => {
        if (response.Data && response.Data.length > 0) {
          // 轉換為 AutoWeatherStation 格式
          this.allStations = this.convertWeatherTypeToAutoWeatherStation(response.Data);

          // 建立測站選項列表（按縣市分組）
          this.stationGroups = this.groupStationsByCity(this.allStations);

          // 預設選擇第一個測站
          if (this.allStations.length > 0) {
            this.selectedStationId = this.allStations[0].Station_ID;
            this.updateSelectedStation(this.selectedStationId);
          }

          this.loading = false;
        } else {
          this.handleNoData();
        }
      },
      error: (error) => {
        console.error('載入氣象資料失敗:', error);
        this.error = '無法載入氣象資料，請稍後再試';
        this.loading = false;

        // 使用 Mock 資料作為備援
        this.useMockData();
      }
    });
  }

  /**
   * 使用 Mock 資料（當 API 失敗時）
   */
  private useMockData(): void {
    const mockData = this.dataService.getMockWeatherStation();
    if (mockData.Data && mockData.Data.length > 0) {
      this.allStations = mockData.Data;
      this.stationGroups = this.groupStationsByCity(this.allStations);

      if (this.allStations.length > 0) {
        this.selectedStationId = this.allStations[0].Station_ID;
        this.updateSelectedStation(this.selectedStationId);
      }

      this.error = null; // 清除錯誤訊息（因為有 Mock 資料）
      this.loading = false;
    }
  }

  /**
   * 將測站按縣市分組
   */
  private groupStationsByCity(stations: AutoWeatherStation[]): StationGroup[] {
    // 步驟 1：根據 Station_ID 去重（保留每個測站的唯一記錄）
    const uniqueStationsMap = new Map<string, AutoWeatherStation>();

    stations.forEach(station => {
      // 過濾無效資料：必須有測站 ID 和縣市名稱
      if (!station.Station_ID || !station.CITY) {
        console.warn('跳過無效測站資料:', station);
        return;
      }

      const existingStation = uniqueStationsMap.get(station.Station_ID);

      // 如果測站不存在，或新資料時間較晚，則更新
      if (!existingStation || station.TIME > existingStation.TIME) {
        uniqueStationsMap.set(station.Station_ID, station);
      }
    });

    // 步驟 2：將去重後的測站按縣市分組
    const cityMap = new Map<string, StationOption[]>();

    uniqueStationsMap.forEach(station => {
      // 清理縣市名稱（移除前後空白）
      const city = station.CITY.trim();

      if (!cityMap.has(city)) {
        cityMap.set(city, []);
      }
      cityMap.get(city)!.push({
        Station_ID: station.Station_ID,
        Station_name: station.Station_name.trim(),
        CITY: city
      });
    });

    // 步驟 3：轉換為 StationGroup 陣列並排序
    const groups: StationGroup[] = [];
    cityMap.forEach((items, city) => {
      groups.push({
        label: city,
        items: items.sort((a, b) => a.Station_name.localeCompare(b.Station_name, 'zh-TW'))
      });
    });

    // 步驟 4：按縣市名稱排序
    return groups.sort((a, b) => a.label.localeCompare(b.label, 'zh-TW'));
  }

  /**
   * 處理無資料的情況
   */
  private handleNoData(): void {
    this.error = '目前無氣象資料';
    this.loading = false;
    // 嘗試使用 Mock 資料
    this.useMockData();
  }

  /**
   * 將 WeatherType (字串欄位) 轉換為 AutoWeatherStation (數值欄位)
   */
  private convertWeatherTypeToAutoWeatherStation(weatherData: WeatherType[]): AutoWeatherStation[] {
    return weatherData.map(w => {
      const converted: Omit<AutoWeatherStation, 'VIRTUAL_SOIL_HUMD'> = {
        Start_time: '',
        End_time: '',
        Station_name: w.Station_name,
        Station_ID: w.Station_ID,
        Station_Latitude: parseFloat(w.Station_Latitude) || 0,
        Station_Longitude: parseFloat(w.Station_Longitude) || 0,
        TIME: w.TIME,
        ELEV: parseFloat(w.ELEV) || 0,
        WDIR: parseFloat(w.WDIR) || 0,
        WDSD: parseFloat(w.WDSD) || 0,
        TEMP: parseFloat(w.TEMP) || 0,
        HUMD: parseFloat(w.HUMD) || 0,
        PRES: parseFloat(w.PRES) || 0,
        SUN: parseFloat(w.SUN) || 0,
        H_24R: parseFloat(w.H_24R) || 0,
        CITY: w.CITY,
        CITY_SN: parseInt(w.CITY_SN) || 0,
        TOWN: w.TOWN,
        TOWN_SN: parseInt(w.TOWN_SN) || 0,
      };

      // 計算虛擬土壤濕度
      const withSoilMoisture: AutoWeatherStation = {
        ...converted,
        VIRTUAL_SOIL_HUMD: this.dataService.calculateSoilMoisture(converted)
      };

      return withSoilMoisture;
    });
  }

  /**
   * 更新選擇的測站
   */
  updateSelectedStation(stationId: string): void {
    const found = this.allStations.find(s => s.Station_ID === stationId);
    if (found) {
      this.station = found;
    }
  }

  /**
   * 測站選單變更事件
   */
  onStationChange(stationId: string): void {
    this.updateSelectedStation(stationId);
  }

  // ── 土壤濕度 ──
  get soilHumidity(): number {
    return this.station?.VIRTUAL_SOIL_HUMD ?? 0;
  }

  get soilStatusInfo(): SoilStatusInfo {
    const h = this.soilHumidity;
    if (h > 85) return {
      label: '土壤過濕：暫停灌溉，注意排水。',
      textClass: 'text-info-600',
      gaugeStroke: '#0ea5e9', // info-500
      waterColor: 'rgba(14, 165, 233, 0.7)',
      waterColorLight: 'rgba(14, 165, 233, 0.3)'
    };
    if (h >= 45) return {
      label: '水分適中：生長環境良好。',
      textClass: 'text-success-600',
      gaugeStroke: '#2D5A27', // primary-500
      waterColor: 'rgba(45, 90, 39, 0.7)',
      waterColorLight: 'rgba(45, 90, 39, 0.3)'
    };
    if (h >= 20) return {
      label: '土壤偏乾：建議安排傍晚澆水。',
      textClass: 'text-accent-600',
      gaugeStroke: '#D4A373', // accent-500
      waterColor: 'rgba(212, 163, 115, 0.7)',
      waterColorLight: 'rgba(212, 163, 115, 0.3)'
    };
    return {
      label: '極度缺水：請立即補水，避免乾旱傷害。',
      textClass: 'text-danger-500',
      gaugeStroke: '#ef4444', // danger-500
      waterColor: 'rgba(239, 68, 68, 0.7)',
      waterColorLight: 'rgba(239, 68, 68, 0.3)'
    };
  }

  // ── 環境即時觀測 ──
  get stationName(): string {
    return this.station?.Station_name ?? '--';
  }

  get cityName(): string {
    return this.station?.CITY ?? '--';
  }

  get temperature(): number {
    return this.station?.TEMP ?? 0;
  }

  /** HUMD 原始值為小數（0.72 = 72%），轉為整數百分比 */
  get humidity(): number {
    return Math.round((this.station?.HUMD ?? 0) * 100);
  }

  get rainfall(): number {
    return this.station?.H_24R ?? 0;
  }

  /**
   * 取得溫度狀態顏色
   */
  get temperatureColor(): string {
    const temp = this.temperature;
    if (temp >= 35) return 'text-danger-500';
    if (temp >= 28) return 'text-warning-500';
    if (temp >= 18) return 'text-success-500';
    if (temp >= 10) return 'text-info-500';
    return 'text-primary-500';
  }

  /**
   * 取得雨量狀態顏色
   */
  get rainfallColor(): string {
    const rain = this.rainfall;
    if (rain >= 50) return 'bg-info-500';
    if (rain >= 15) return 'bg-info-400';
    if (rain >= 1) return 'bg-info-300';
    return 'bg-surface-300';
  }

  // ── GCP Vertex AI agriRisk 風險預測 ──


}
