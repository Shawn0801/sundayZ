import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';

// ============================================================
// 🔧 GCP AI 整合點 #1: 匯入必要模組
// ============================================================
// ⭐ 推薦方案：Gemini Vision API (取消以下註解)
// import { inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../environments/environment';
// import { catchError, map, timeout } from 'rxjs/operators';
// import { throwError } from 'rxjs';

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

// ============================================================
// 🔧 GCP AI 整合點 #2: API 請求/回應介面
// ============================================================
// ⭐ 推薦方案：Gemini Vision API
// 成本：每月 1000 次分析 ≈ $0.5-1 USD
// 優點：零訓練成本、快速整合、繁體中文支援
// ============================================================
/**
 * Gemini Vision API 請求格式
 */
// export interface GeminiRequest {
//   contents: {
//     parts: {
//       text?: string;           // Prompt 文字
//       inline_data?: {          // 圖片資料
//         mime_type: string;     // 'image/jpeg'
//         data: string;          // Base64 編碼（不含 data:image/jpeg;base64,）
//       };
//     }[];
//   }[];
// }

/**
 * Gemini Vision API 回應格式
 */
// export interface GeminiResponse {
//   candidates: {
//     content: {
//       parts: {
//         text: string;  // JSON 字串格式的分析結果
//       }[];
//     };
//   }[];
// }

// ============================================================
// 替代方案：Vertex AI AutoML Vision
// 成本：訓練 $3.465/小時 + 部署 $936/月
// 優點：客製化模型、高準確度（95%+）
// 缺點：需要 1000+ 張標註圖片、開發時間長
// ============================================================
/**
 * AutoML Vision 請求格式
 */
// export interface AutoMLRequest {
//   image: string;      // Base64 編碼的圖片
//   timestamp: string;  // ISO 8601 格式時間戳記
// }

/**
 * AutoML Vision 回應格式
 */
// export interface AutoMLResponse {
//   type: string;                           // 蟲害種類
//   severity: 'low' | 'medium' | 'high';   // 嚴重程度
//   confidence: number;                     // 信心指數 (0-100)
//   recommendations: string[];              // 防治建議列表
// }

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
  styleUrl: './insect-damge.scss'
})
export class InsectDamge {
  // ============================================================
  // 🔧 GCP AI 整合點 #3: 注入 HttpClient
  // ============================================================
  // private http = inject(HttpClient);

