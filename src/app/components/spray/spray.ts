import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { DataService } from '../../services/data-service';
import { AutoWeatherStation } from '../../interfaces/AutoWeatherStationRes';

export interface SoilStatusInfo {
  label: string;
  textClass: string;
  gaugeStroke: string; // SVG stroke 色碼，對應 tailwind.config.js 專案色系
  waterColor: string; // 水波主色
  waterColorLight: string; // 水波淺色（半透明）
}

@Component({
  selector: 'app-spray',
  imports: [NgClass],
  templateUrl: './spray.html',
  styleUrl: './spray.scss'
})
export class Spray implements OnInit {
  station: AutoWeatherStation | null = null;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    const res = this.dataService.getMockWeatherStation();
    this.station = res.Data[0] ?? null;
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
      waterColor: 'rgba(14, 165, 233, 0.7)', // info-500 半透明
      waterColorLight: 'rgba(14, 165, 233, 0.3)'
    };
    if (h >= 45) return {
      label: '水分適中：生長環境良好。',
      textClass: 'text-success-600',
      gaugeStroke: '#2D5A27', // primary-500
      waterColor: 'rgba(45, 90, 39, 0.7)', // primary-500 半透明（森林深綠）
      waterColorLight: 'rgba(45, 90, 39, 0.3)'
    };
    if (h >= 20) return {
      label: '土壤偏乾：建議安排傍晚澆水。',
      textClass: 'text-accent-600',
      gaugeStroke: '#D4A373', // accent-500
      waterColor: 'rgba(212, 163, 115, 0.7)', // accent-500 半透明
      waterColorLight: 'rgba(212, 163, 115, 0.3)'
    };
    return {
      label: '極度缺水：請立即補水，避免乾旱傷害。',
      textClass: 'text-danger-500',
      gaugeStroke: '#ef4444', // danger-500
      waterColor: 'rgba(239, 68, 68, 0.7)', // danger-500 半透明
      waterColorLight: 'rgba(239, 68, 68, 0.3)'
    };
  }

  // SVG 圓弧：circumference = 2 * π * r = 2 * π * 50 ≈ 314
  get soilGaugeDash(): string {
    const circumference = 314;
    const filled = (this.soilHumidity / 100) * circumference;
    return `${filled} ${circumference}`;
  }

  // ── 環境即時觀測 ──
  get stationName(): string {
    return this.station?.Station_name ?? '--';
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
}
