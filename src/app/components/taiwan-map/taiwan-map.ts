import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, Output, EventEmitter, PLATFORM_ID, Inject, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DialogService } from '../../services/dialog.service';
import { DataService } from '../../services/data-service';
import { CountyWeatherData } from '../../interfaces/CountyWeatherData';
import { AutoWeatherStation } from '../../interfaces/AutoWeatherStationRes';
import { WeatherType } from '../../interfaces/PesticideTypeRes';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

interface TaiwanCounty {
  id: string;
  name: string;
  population: string;
  description: string;
}

interface TopoJsonData {
  type: string;
  objects: any;
  arcs: any[];
}

@Component({
  selector: 'taiwan-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './taiwan-map.html',
  styleUrls: ['./taiwan-map.scss']
})
export class TaiwanMap implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @Output() countySelected = new EventEmitter<TaiwanCounty>();

  isMapReady = false;
  isLoading = true;
  private isInitialized = false;
  private svg: any;
  private g: any;
  private projection: any;
  private path: any;
  private zoom: any;
  private dialogService = inject(DialogService);
  private dataService = inject(DataService);

  // 縣市天氣資料 Map (key: 縣市名稱, value: CountyWeatherData)
  private countyWeatherMap: Map<string, CountyWeatherData> = new Map();

  counties: TaiwanCounty[] = [
    { id: '臺北市', name: '台北市', population: '約260萬人', description: '首都，政治經濟中心' },
    { id: '新北市', name: '新北市', population: '約400萬人', description: '人口最多的直轄市' },
    { id: '基隆市', name: '基隆市', population: '約37萬人', description: '北部重要港口' },
    { id: '桃園市', name: '桃園市', population: '約230萬人', description: '國際機場所在地' },
    { id: '新竹市', name: '新竹市', population: '約45萬人', description: '科技城' },
    { id: '新竹縣', name: '新竹縣', population: '約58萬人', description: '科技重鎮' },
    { id: '苗栗縣', name: '苗栗縣', population: '約55萬人', description: '客家文化重鎮' },
    { id: '臺中市', name: '台中市', population: '約280萬人', description: '中部最大城市' },
    { id: '彰化縣', name: '彰化縣', population: '約128萬人', description: '花卉王國' },
    { id: '南投縣', name: '南投縣', population: '約50萬人', description: '台灣地理中心' },
    { id: '雲林縣', name: '雲林縣', population: '約69萬人', description: '農業首都' },
    { id: '嘉義市', name: '嘉義市', population: '約27萬人', description: '阿里山門戶' },
    { id: '嘉義縣', name: '嘉義縣', population: '約51萬人', description: '阿里山故鄉' },
    { id: '臺南市', name: '台南市', population: '約190萬人', description: '古都，文化之城' },
    { id: '高雄市', name: '高雄市', population: '約275萬人', description: '南部最大港都' },
    { id: '屏東縣', name: '屏東縣', population: '約82萬人', description: '熱帶風情' },
    { id: '宜蘭縣', name: '宜蘭縣', population: '約46萬人', description: '好山好水' },
    { id: '花蓮縣', name: '花蓮縣', population: '約33萬人', description: '太魯閣國家公園' },
    { id: '臺東縣', name: '台東縣', population: '約22萬人', description: '後山淨土' },
    { id: '澎湖縣', name: '澎湖縣', population: '約10萬人', description: '海上樂園' },
    { id: '金門縣', name: '金門縣', population: '約14萬人', description: '戰地風情' },
    { id: '連江縣', name: '連江縣', population: '約1.3萬人', description: '馬祖列島' }
  ];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // 載入氣象資料
    this.loadWeatherData();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Ensure DOM is ready before initializing map
      setTimeout(() => {
        this.isMapReady = true;
        this.initializeMap();
      }, 200);
    }
  }

  private initializeMap(): void {
    if (this.isInitialized) {
      return; // Prevent double initialization
    }

    if (this.mapContainer && this.mapContainer.nativeElement) {
      this.isInitialized = true;
      this.loadMapData();
    } else {
      // Retry if container is not ready
      setTimeout(() => this.initializeMap(), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.svg) {
      this.svg.remove();
    }
    this.isInitialized = false;
    this.isMapReady = false;
    this.isLoading = true;
  }

  private loadMapData(): void {
    // Clear any existing map before loading new one
    if (this.svg) {
      this.svg.remove();
      this.svg = null;
    }

    this.http.get<TopoJsonData>('COUNTY_MOI_1140318.json').subscribe({
      next: (data) => {
        this.initMap(data);
      },
      error: (error) => {
        console.error('Error loading map data:', error);
        this.isLoading = false;
        // Retry after 2 seconds
        setTimeout(() => {
          this.isLoading = true;
          this.loadMapData();
        }, 2000);
      }
    });
  }

  private initMap(topoData: TopoJsonData): void {
    const container = this.mapContainer.nativeElement;
    if (!container) {
      console.error('Map container not found');
      return;
    }

    const width = 800;
    const height = 600;

    // Create SVG
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`);

    this.g = this.svg.append('g');

    // Convert TopoJSON to GeoJSON
    const geojson = topojson.feature(topoData as any, topoData.objects.COUNTY_MOI_1140318) as any;

    // Create projection centered on Taiwan
    this.projection = d3.geoMercator()
      .center([121, 23.8]) // Taiwan center coordinates
      .scale(6000) // Zoom level for Taiwan
      .translate([width / 2, height / 2]);

    this.path = d3.geoPath().projection(this.projection);

    // Create zoom behavior
    this.zoom = d3.zoom()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    // Draw counties
    this.g.selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', this.path)
      .attr('class', 'county')
      .attr('fill', (d: any) => {
        const countyName = d.properties.COUNTYNAME;
        return this.getCountyColor(countyName);
      })
      .attr('stroke', '#2D5A27') // primary-500 森林深綠
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('filter', 'drop-shadow(0 1px 2px rgba(45, 90, 39, 0.1))')
      .on('mouseover', (event: any, d: any) => {
        this.onCountyHover(event, d);
      })
      .on('mouseout', (event: any) => {
        this.onCountyMouseOut(event);
      })
      .on('mouseleave', (event: any) => {
        this.onCountyMouseOut(event);
      })
      .on('click', (_event: any, d: any) => {
        this.onCountyClick(d);
      });

    // Add county labels - 農業風格字體
    this.g.selectAll('text')
      .data(geojson.features)
      .enter()
      .append('text')
      .attr('x', (d: any) => this.path.centroid(d)[0])
      .attr('y', (d: any) => this.path.centroid(d)[1])
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('class', 'county-label')
      .style('font-family', 'Microsoft JhengHei, Noto Sans TC, Arial, sans-serif')
      .style('font-size', '9px')
      .style('font-weight', '600')
      .style('fill', '#353935') // text-500 石墨深灰
      .style('pointer-events', 'none')
      .text((d: any) => d.properties.COUNTYNAME.replace('臺', '台'));

    // Add zoom controls
    this.addZoomControls();

    // Map initialization complete
    this.isLoading = false;
  }

  /**
   * 取得縣市顏色 - 使用農業 IoT 配色系統
   * 直轄市使用森林深綠 (Primary)
   * 縣市使用鼠尾草綠 (Secondary)
   */
  private getCountyColor(countyName: string): string {
    // 直轄市：森林深綠漸層
    const majorCities = ['臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市'];
    if (majorCities.includes(countyName)) {
      return '#479737'; // primary-400 (較亮的綠色)
    }
    // 縣：鼠尾草綠
    return '#8B9D77'; // secondary-500
  }

  /**
   * 縣市 Hover 事件 - 農業風格互動
   */
  private onCountyHover(event: any, d: any): void {
    // Remove any existing tooltips first
    d3.selectAll('.map-tooltip').remove();

    const county = event.target;
    // Hover 時使用麥稈焦糖色 (accent-500)
    d3.select(county)
      .attr('fill', '#D4A373') // accent-500
      .attr('stroke', '#2D5A27') // primary-500
      .attr('stroke-width', 2.5);

    // Show tooltip with agriculture style
    d3.select('body')
      .append('div')
      .attr('class', 'map-tooltip')
      .style('position', 'absolute')
      .style('background', 'linear-gradient(135deg, #2D5A27 0%, #24481F 100%)')
      .style('color', '#FCFAF8') // beige-100
      .style('padding', '10px 14px')
      .style('border-radius', '8px')
      .style('font-size', '13px')
      .style('font-weight', '500')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('border', '1px solid #479737') // primary-400
      .style('letter-spacing', '0.025em')
      .html(d.properties.COUNTYNAME)
      .style('left', (event.pageX + 12) + 'px')
      .style('top', (event.pageY - 12) + 'px');
  }

  private onCountyMouseOut(event?: any): void {
    if (event && event.target) {
      // Reset only the specific county that was hovered
      const county = event.target;
      const d = d3.select(county).datum() as any;
      d3.select(county)
        .attr('fill', this.getCountyColor(d.properties.COUNTYNAME))
        .attr('stroke-width', 0.8);
    } else {
      // Fallback: reset all counties
      d3.selectAll('.county')
        .attr('fill', (d: any) => this.getCountyColor(d.properties.COUNTYNAME))
        .attr('stroke-width', 0.8);
    }

    // Remove all tooltips
    d3.selectAll('.map-tooltip').remove();
    d3.select('body').selectAll('.map-tooltip').remove();
  }

  /**
   * 縣市點擊事件 - 顯示彈窗並縮放至該縣市
   */
  private onCountyClick(d: any): void {
    const countyName = d.properties.COUNTYNAME;
    const county = this.counties.find(c => c.id === countyName);

    if (county) {
      // 取得該縣市的氣象資料
      const weatherData = this.countyWeatherMap.get(countyName);

      // 顯示縣市氣象資訊彈窗
      this.dialogService.showCountyInfo({
        id: county.id,
        name: county.name,
        weatherData: weatherData
      });

      // 發送事件給父組件（如果需要）
      this.countySelected.emit(county);
    }

    // Zoom to county
    const bounds = this.path.bounds(d);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.min(8, 0.9 / Math.max(dx / 800, dy / 600));
    const translate = [800 / 2 - scale * x, 600 / 2 - scale * y];

    this.svg.transition()
      .duration(750)
      .call(
        this.zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
  }

  /**
   * 添加縮放控制按鈕 - 農業風格設計
   */
  private addZoomControls(): void {
    const controls = this.svg.append('g')
      .attr('class', 'zoom-controls')
      .attr('transform', 'translate(20, 20)');

    // Zoom in button - 放大
    const zoomInGroup = controls.append('g')
      .attr('class', 'zoom-control zoom-in')
      .style('cursor', 'pointer')
      .on('click', () => this.zoomIn());

    zoomInGroup.append('rect')
      .attr('width', 36)
      .attr('height', 36)
      .attr('fill', '#FFFFFF')
      .attr('stroke', '#8B9D77') // secondary-500
      .attr('stroke-width', 2)
      .attr('rx', 6);

    zoomInGroup.append('text')
      .attr('x', 18)
      .attr('y', 23)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('fill', '#2D5A27') // primary-500
      .text('+');

    // Zoom out button - 縮小
    const zoomOutGroup = controls.append('g')
      .attr('class', 'zoom-control zoom-out')
      .attr('transform', 'translate(0, 42)')
      .style('cursor', 'pointer')
      .on('click', () => this.zoomOut());

    zoomOutGroup.append('rect')
      .attr('width', 36)
      .attr('height', 36)
      .attr('fill', '#FFFFFF')
      .attr('stroke', '#8B9D77') // secondary-500
      .attr('stroke-width', 2)
      .attr('rx', 6);

    zoomOutGroup.append('text')
      .attr('x', 18)
      .attr('y', 23)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('fill', '#2D5A27') // primary-500
      .text('−');

    // Reset zoom button - 重置
    const resetGroup = controls.append('g')
      .attr('class', 'zoom-control zoom-reset')
      .attr('transform', 'translate(0, 84)')
      .style('cursor', 'pointer')
      .on('click', () => this.resetZoom());

    resetGroup.append('rect')
      .attr('width', 36)
      .attr('height', 36)
      .attr('fill', '#FFFFFF')
      .attr('stroke', '#8B9D77') // secondary-500
      .attr('stroke-width', 2)
      .attr('rx', 6);

    resetGroup.append('text')
      .attr('x', 18)
      .attr('y', 23)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#2D5A27') // primary-500
      .text('⌂');
  }

  private zoomIn(): void {
    this.svg.transition().duration(300).call(
      this.zoom.scaleBy, 1.5
    );
  }

  private zoomOut(): void {
    this.svg.transition().duration(300).call(
      this.zoom.scaleBy, 1 / 1.5
    );
  }

  private resetZoom(): void {
    this.svg.transition().duration(500).call(
      this.zoom.transform,
      d3.zoomIdentity
    );
  }

  public getCountyInfo(countyId: string): TaiwanCounty | undefined {
    return this.counties.find(c => c.id === countyId);
  }

  /**
   * 載入氣象測站資料並計算各縣市平均值
   */
  private loadWeatherData(): void {
    this.dataService.getWeather().subscribe({
      next: (response) => {
        if (response.Data && response.Data.length > 0) {
          // 將 WeatherType 轉換為 AutoWeatherStation 格式
          const convertedData = this.convertWeatherTypeToAutoWeatherStation(response.Data);
          this.calculateCountyWeatherAverages(convertedData);
        }
      },
      error: (error) => {
        console.error('載入氣象資料失敗:', error);
        // 使用 Mock 資料作為備援
        const mockData = this.dataService.getMockWeatherStation();
        if (mockData.Data && mockData.Data.length > 0) {
          this.calculateCountyWeatherAverages(mockData.Data);
        }
      }
    });
  }

  /**
   * 將 WeatherType (字串欄位) 轉換為 AutoWeatherStation (數值欄位)
   */
  private convertWeatherTypeToAutoWeatherStation(weatherData: WeatherType[]): AutoWeatherStation[] {
    return weatherData.map(w => {
      const converted: Omit<AutoWeatherStation, 'VIRTUAL_SOIL_HUMD'> = {
        Start_time: '', // WeatherType 沒有這個欄位
        End_time: '',   // WeatherType 沒有這個欄位
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
   * 計算各縣市的氣象平均值
   * @param stations 所有測站資料
   */
  private calculateCountyWeatherAverages(stations: AutoWeatherStation[]): void {
    // 按縣市分組
    const countyGroups = new Map<string, AutoWeatherStation[]>();

    stations.forEach(station => {
      const county = station.CITY;
      if (!countyGroups.has(county)) {
        countyGroups.set(county, []);
      }
      countyGroups.get(county)!.push(station);
    });

    // 計算每個縣市的平均值
    countyGroups.forEach((stationList, countyName) => {
      const avgData: CountyWeatherData = {
        countyName: countyName,
        citySn: stationList[0].CITY_SN,
        stationCount: stationList.length,
        avgTemp: this.calculateAverage(stationList.map(s => s.TEMP)),
        avgHumd: this.calculateAverage(stationList.map(s => s.HUMD)),
        avgPres: this.calculateAverage(stationList.map(s => s.PRES)),
        avgSun: this.calculateAverage(stationList.map(s => s.SUN)),
        avgRainfall: this.calculateAverage(stationList.map(s => s.H_24R)),
        avgSoilMoisture: this.calculateAverage(stationList.map(s => s.VIRTUAL_SOIL_HUMD)),
        lastUpdateTime: stationList[0].TIME
      };

      this.countyWeatherMap.set(countyName, avgData);
    });

    console.log('縣市氣象資料已載入:', this.countyWeatherMap.size, '個縣市');
  }

  /**
   * 計算數值陣列的平均值
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }
}
