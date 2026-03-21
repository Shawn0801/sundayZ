import { Component, inject, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { DataService } from '../../services/data-service';
import { ConfigService } from '../../services/config.service';
import { AgriProduct } from '../../interfaces/AgriProductsTransTypeRes';
import { AgriRiskPredictResponse } from '../../interfaces/AgriRiskRes';
import { AutoWeatherStation } from '../../interfaces/AutoWeatherStationRes';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// 註冊 Chart.js 所有元件
Chart.register(...registerables);

type ChartPeriod = 'today' | 'week' | 'month';

interface CropOption {
  CropCode: string;
  CropName: string;
}

interface MarketOption {
  MarketCode: string;
  MarketName: string;
}

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, FormsModule, Select, DecimalPipe],
  templateUrl: './market.html',
  styleUrl: './market.scss'
})
export class Market implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private dataService = inject(DataService);
  private configService = inject(ConfigService);
  private chart: Chart | null = null;

  // 狀態管理
  loading = true;
  error: string | null = null;
  selectedPeriod: ChartPeriod = 'today';

  // 作物選單相關
  allCrops: CropOption[] = [];
  selectedCropCode: string | null = null;
  allResponseData: AgriProduct[] = [];

  // 市場選單相關
  availableMarkets: MarketOption[] = [];
  selectedMarketCode: string | null = null;
  ALL_MARKETS_CODE = 'ALL'; // 特殊值：代表所有市場

  // 資料
  currentCrop: AgriProduct | null = null;
  todayData: AgriProduct[] = [];
  weekData: AgriProduct[] = [];
  monthData: AgriProduct[] = [];

  // 價格預測相關
  riskPrediction: AgriRiskPredictResponse | null = null;
  riskLoading = false;
  riskError: string | null = null;
  weatherStation: AutoWeatherStation | null = null;

  ngOnInit(): void {
    this.loadData();
    this.loadWeatherData();
  }

  ngAfterViewInit(): void {
    // 在視圖初始化後創建圖表
    setTimeout(() => {
      if (this.todayData.length > 0) {
        this.createChart();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    // 清理圖表實例
    if (this.chart) {
      this.chart.destroy();
    }
  }

  /**
   * 載入資料
   */
  loadData(): void {
    this.loading = true;
    this.error = null;

    console.log('嘗試取得最新農產品資料...');

    this.dataService.getAgriProductsTransType().subscribe({
      next: (response) => {
        console.log('API 回應:', response);
        console.log('資料筆數:', response.Data?.length || 0);

        if (response.Data && response.Data.length > 0) {
          // 儲存所有資料
          this.allResponseData = response.Data;

          // 提取所有不重複的作物
          const cropMap = new Map<string, CropOption>();
          response.Data.forEach(item => {
            if (!cropMap.has(item.CropCode)) {
              cropMap.set(item.CropCode, {
                CropCode: item.CropCode,
                CropName: item.CropName
              });
            }
          });
          this.allCrops = Array.from(cropMap.values());

          console.log('可用作物數量:', this.allCrops.length);
          console.log('作物列表:', this.allCrops.map(c => c.CropName).join(', '));

          // 預設選擇第一個作物
          if (this.allCrops.length > 0) {
            this.selectedCropCode = this.allCrops[0].CropCode;
            // 更新可用市場列表
            this.updateAvailableMarkets(this.selectedCropCode);
            // 更新圖表資料（使用預設的「所有市場」）
            this.updateChartData(this.selectedCropCode, this.ALL_MARKETS_CODE);
          }

          this.loading = false;
        } else {
          console.error('API 回應無資料');
          const dayOfWeek = new Date().getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

          if (isWeekend) {
            this.error = '週末無交易資料。農產品批發市場通常在週末休市，請於工作日查詢。';
          } else {
            this.error = '目前無法取得農產品資料，可能是假日或尚未更新。請稍後再試或聯繫管理員。';
          }
          this.loading = false;
        }
      },
    });
  }

  /**
   * 處理資料：按日期分組並計算平均值
   */
  private processDataByDate(data: AgriProduct[]): AgriProduct[] {
    const dateMap = new Map<string, AgriProduct[]>();

    // 按日期分組
    data.forEach(item => {
      const date = item.TransDate;
      if (!dateMap.has(date)) {
        dateMap.set(date, []);
      }
      dateMap.get(date)!.push(item);
    });

    // 計算每日平均值
    const result: AgriProduct[] = [];
    dateMap.forEach((items) => {
      const avgData: AgriProduct = {
        ...items[0],
        Upper_Price: this.average(items.map(i => i.Upper_Price)),
        Middle_Price: this.average(items.map(i => i.Middle_Price)),
        Lower_Price: this.average(items.map(i => i.Lower_Price)),
        Avg_Price: this.average(items.map(i => i.Avg_Price)),
        Trans_Quantity: items.reduce((sum, i) => sum + i.Trans_Quantity, 0)
      };
      result.push(avgData);
    });

    // 按日期排序
    return result.sort((a, b) => a.TransDate.localeCompare(b.TransDate));
  }

  /**
   * 計算平均值
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return Math.round(numbers.reduce((sum, n) => sum + n, 0) / numbers.length * 100) / 100;
  }

  /**
   * 更新可用市場列表（根據選擇的作物）
   */
  updateAvailableMarkets(cropCode: string): void {
    console.log('更新可用市場列表，作物代碼:', cropCode);

    // 篩選該作物的所有資料
    const allCropData = this.allResponseData.filter(item => item.CropCode === cropCode);

    if (allCropData.length === 0) {
      this.availableMarkets = [];
      return;
    }

    // 提取該作物的所有不重複市場
    const marketMap = new Map<string, MarketOption>();
    allCropData.forEach(item => {
      if (!marketMap.has(item.MarketCode)) {
        marketMap.set(item.MarketCode, {
          MarketCode: item.MarketCode,
          MarketName: item.MarketName
        });
      }
    });

    // 加入「所有市場」選項
    this.availableMarkets = [
      { MarketCode: this.ALL_MARKETS_CODE, MarketName: '所有市場（平均）' },
      ...Array.from(marketMap.values())
    ];

    console.log('可用市場數量:', this.availableMarkets.length - 1); // 扣除「所有市場」
    console.log('市場列表:', this.availableMarkets.map(m => m.MarketName).join(', '));

    // 預設選擇「所有市場」
    this.selectedMarketCode = this.ALL_MARKETS_CODE;
  }

  /**
   * 更新圖表資料（根據選擇的作物和市場）
   */
  updateChartData(cropCode: string, marketCode: string): void {
    console.log('更新圖表資料，作物代碼:', cropCode, '市場代碼:', marketCode);

    // 篩選該作物的所有資料
    let allCropData = this.allResponseData.filter(item => item.CropCode === cropCode);

    // 如果選擇特定市場，進一步篩選
    if (marketCode !== this.ALL_MARKETS_CODE) {
      allCropData = allCropData.filter(item => item.MarketCode === marketCode);
      console.log('篩選後的市場資料筆數:', allCropData.length);
    } else {
      console.log('顯示所有市場資料，筆數:', allCropData.length);
    }

    if (allCropData.length === 0) {
      console.error('找不到該作物的資料');
      return;
    }

    // 取得所有可用的日期並排序
    const allDates = [...new Set(allCropData.map(item => item.TransDate))].sort();
    console.log('可用的交易日期:', allDates);

    // 找出最新的交易日期
    const latestDate = allDates[allDates.length - 1];
    console.log('最新交易日期:', latestDate);

    // 使用最新日期的資料作為「今日」資料
    this.todayData = allCropData.filter(item => item.TransDate === latestDate);
    this.currentCrop = this.todayData[0];

    // 限制月資料為最近 30 天
    const monthDate = new Date();
    monthDate.setDate(monthDate.getDate() - 30);
    const monthCropData = allCropData.filter(item =>
      new Date(item.TransDate) >= monthDate
    );
    this.monthData = this.processDataByDate(monthCropData);

    // 取得最近 7 天的資料
    const weekDate = new Date();
    weekDate.setDate(weekDate.getDate() - 7);
    const weekCropData = allCropData.filter(item =>
      new Date(item.TransDate) >= weekDate
    );
    this.weekData = this.processDataByDate(weekCropData);

    console.log('資料統計:', {
      今日資料筆數: this.todayData.length,
      一週資料筆數: this.weekData.length,
      一月資料筆數: this.monthData.length
    });

    // 重新繪製圖表
    setTimeout(() => this.createChart(), 100);
  }

  /**
   * 作物選單變更事件
   */
  onCropChange(cropCode: string): void {
    console.log('使用者選擇作物:', cropCode);

    // 更新可用市場列表
    this.updateAvailableMarkets(cropCode);

    // 更新圖表資料（使用預設的「所有市場」）
    this.updateChartData(cropCode, this.selectedMarketCode!);

    // 自動觸發價格預測
    this.callAgriRiskAPI();
  }

  /**
   * 市場選單變更事件
   */
  onMarketChange(marketCode: string): void {
    console.log('使用者選擇市場:', marketCode);

    // 更新圖表資料
    if (this.selectedCropCode) {
      this.updateChartData(this.selectedCropCode, marketCode);
    }

    // 自動觸發價格預測
    this.callAgriRiskAPI();
  }

  /**
   * 切換圖表週期
   */
  switchPeriod(period: ChartPeriod): void {
    this.selectedPeriod = period;
    this.createChart();
  }

  /**
   * 創建圖表
   */
  private createChart(): void {
    if (!this.chartCanvas) return;

    // 銷毀舊圖表
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    let config: ChartConfiguration;

    switch (this.selectedPeriod) {
      case 'today':
        config = this.getTodayChartConfig();
        break;
      case 'week':
        config = this.getWeekChartConfig();
        break;
      case 'month':
        config = this.getMonthChartConfig();
        break;
    }

    this.chart = new Chart(ctx, config);
  }

  /**
   * 今日圖表配置
   */
  private getTodayChartConfig(): ChartConfiguration {
    const labels = this.todayData.map(item => item.MarketName || '市場');

    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '上價 (元/公斤)',
            data: this.todayData.map(item => item.Upper_Price),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4
          },
          {
            label: '平均價 (元/公斤)',
            data: this.todayData.map(item => item.Avg_Price),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          },
          {
            label: '中價 (元/公斤)',
            data: this.todayData.map(item => item.Middle_Price),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4
          },
          {
            label: '下價 (元/公斤)',
            data: this.todayData.map(item => item.Lower_Price),
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '今日各市場價格分布',
            font: { size: 16 }
          },
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '價格 (元/公斤)'
            }
          }
        }
      }
    };
  }

  /**
   * 一週圖表配置
   */
  private getWeekChartConfig(): ChartConfiguration {
    const labels = this.weekData.map(item => {
      const date = new Date(item.TransDate);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '最高價 (元/公斤)',
            data: this.weekData.map(item => item.Upper_Price),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: false,
            tension: 0.4
          },
          {
            label: '平均價 (元/公斤)',
            data: this.weekData.map(item => item.Avg_Price),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true,
            tension: 0.4
          },
          {
            label: '最低價 (元/公斤)',
            data: this.weekData.map(item => item.Lower_Price),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: false,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '近七日價格趨勢',
            font: { size: 16 }
          },
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '價格 (元/公斤)'
            }
          },
          x: {
            title: {
              display: true,
              text: '日期'
            }
          }
        }
      }
    };
  }

  /**
   * 一個月圖表配置
   */
  private getMonthChartConfig(): ChartConfiguration {
    const labels = this.monthData.map(item => {
      const date = new Date(item.TransDate);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    return {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '平均價 (元/公斤)',
            data: this.monthData.map(item => item.Avg_Price),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '近三十日價格趨勢',
            font: { size: 16 }
          },
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              afterLabel: (context) => {
                const dataIndex = context.dataIndex;
                const quantity = this.monthData[dataIndex]?.Trans_Quantity || 0;
                return `交易量: ${quantity.toLocaleString()} 公斤`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '價格 (元/公斤)'
            }
          },
          x: {
            title: {
              display: true,
              text: '日期'
            }
          }
        }
      }
    };
  }

  /**
   * 載入氣象資料
   */
  loadWeatherData(): void {
    this.dataService.getMockWeatherStation().Data.forEach(station => {
      if (this.weatherStation === null) {
        this.weatherStation = station;
      }
    });
  }

  /**
   * 呼叫價格預測 API
   */
  callAgriRiskAPI(): void {
    // 檢查必要條件
    if (!this.weatherStation) {
      console.warn('氣象資料尚未載入');
      return;
    }

    if (!this.selectedCropCode || !this.currentCrop) {
      console.warn('請先選擇作物');
      return;
    }

    this.riskLoading = true;
    this.riskError = null;

    // 取得選中的作物和市場資訊
    const selectedCrop = this.allCrops.find(c => c.CropCode === this.selectedCropCode);
    const selectedMarket = this.availableMarkets.find(m => m.MarketCode === this.selectedMarketCode);

    if (!selectedCrop) {
      console.error('找不到選中的作物資訊');
      this.riskLoading = false;
      return;
    }

    const cropName = selectedCrop.CropName;
    const cropCode = selectedCrop.CropCode;
    const marketName = selectedMarket?.MarketName || '台北市場';

    // 使用當前作物的歷史價格資料
    const historicalPrice = {
      upper: this.currentCrop.Upper_Price,
      middle: this.currentCrop.Middle_Price,
      lower: this.currentCrop.Lower_Price,
      quantity: this.currentCrop.Trans_Quantity
    };

    // 建立預測特徵
    const features = this.dataService.buildAgriRiskFeatures(
      this.weatherStation,
      cropName,
      cropCode,
      marketName,
      historicalPrice
    );

    console.log('預測特徵資料:', features);

    // 呼叫 Cloud Run 代理 API
    this.configService.predictAgriRisk(features).subscribe({
      next: (response) => {
        console.log('預測成功:', response);
        this.riskPrediction = response;
        this.riskLoading = false;
      },
      error: (error) => {
        console.error('預測失敗:', error);
        this.riskLoading = false;
        this.riskError = '價格預測失敗，請稍後再試';
      }
    });
  }
}
