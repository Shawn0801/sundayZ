import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
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
  styleUrl: './journal.scss'
})
export class Journal implements OnInit {
  private dataService = inject(DataService);
  private dialogService = inject(DialogService);

  // 日曆選擇的日期
  selectedDate: Date = new Date();

  // 資料
  allEntries: JournalEntry[] = [];

  // 暴露給模板使用
  JournalTypeLabels = JournalTypeLabels;
  JournalTypeIcons = JournalTypeIcons;
  JournalTypeColors = JournalTypeColors;

  ngOnInit(): void {
    // 先載入 localStorage 儲存的資料
    const savedEntries = this.dataService.loadJournalEntries();

    // 如果有儲存的資料就使用，否則使用 Mock 資料
    if (savedEntries.length > 0) {
      this.allEntries = savedEntries;
    } else {
      this.allEntries = this.dataService.getMockJournalEntries();
    }
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
    return this.allEntries.filter(entry => {
      const entryDateStr = this.formatDateString(new Date(entry.timestamp));
      return entryDateStr === selectedDateStr;
    });
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
   * 快速操作按鈕
   */
  onQuickActionPesticide(): void {
    this.onQuickAction(JournalType.PESTICIDE);
  }

  onQuickActionFertilizer(): void {
    this.onQuickAction(JournalType.FERTILIZER);
  }

  onQuickActionHarvest(): void {
    this.onQuickAction(JournalType.HARVEST);
  }

  onQuickActionObservation(): void {
    this.onQuickAction(JournalType.OBSERVATION);
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
        console.log('新增的日誌資料:', result);

        // 儲存到本地資料
        const newEntry: JournalEntry = {
          ...result,
          id: result.id || `j${Date.now()}`,
          userId: result.userId || 'user001',
          type: result.type!,
          targetCrop: result.targetCrop!,
          timestamp: result.timestamp!
        };

        this.allEntries = [newEntry, ...this.allEntries];

        // 儲存到 DataService
        this.dataService.saveJournalEntry(newEntry);

        // 如果新增的是今天的紀錄，自動切換到今天
        const today = new Date();
        const entryDate = new Date(newEntry.timestamp);
        if (this.formatDateString(today) === this.formatDateString(entryDate)) {
          this.selectedDate = today;
        } else {
          this.selectedDate = entryDate;
        }
      }
    });
  }
}
