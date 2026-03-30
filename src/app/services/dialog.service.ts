import { Injectable, inject } from '@angular/core';
import { DialogService as PrimeDialogService } from 'primeng/dynamicdialog';
import { ErrorDialogComponent, ErrorDialogData } from '../core/dialog/error-dialog/error-dialog.component';
import { SuccessDialogComponent, SuccessDialogData } from '../core/dialog/success-dialog/success-dialog.component';
import { JournalEditDialogComponent, JournalEditDialogData } from '../core/dialog/journal-edit-dialog/journal-edit-dialog.component';
import { CountyInfoDialogComponent, CountyInfoDialogData } from '../core/dialog/county-info-dialog/county-info-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../core/dialog/confirm-dialog/confirm-dialog.component';

/**
 * 共用彈窗服務
 * 提供統一的錯誤/成功彈窗顯示方法
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private primeDialogService = inject(PrimeDialogService);

  /**
   * 顯示錯誤彈窗
   * @param message 錯誤訊息
   * @param title 標題（選用，預設：發生錯誤）
   * @param errorCode 錯誤代碼（選用）
   * @returns DynamicDialogRef
   *
   * @example
   * this.dialogService.showError('資料載入失敗');
   * this.dialogService.showError('無法連線到伺服器', '網路錯誤', 'ERR_NETWORK');
   */
  showError(message: string, title?: string, errorCode?: string) {
    const data: ErrorDialogData = {
      message,
      title,
      errorCode
    };

    return this.primeDialogService.open(ErrorDialogComponent, {
      data,
      header: ' ', // 空白標題（使用元件內的標題）
      modal: true,
      dismissableMask: true, // 點擊遮罩關閉
      closable: false, // 不顯示右上角 X
      styleClass: 'dialog-custom',
      baseZIndex: 10000,
      width: 'auto',
      breakpoints: {
        '960px': '90vw',
        '640px': '95vw'
      }
    });
  }

  /**
   * 顯示成功彈窗
   * @param message 成功訊息
   * @param title 標題（選用，預設：操作成功）
   * @param actionHint 操作提示（選用）
   * @returns DynamicDialogRef
   *
   * @example
   * this.dialogService.showSuccess('資料已成功儲存');
   * this.dialogService.showSuccess('新增成功', '完成', '可至列表查看新增的項目');
   */
  showSuccess(message: string, title?: string, actionHint?: string) {
    const data: SuccessDialogData = {
      message,
      title,
      actionHint
    };

    return this.primeDialogService.open(SuccessDialogComponent, {
      data,
      header: ' ', // 空白標題（使用元件內的標題）
      modal: true,
      dismissableMask: true, // 點擊遮罩關閉
      closable: false, // 不顯示右上角 X
      styleClass: 'dialog-custom',
      baseZIndex: 10000,
      width: 'auto',
      breakpoints: {
        '960px': '90vw',
        '640px': '95vw'
      }
    });
  }

  /**
   * 處理 HTTP 錯誤並顯示錯誤彈窗
   * @param error HTTP 錯誤物件
   * @param customMessage 自訂錯誤訊息（選用）
   *
   * @example
   * this.http.get(url).subscribe({
   *   error: (err) => this.dialogService.handleHttpError(err)
   * });
   */
  handleHttpError(error: any, customMessage?: string) {
    let message = customMessage || '系統發生錯誤，請稍後再試。';
    let errorCode: string | undefined;

    if (error?.status) {
      errorCode = `HTTP ${error.status}`;

      // 根據 HTTP 狀態碼提供更友善的訊息
      switch (error.status) {
        case 400:
          message = '請求格式錯誤，請檢查輸入資料。';
          break;
        case 401:
          message = '未授權，請重新登入。';
          break;
        case 403:
          message = '權限不足，無法執行此操作。';
          break;
        case 404:
          message = '找不到請求的資源。';
          break;
        case 500:
          message = '伺服器錯誤，請稍後再試。';
          break;
        case 503:
          message = '服務暫時無法使用，請稍後再試。';
          break;
        default:
          if (error.status >= 500) {
            message = '伺服器發生錯誤，請稍後再試。';
          } else if (error.status >= 400) {
            message = '請求失敗，請檢查輸入資料。';
          }
      }
    } else if (error?.message) {
      // 網路錯誤或其他錯誤
      if (error.message.includes('Network') || error.message.includes('network')) {
        message = '網路連線失敗，請檢查網路設定。';
        errorCode = 'ERR_NETWORK';
      }
    }

    return this.showError(message, '發生錯誤', errorCode);
  }

  /**
   * 顯示農務日誌編輯彈窗
   * @param data 彈窗資料（模式、預設類型、編輯資料）
   * @returns DynamicDialogRef
   *
   * @example
   * // 新增模式（從快速按鈕）
   * const ref = this.dialogService.showJournalEdit({
   *   mode: 'create',
   *   presetType: JournalType.PESTICIDE
   * });
   *
   * // 編輯模式
   * const ref = this.dialogService.showJournalEdit({
   *   mode: 'edit',
   *   entry: existingEntry
   * });
   *
   * // 監聽關閉事件
   * ref.onClose.subscribe((result) => {
   *   if (result) {
   *     console.log('儲存的資料:', result);
   *   }
   * });
   */
  showJournalEdit(data?: JournalEditDialogData) {
    return this.primeDialogService.open(JournalEditDialogComponent, {
      data,
      header: data?.mode === 'edit' ? '編輯農務紀錄' : '新增農務紀錄',
      modal: true,
      dismissableMask: false, // 防止誤觸關閉
      closable: true,
      styleClass: 'journal-edit-dialog-wrapper',
      baseZIndex: 10000,
      width: '600px',
      breakpoints: {
        '960px': '90vw',
        '640px': '95vw'
      }
    });
  }

  /**
   * 顯示縣市氣象資訊彈窗
   * @param data 縣市資料（id, name, weatherData?）
   * @returns DynamicDialogRef
   *
   * @example
   * this.dialogService.showCountyInfo({
   *   id: '臺北市',
   *   name: '台北市',
   *   weatherData: {
   *     countyName: '臺北市',
   *     citySn: 1,
   *     stationCount: 5,
   *     avgTemp: 25.3,
   *     avgHumd: 0.75,
   *     avgPres: 1013.2,
   *     avgSun: 6.5,
   *     avgRainfall: 2.3,
   *     avgSoilMoisture: 65,
   *     lastUpdateTime: '2026-03-08 12:00:00'
   *   }
   * });
   */
  showCountyInfo(data: CountyInfoDialogData) {
    return this.primeDialogService.open(CountyInfoDialogComponent, {
      data,
      header: ' ', // 空白標題（使用元件內的標題）
      modal: true,
      dismissableMask: true, // 點擊遮罩關閉
      closable: false, // 不顯示右上角 X
      styleClass: 'dialog-custom county-weather-dialog',
      baseZIndex: 10000,
      width: '650px',
      breakpoints: {
        '960px': '85vw',
        '640px': '95vw'
      }
    });
  }
  /**
   * 顯示確認彈窗
   * @param message 確認訊息
   * @param title 標題（選用，預設：確認操作）
   * @returns DynamicDialogRef
   */
  showConfirm(message: string, title?: string) {
    const data: ConfirmDialogData = {
      message,
      title
    };

    return this.primeDialogService.open(ConfirmDialogComponent, {
      data,
      header: ' ', // 空白標題
      modal: true,
      dismissableMask: false,
      closable: false,
      styleClass: 'dialog-custom confirm-dialog-wrapper',
      baseZIndex: 11000, // 高於一般彈窗
      width: 'auto',
      breakpoints: {
        '960px': '80vw',
        '640px': '90vw'
      }
    });
  }
}
