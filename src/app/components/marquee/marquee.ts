import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data-service';
import { PlantDatum } from '../../interfaces/PlantEpidemicTypeRes';

@Component({
  selector: 'app-marquee',
  imports: [CommonModule],
  templateUrl: './marquee.html',
  styleUrl: './marquee.scss'
})
export class Marquee implements OnInit {
  private dataService = inject(DataService);

  marqueeItems: string[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadPlantEpidemicData();
  }

  loadPlantEpidemicData() {
    this.dataService.getPlantEpidemicType().subscribe({
      next: (res) => {
        if (res.RS === 'OK' && res.Data) {
          // 將植物疫情資料轉換為跑馬燈訊息
          this.marqueeItems = res.Data.map((item: PlantDatum) => {
            const plantName = item.PlantName || '';
            const truncatedName = plantName.length > 20
              ? plantName.slice(0, 20) + '...'
              : plantName;
            return `🌱 ${item.City}  ${truncatedName}：${item.Subject}`;
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('載入植物疫情資料失敗', err);
        // 發生錯誤時使用預設訊息
        this.marqueeItems = [
          '🌱 農事提醒：請關注最新農業資訊',
          '📢 系統提示：資料載入中，請稍後重試'
        ];
        this.isLoading = false;
      }
    });
  }
}
