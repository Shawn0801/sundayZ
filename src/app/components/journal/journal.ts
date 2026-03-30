import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data-service';
import { DialogService } from '../../services/dialog.service';
import {
  JournalEntry,
  JournalType,
  JournalTypeLabels,
  JournalTypeIcons,
  JournalTypeColors
} from '../../interfaces/JournalEntry';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './journal.html',
  styleUrl: './journal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Journal implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  private dialogService = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);
  private subscription?: Subscription;

  // 日曆選擇的日期
  selectedDate: Date = new Date();

  // 資料
  allEntries: JournalEntry[] = [];

  // 暴露給模板使用
  JournalType = JournalType;
  JournalTypeLabels = JournalTypeLabels;
  JournalTypeIcons = JournalTypeIcons;
  JournalTypeColors = JournalTypeColors;

  ngOnInit(): void {
    console.log('🚀 Journal 元件初始化');

    // 使用 Firestore 即時訂閱（會自動監聽登入狀態變化）
    this.subscription = this.dataService.loadJournalEntries$().subscribe({
      next: (entries) => {
        this.allEntries = entries;

        if (entries.length === 0) {
          console.log('📭 目前沒有日誌資料');
          console.log('💡 請先登入並新增日誌');
        } else {
          console.log('✅ 日誌資料已更新:', entries.length, '筆');
          console.log('📊 資料預覽:', entries.slice(0, 3).map(e => ({
            id: e.id,
            type: e.type,
            date: this.formatDateString(new Date(e.timestamp))
          })));
        }
      },
      error: (error) => {
        console.error('❌ 載入日誌失敗:', error);
        console.error('錯誤詳情:', error.message);
        // 發生錯誤時顯示空陣列
        this.allEntries = [];
      }
    });
  }

  ngOnDestroy(): void {
    // 取消訂閱，避免記憶體洩漏
    this.subscription?.unsubscribe();
  }

  /**
   * 取得有紀錄的日期（用於 Calendar 標記）
   */
  get datesWithEntries(): Date[] {
    return this.allEntries.map(entry => new Date(entry.timestamp));
  }

  /**
   * 取得選定日期的紀錄
   */
  get entriesForSelectedDate(): JournalEntry[] {
    const selectedDateStr = this.formatDateString(this.selectedDate);

    const filtered = this.allEntries.filter(entry => {
      // 防禦性檢查：確保 timestamp 存在且是有效的日期
      if (!entry.timestamp) {
        return false;
      }

      // 確保 timestamp 是 Date 物件
      let entryDate: Date;
      if (entry.timestamp instanceof Date) {
        entryDate = entry.timestamp;
      } else {
        entryDate = new Date(entry.timestamp);
        if (isNaN(entryDate.getTime())) {
          return false;
        }
      }

      const entryDateStr = this.formatDateString(entryDate);
      return entryDateStr === selectedDateStr;
    });


    return filtered;
  }

  /**
   * 取得指定日期的紀錄（用於日曆顯示）
   */
  getEntriesForDate(year: number, month: number, day: number): JournalEntry[] {
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const filtered = this.allEntries.filter(entry => {
      // 防禦性檢查：確保 timestamp 存在且是有效的日期
      if (!entry.timestamp) {
        console.warn('⚠️ 日誌條目缺少 timestamp:', entry);
        return false;
      }

      // 確保 timestamp 是 Date 物件
      let entryDate: Date;
      if (entry.timestamp instanceof Date) {
        entryDate = entry.timestamp;
      } else {
        // 嘗試轉換為 Date
        entryDate = new Date(entry.timestamp);
        if (isNaN(entryDate.getTime())) {
          console.warn('⚠️ 無法轉換 timestamp 為日期:', entry.timestamp);
          return false;
        }
      }

      const entryDateStr = this.formatDateString(entryDate);
      const isMatch = entryDateStr === targetDateStr;

      // 除錯日誌（只在有資料時輸出，避免干擾）
      if (isMatch) {
        console.log('✅ 找到匹配日期的日誌:', {
          target: targetDateStr,
          entry: entryDateStr,
          id: entry.id,
          type: entry.type
        });
      }

      return isMatch;
    });

    return filtered;
  }

  /**
   * 取得最近的 PHI 警示
   */
  get activePesticideEntry(): JournalEntry | null {
    return this.allEntries.find(
      entry => entry.type === JournalType.PESTICIDE && entry.phi_end_date && this.phiRemainingDays > 0
    ) || null;
  }

  /**
   * 計算 PHI 剩餘天數
   */
  get phiRemainingDays(): number {
    const entry = this.allEntries.find(
      entry => entry.type === JournalType.PESTICIDE && entry.phi_end_date
    );

    if (!entry?.phi_end_date) return 0;

    const now = new Date();
    const endDate = new Date(entry.phi_end_date);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  /**
   * 計算 PHI 進度百分比
   */
  get phiProgressPercent(): number {
    if (!this.activePesticideEntry?.phi_days) return 0;

    const totalDays = this.activePesticideEntry.phi_days;
    const remainingDays = this.phiRemainingDays;
    const elapsedDays = totalDays - remainingDays;

    return Math.min(100, (elapsedDays / totalDays) * 100);
  }

  /**
   * 格式化日期為 YYYY-MM-DD
   */
  private formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 格式化時間顯示
   */
  formatTime(timestamp: Date): string {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * 日期選擇改變時
   */
  onDateSelect(): void {
    console.log('選擇日期:', this.formatDateString(this.selectedDate));
  }

  /**
   * 編輯現有日誌
   */
  editJournalEntry(entry: JournalEntry): void {
    console.log('📝 編輯日誌:', entry.id);

    const ref = this.dialogService.showJournalEdit({
      mode: 'edit',
      entry: entry
    });

    ref.onClose.subscribe((result: any) => {
      if (result) {
        if (result.delete === true) {
          // 執行刪除
          this.dataService.deleteJournalEntry$(result.id).subscribe({
            next: () => {
              this.dialogService.showSuccess('該紀錄已成功從系統移除。', '刪除成功');
              this.cdr.markForCheck();
            },
            error: (err) => this.dialogService.showError('無法刪除紀錄，請檢查網路連線。', '刪除失敗')
          });
        } else {
          // 執行更新
          const updatedEntry: JournalEntry = {
            ...result,
            timestamp: result.timestamp instanceof Date ? result.timestamp : new Date(result.timestamp),
            phi_end_date: result.phi_end_date ? (result.phi_end_date instanceof Date ? result.phi_end_date : new Date(result.phi_end_date)) : undefined
          };

          this.dataService.saveJournalEntry$(updatedEntry).subscribe({
            next: () => {
              this.dialogService.showSuccess('日誌紀錄已成功更新。', '儲存成功');
              this.selectedDate = new Date(updatedEntry.timestamp);
              this.cdr.markForCheck();
            },
            error: (err) => this.dialogService.showError('儲存失敗，請稍後再試。', '儲存失敗')
          });
        }
      }
    });
  }

  /**
   * 執行快速操作
   */
  executeQuickAction(type: JournalType): void {
    this.onQuickAction(type);
  }

  private onQuickAction(type: JournalType): void {
    console.log(`快速紀錄：${JournalTypeLabels[type]}`);

    // 開啟編輯彈窗
    const ref = this.dialogService.showJournalEdit({
      mode: 'create',
      presetType: type
    });

    // 監聽彈窗關閉事件
    ref.onClose.subscribe((result: Partial<JournalEntry> | undefined) => {
      if (result) {
        // 建立完整的 JournalEntry
        const newEntry: JournalEntry = {
          ...result,
          id: result.id || `j${Date.now()}`,
          userId: result.userId || 'user001',
          type: result.type!,
          targetCrop: result.targetCrop!,
          timestamp: result.timestamp!
        } as JournalEntry;

        // 儲存到 Firestore
        this.dataService.saveJournalEntry$(newEntry).subscribe({
          next: () => {
            this.dialogService.showSuccess('新的農務日誌已成功建立。', '新增成功');
            // 自動切換到新增日誌的日期
            const entryDate = new Date(newEntry.timestamp);
            this.selectedDate = entryDate;
            this.cdr.markForCheck();
          },
          error: (err) => this.dialogService.showError('無法建立紀錄，請稍後再試。', '新增失敗')
        });
      }
    });
  }
}
