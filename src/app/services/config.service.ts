import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Environment } from '../models/environment.interface';
import { AgriRiskPredictResponse } from '../interfaces/AgriRiskRes';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = 'https://get-firebase-settings-342016522608.europe-west1.run.app';
  private environment: Environment | null = null;

  constructor(private http: HttpClient) { }

  /**
   * 使用 Observable 取得 Firebase 配置
   */
  getFirebaseConfig(): Observable<Environment> {
    const headers = new HttpHeaders({
      'X-Custom-Auth': 'nicesunday-secure-2026'
    });

    return this.http.get<Environment>(this.apiUrl, { headers });
  }

  /**
   * 使用 Promise 載入並儲存 Firebase 配置
   */
  async loadEnvironment(): Promise<Environment> {
    if (this.environment) {
      return this.environment;
    }

    const headers = new HttpHeaders({
      'X-Custom-Auth': 'nicesunday-secure-2026'
    });

    this.environment = await firstValueFrom(
      this.http.get<Environment>(this.apiUrl, { headers })
    );

    return this.environment;
  }

  /**
   * 取得已載入的 environment 配置
   */
  getEnvironment(): Environment | null {
    return this.environment;
  }

  /**
   * 透過 Cloud Run 代理呼叫 agriRisk API
   *
   * @param features 預測特徵資料
   * @returns Observable<AgriRiskPredictResponse>
   *
   * 使用範例：
   * ```typescript
   * const features = { agriRisk: "25.5_0.72_8.5" };
   * this.configService.predictAgriRisk(features).subscribe({
   *   next: (result) => console.log('預測結果:', result),
   *   error: (error) => console.error('預測失敗:', error)
   * });
   * ```
   */
  predictAgriRisk(features: any): Observable<AgriRiskPredictResponse> {
    const url = `${this.apiUrl}/predict`;

    const headers = new HttpHeaders({
      'X-Custom-Auth': 'nicesunday-secure-2026',
      'Content-Type': 'application/json'
    });

    return this.http.post<AgriRiskPredictResponse>(
      url,
      { features },
      { headers }
    );
  }
}