  // ============================================================
  // 🔧 GCP AI 整合點 #4: 設定 API 端點
  // ============================================================
  // ⭐ Gemini Vision API (推薦)
  // Step 1: 取得 API Key: https://makersuite.google.com/app/apikey
  // Step 2: 設定 environment.ts: geminiApiKey = 'YOUR_API_KEY'
  // Step 3: 取消以下註解
  // private readonly GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${environment.geminiModel}:generateContent?key=${environment.geminiApiKey}`;
  //
  // 替代方案：AutoML Vision (需要訓練)
  // private readonly AUTOML_API_URL = 'https://your-cloud-run-url.run.app/api/analyze-insect';

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
      this.simulateAnalysis();
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
      this.simulateAnalysis();
    };
    reader.readAsDataURL(file);
  }

  // ============================================================
  // 🔧 GCP AI 整合點 #5: 主要分析方法
  // ============================================================
  // 目前狀態：Mock 模擬（2秒延遲）
  // 完整整合指南：請參考 docs/GEMINI_VISION_INTEGRATION.md
  // ============================================================
  /**
   * 蟲害分析方法
   *
   * 整合步驟：
   * 1. 取消註解整合點 #1-4 的程式碼
   * 2. 刪除下方的 setTimeout Mock 程式碼（Line 267-280）
   * 3. 取消註解 Gemini API 整合程式碼（Line 282-327）
   * 4. 測試並部署
   */
  private simulateAnalysis(): void {
    this.currentState = AnalysisState.LOADING;

    // ============================================================
    // ❌ Mock 程式碼（整合時請刪除此段）
    // ============================================================
    setTimeout(() => {
      // Mock 診斷結果
      this.currentAnalysis = {
        type: '斑潛蠅',
        severity: 'medium',
        confidence: 89,
        recommendations: [
          '使用窄域油（礦物油）稀釋 200 倍噴灑葉背',
          '清除受害嚴重葉片並銷毀',
          '懸掛藍色黏板於葉面高度（每 10 坪 3 片）',
          '避免過度施用氮肥，以免葉片過嫩'
        ],
        timestamp: new Date()
      };

      this.currentState = AnalysisState.SUCCESS;
    }, 2000);

    // ============================================================
    // ✅ Gemini Vision API 整合程式碼（取消註解以啟用）
    // 詳細說明：docs/GEMINI_VISION_INTEGRATION.md
    // ============================================================
    // // 準備 Gemini API Payload
    // const payload: GeminiRequest = {
    //   contents: [{
    //     parts: [
    //       { text: this.getGeminiPrompt() },
    //       {
    //         inline_data: {
    //           mime_type: "image/jpeg",
    //           data: this.uploadedImage!.split(',')[1] // 移除 data:image/jpeg;base64,
    //         }
    //       }
    //     ]
    //   }]
    // };
    //
    // // 發送 HTTP POST 請求
    // this.http.post<GeminiResponse>(this.GEMINI_API_URL, payload)
    //   .pipe(
    //     timeout(30000), // 30秒超時
    //     map(response => {
    //       // 解析 Gemini 回應
    //       const text = response.candidates[0]?.content?.parts[0]?.text;
    //       if (!text) throw new Error('無法取得分析結果');
    //
    //       // 清理 JSON（移除 markdown 格式）
    //       const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    //       return JSON.parse(jsonText);
    //     }),
    //     catchError(error => {
    //       console.error('Gemini API 錯誤:', error);
    //       this.currentState = AnalysisState.ERROR;
    //
    //       // 使用者友善的錯誤訊息
    //       let errorMessage = '分析失敗，請稍後再試';
    //       if (error.name === 'TimeoutError') errorMessage = '分析超時，請稍後再試';
    //       else if (error.status === 0) errorMessage = '無法連線至 AI 服務';
    //       else if (error.status === 429) errorMessage = 'API 配額已用盡';
    //       else if (error.status === 400) errorMessage = '圖片格式不支援';
    //
    //       alert(errorMessage);
    //       return throwError(() => error);
    //     })
    //   )
    //   .subscribe((result: any) => {
    //     this.currentAnalysis = {
    //       type: result.type || '未知蟲害',
    //       severity: result.severity || 'medium',
    //       confidence: result.confidence || 0,
    //       recommendations: result.recommendations || [],
    //       timestamp: new Date()
    //     };
    //     this.currentState = AnalysisState.SUCCESS;
    //   });
  }

  // ============================================================
  // 🔧 Gemini Prompt（取消註解以啟用）
  // ============================================================
  /**
   * 建立 Gemini Vision 分析 Prompt
   * 可根據需求調整 Prompt 以優化分析結果
   */
  // private getGeminiPrompt(): string {
  //   return `
  // 你是一位專業的農業病蟲害診斷專家。請仔細分析這張農作物圖片，判斷是否有蟲害問題。
  //
  // 請以 **純 JSON 格式** 回傳結果（不要包含 markdown 格式符號如 \`\`\`json）：
  //
  // {
  //   "type": "蟲害名稱（如：蚜蟲、斑潛蠅、斜紋夜蛾、未偵測到蟲害）",
  //   "severity": "low 或 medium 或 high",
  //   "confidence": 數字（0-100，表示信心指數）,
  //   "recommendations": [
  //     "具體且實用的防治建議1",
  //     "具體且實用的防治建議2",
  //     "具體且實用的防治建議3"
  //   ]
  // }
  //
  // 評估標準：
  // - **low（輕微）**: 少量蟲害，不影響作物生長，可自然防治
  // - **medium（中度）**: 可見蟲害跡象，需要處理以避免擴散
  // - **high（嚴重）**: 大量蟲害，緊急需要處理，可能影響收成
  //
  // 防治建議要求：
  // 1. 優先推薦有機或低毒性防治方法
  // 2. 提供具體的藥劑名稱和使用方式
  // 3. 包含物理或生物防治方法
  // 4. 考慮台灣氣候條件
  //
  // 請確保回應是有效的 JSON 格式。
  // `.trim();
  // }

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
