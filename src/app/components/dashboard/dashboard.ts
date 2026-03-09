import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Marquee } from '../marquee/marquee';
import { Market } from '../market/market';
import { Spray } from '../spray/spray';
import { Journal } from '../journal/journal';
import { DialogService } from '../../services/dialog.service';
import { TaiwanMap } from '../taiwan-map/taiwan-map';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    Marquee,
    TaiwanMap,
    Market,
    Spray,
    Journal
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private dialogService = inject(DialogService);

  // 測試錯誤彈窗
  testErrorDialog() {
    this.dialogService.showError(
      '這是一個測試錯誤訊息，用來展示錯誤彈窗的效果',
      '測試錯誤彈窗'
    );
  }

  // 測試成功彈窗
  testSuccessDialog() {
    this.dialogService.showSuccess(
      '共用彈窗系統運作正常！',
      '測試成功',
      '你可以在任何元件中使用 DialogService 來顯示彈窗'
    );
  }

  // 測試包含錯誤代碼的彈窗
  testErrorWithCode() {
    this.dialogService.showError(
      '無法連線到氣象資料伺服器',
      '資料載入失敗',
      'WEATHER_API_001'
    );
  }
}
