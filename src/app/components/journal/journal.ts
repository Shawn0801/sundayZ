import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { DataService } from '../../services/data-service';
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

  // 日曆選擇的日期
  selectedDate: Date = new Date();

  // 資料
  allEntries: JournalEntry[] = [];

  // 暴露給模板使用
  JournalTypeLabels = JournalTypeLabels;
  JournalTypeIcons = JournalTypeIcons;
  JournalTypeColors = JournalTypeColors;

  ngOnInit(): void {
    this.allEntries = this.dataService.getMockJournalEntries();
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
    alert(`即將開啟「${JournalTypeLabels[type]}」紀錄頁面（功能開發中）`);
  }
}
