import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { GeminiVisionService } from '../../services/gemini-vision.service';
import { DialogService } from '../../services/dialog.service';

/**
 * 分析狀態
 */
export enum AnalysisState {
  IDLE = 'idle',       // 閒置（未上傳）
  LOADING = 'loading', // 分析中
  SUCCESS = 'success', // 分析完成
  ERROR = 'error'      // 分析失敗
}

/**
 * 蟲害診斷結果
 */
export interface InsectDamageAnalysis {
  /** 蟲害種類 */
  type: string;
  /** 嚴重程度 */
  severity: 'low' | 'medium' | 'high';
  /** 信心指數 (0-100) */
  confidence: number;
  /** 防治建議 */
  recommendations: string[];
  /** 分析時間 */
  timestamp: Date;
}

/**
 * 歷史紀錄
 */
export interface InsectHistoryRecord {
  id: string;
  imageUrl: string;
  analysis: InsectDamageAnalysis;
  date: Date;
}

@Component({
  selector: 'app-insect-damge',
  standalone: true,
  imports: [CommonModule, Button],
  templateUrl: './insect-damge.html',
  styleUrl: './insect-damge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InsectDamge {
  private geminiVision = inject(GeminiVisionService);
  private dialogService = inject(DialogService);
  private cdr = inject(ChangeDetectorRef);

  // 暴露 enum 給模板使用
  AnalysisState = AnalysisState;

  // 狀態管理
  currentState: AnalysisState = AnalysisState.IDLE;
  uploadedImage: string | null = null;
  currentAnalysis: InsectDamageAnalysis | null = null;

  // 聊天介面
  isChatOpen = false;

  // 歷史紀錄（Mock Data - 近一個月）
  historyRecords: InsectHistoryRecord[] = [
    {
      id: 'h001',
      imageUrl: 'https://placehold.co/200x200/8B9D77/ffffff?text=Record+1',
      analysis: {
        type: '蚜蟲',
        severity: 'medium',
        confidence: 87,
        recommendations: [
          '使用苦楝油稀釋液（1:500）噴灑葉面',
          '清除田間雜草，減少蟲源',
          '設置黃色黏板誘捕成蟲'
        ],
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5天前
      },
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'h002',
      imageUrl: 'https://placehold.co/200x200/D4A373/ffffff?text=Record+2',
      analysis: {
        type: '斜紋夜蛾',
        severity: 'high',
        confidence: 92,
        recommendations: [
          '緊急使用蘇力菌製劑（PHI 0天）',
          '夜間巡田捕捉成蟲',
          '設置性費洛蒙誘捕器'
        ],
        timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) // 12天前
      },
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'h003',
      imageUrl: 'https://placehold.co/200x200/2D5A27/ffffff?text=Record+3',
      analysis: {
        type: '未偵測到蟲害',
        severity: 'low',
        confidence: 95,
        recommendations: [
          '作物健康狀況良好',
          '持續監測葉片狀態',
          '維持良好田間衛生'
        ],
        timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20天前
      },
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    }
  ];

  /**
   * 處理檔案上傳
   * 將圖片轉為 Base64 並觸發分析
   */
  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      alert('請上傳圖片檔案');
      return;
    }

    // 讀取圖片為 Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImage = e.target?.result as string;
      this.analyzeImage(file.type);
    };
    reader.readAsDataURL(file);
  }

  /**
   * 處理拖放上傳
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('請上傳圖片檔案');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImage = e.target?.result as string;
      this.analyzeImage(file.type);
    };
    reader.readAsDataURL(file);
  }

  private analyzeImage(mimeType: string): void {
    this.currentState = AnalysisState.LOADING;
    this.cdr.markForCheck();

    this.geminiVision.analyzeImage(this.uploadedImage!, mimeType).subscribe({
      next: (result) => {
        this.currentAnalysis = result;
        this.currentState = AnalysisState.SUCCESS;
        this.cdr.markForCheck();
      },
      error: (err: Error) => {
        this.currentState = AnalysisState.ERROR;
        this.dialogService.showError(err.message, '分析失敗');
        this.cdr.markForCheck();
      }
    });
  }

  /**
   * 重新上傳
   */
  resetUpload(): void {
    this.currentState = AnalysisState.IDLE;
    this.uploadedImage = null;
    this.currentAnalysis = null;
    this.isChatOpen = false;
  }

  /**
   * 切換聊天介面
   */
  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
  }

  /**
   * 點擊歷史紀錄
   */
  loadHistoryRecord(record: InsectHistoryRecord): void {
    this.uploadedImage = record.imageUrl;
    this.currentAnalysis = record.analysis;
    this.currentState = AnalysisState.SUCCESS;
    this.isChatOpen = false;
  }

  /**
   * 取得嚴重程度顏色
   */
  getSeverityColor(severity: 'low' | 'medium' | 'high'): string {
    const colorMap = {
      low: 'success',
      medium: 'warning',
      high: 'danger'
    };
    return colorMap[severity];
  }

  /**
   * 取得嚴重程度文字
   */
  getSeverityLabel(severity: 'low' | 'medium' | 'high'): string {
    const labelMap = {
      low: '輕微',
      medium: '中度',
      high: '嚴重'
    };
    return labelMap[severity];
  }
}
