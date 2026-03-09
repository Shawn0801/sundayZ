import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CountyWeatherData } from '../../../interfaces/CountyWeatherData';

export interface CountyInfoDialogData {
  /** 縣市 ID */
  id: string;
  /** 縣市名稱 */
  name: string;
  /** 氣象資料（如果有的話） */
  weatherData?: CountyWeatherData;
}

@Component({
  selector: 'app-county-info-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './county-info-dialog.component.html',
  styleUrl: './county-info-dialog.component.scss'
})
export class CountyInfoDialogComponent {
  county: CountyInfoDialogData;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig<CountyInfoDialogData>
  ) {
    this.county = config.data || {
      id: '',
      name: '未知縣市'
    };
  }

  getAgriAdvisory(data: any): string {
    if (data.avgRainfall > 30) return '累積雨量較大，請加強田間排水，避免根部腐爛。';
    if (data.avgHumd > 0.85 && data.avgTemp > 25) return '當前高溫高濕，為病蟲害易發期，建議及早噴藥防護。';
    if (data.avgSoilMoisture < 30) return '土壤濕度偏低，作物可能面臨乾旱壓力，建議安排灌溉。';
    if (data.avgSun > 8) return '日照充足，適合進行光合作用，但需注意水分蒸發較快。';

    return '目前氣候穩定，適合進行日常農務操作。';
  }

  close(): void {
    this.ref.close();
  }
}
