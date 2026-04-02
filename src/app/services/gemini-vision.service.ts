import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { ENVIRONMENT } from '../app.config';
import { InsectDamageAnalysis } from '../components/insect-damge/insect-damge';

interface GeminiRequest {
  contents: {
    parts: ({
      text: string;
      inline_data?: never;
    } | {
      text?: never;
      inline_data: {
        mime_type: string;
        data: string;
      };
    })[];
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

const GEMINI_PROMPT = `
你是一位專業的農業病蟲害診斷專家。請仔細分析這張農作物圖片，判斷是否有蟲害問題。

請以純 JSON 格式回傳結果（不要包含 markdown 格式符號如 \`\`\`json）：

{
  "type": "蟲害名稱（如：蚜蟲、斑潛蠅、斜紋夜蛾、未偵測到蟲害）",
  "severity": "low 或 medium 或 high",
  "confidence": 數字（0-100，表示信心指數）,
  "recommendations": [
    "具體且實用的防治建議1",
    "具體且實用的防治建議2",
    "具體且實用的防治建議3"
  ]
}

評估標準：
- low（輕微）: 少量蟲害，不影響作物生長，可自然防治
- medium（中度）: 可見蟲害跡象，需要處理以避免擴散
- high（嚴重）: 大量蟲害，緊急需要處理，可能影響收成

防治建議要求：
1. 優先推薦有機或低毒性防治方法
2. 提供具體的藥劑名稱和使用方式
3. 包含物理或生物防治方法
4. 考慮台灣氣候條件

請確保回應是有效的 JSON 格式。
`.trim();

@Injectable({ providedIn: 'root' })
export class GeminiVisionService {
  private http = inject(HttpClient);
  private env = inject(ENVIRONMENT);

  analyzeImage(base64DataUrl: string, mimeType: string): Observable<InsectDamageAnalysis> {
    const apiKey = this.env.geminiApiKey;
    const model = this.env.geminiModel || 'gemini-1.5-flash';

    if (!apiKey) {
      return throwError(() => new Error('Gemini API Key 未設定'));
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload: GeminiRequest = {
      contents: [{
        parts: [
          { text: GEMINI_PROMPT },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64DataUrl.split(',')[1]
            }
          }
        ]
      }]
    };

    return this.http.post<GeminiResponse>(url, payload).pipe(
      timeout(30000),
      map(response => {
        const text = response.candidates[0]?.content?.parts[0]?.text;
        if (!text) throw new Error('無法取得分析結果');

        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(jsonText);

        return {
          type: result['type'] || '未知蟲害',
          severity: result['severity'] || 'medium',
          confidence: result['confidence'] ?? 0,
          recommendations: result['recommendations'] || [],
          timestamp: new Date()
        } as InsectDamageAnalysis;
      }),
      catchError(error => {
        let message = '分析失敗，請稍後再試';
        if (error.name === 'TimeoutError') message = '分析超時，請稍後再試';
        else if (error.status === 0) message = '無法連線至 AI 服務';
        else if (error.status === 429) message = 'API 配額已用盡';
        else if (error.status === 400) message = '圖片格式不支援';
        return throwError(() => new Error(message));
      })
    );
  }
}
