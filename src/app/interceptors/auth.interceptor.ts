import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap } from 'rxjs';

/**
 * API 白名單：這些 API 不需要加上 Authorization Token
 *
 * 包含：
 * - 政府開放資料 API (data.moa.gov.tw, data.gov.tw)
 * - Firebase 配置 API (get-firebase-settings)
 * - Gemini AI API (generativelanguage.googleapis.com)
 * - 本地靜態資源檔案 (.json)
 */
const API_WHITELIST = [
  'data.moa.gov.tw',
  'data.gov.tw',
  'get-firebase-settings',
  'generativelanguage.googleapis.com'
];

/**
 * 檢查 URL 是否在白名單內
 * @param url 請求的 URL
 * @returns true 表示在白名單內（不需要加 Token）
 */
function isWhitelistedUrl(url: string): boolean {
  // 檢查是否為本地靜態 JSON 檔案（不含 http:// 或 https://）
  if (!url.startsWith('http://') && !url.startsWith('https://') && url.endsWith('.json')) {
    return true;
  }
  return API_WHITELIST.some(domain => url.includes(domain));
}

/**
 * Auth Interceptor
 *
 * 功能：
 * 1. 自動在 HTTP 請求中加上 Authorization: Bearer {token}
 * 2. 白名單 API 不加 Token（政府開放資料、Firebase 配置、Gemini AI）
 * 3. 從 AuthService 取得最新的 Firebase ID Token
 * 4. 使用非同步方式處理 Token 取得
 *
 * 運作流程：
 * Request → 檢查白名單 → 取得 Token → 加入 Header → 發送請求
 *
 * 注意事項：
 * - Firebase ID Token 預設 1 小時過期
 * - getIdToken() 會自動處理快取，避免每次都重新取得
 * - 過期的 Token 會由 token-refresh.interceptor 處理
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // 檢查是否為白名單 API
  if (isWhitelistedUrl(req.url)) {
    // 白名單 API 直接放行，不加 Token
    return next(req);
  }

  // 非白名單 API：取得 Token 並加入 Authorization Header
  return from(authService.getIdToken()).pipe(
    switchMap(token => {
      // 如果 Token 不存在（使用者未登入），直接發送原始請求
      if (!token) {
        return next(req);
      }

      // Clone 請求並加上 Authorization Header
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      // 發送帶有 Token 的請求
      return next(authReq);
    })
  );
};
