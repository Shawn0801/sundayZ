import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, from } from 'rxjs';

/**
 * Token Refresh Interceptor
 *
 * 功能：
 * 1. 監聽 HTTP 401/403 錯誤（Token 無效或過期）
 * 2. 自動呼叫 getIdToken(true) 強制刷新 Token
 * 3. 使用新 Token 重試原始請求（僅重試 1 次）
 * 4. 若重試失敗，清除 Token 並導向登入頁
 *
 * 運作流程：
 * Request → 收到 401/403 → 強制刷新 Token → 重試請求
 *   ↓
 * 成功 → 使用者無感知
 *   ↓
 * 失敗 → 清除 Token → 導向登入頁
 *
 * 注意事項：
 * - 僅處理 401/403 錯誤（未授權 / 禁止存取）
 * - 使用 getIdToken(true) 強制刷新，避免使用快取的過期 Token
 * - 避免無限重試循環（僅重試 1 次）
 * - 不處理白名單 API 的錯誤（讓 error.interceptor 處理）
 */

/**
 * 檢查是否為需要處理的錯誤狀態碼
 */
function shouldRefreshToken(error: HttpErrorResponse): boolean {
  return error.status === 401 || error.status === 403;
}

/**
 * 檢查 URL 是否在白名單內（與 auth.interceptor 保持一致）
 */
const API_WHITELIST = [
  'data.moa.gov.tw',
  'data.gov.tw',
  'get-firebase-settings',
  'generativelanguage.googleapis.com'
];

function isWhitelistedUrl(url: string): boolean {
  // 檢查是否為本地靜態 JSON 檔案（不含 http:// 或 https://）
  if (!url.startsWith('http://') && !url.startsWith('https://') && url.endsWith('.json')) {
    return true;
  }
  return API_WHITELIST.some(domain => url.includes(domain));
}

export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 只處理 401/403 錯誤 且 不是白名單 API
      if (shouldRefreshToken(error) && !isWhitelistedUrl(req.url)) {
        console.warn('Token 無效或過期，嘗試刷新 Token...', {
          status: error.status,
          url: req.url
        });

        // 使用 getIdToken(true) 強制刷新 Token
        return from(authService.getIdToken(true)).pipe(
          switchMap(newToken => {
            // 檢查是否成功取得新 Token
            if (!newToken) {
              console.error('Token 刷新失敗：無法取得新 Token');
              // 清除舊 Token 並導向登入頁
              authService.removeToken();
              router.navigate(['/login'], {
                queryParams: { returnUrl: router.url }
              });
              return throwError(() => error);
            }

            console.log('Token 刷新成功，重試原始請求');

            // Clone 請求並加上新的 Authorization Header
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });

            // 重試原始請求（僅重試 1 次）
            return next(retryReq).pipe(
              catchError((retryError: HttpErrorResponse) => {
                // 重試仍失敗，清除 Token 並導向登入頁
                console.error('Token 刷新後重試失敗', {
                  status: retryError.status,
                  message: retryError.message
                });

                authService.removeToken();
                router.navigate(['/login'], {
                  queryParams: { returnUrl: router.url }
                });

                return throwError(() => retryError);
              })
            );
          }),
          catchError((refreshError) => {
            // Token 刷新本身失敗（例如 Firebase 連線錯誤）
            console.error('Token 刷新過程發生錯誤:', refreshError);

            authService.removeToken();
            router.navigate(['/login'], {
              queryParams: { returnUrl: router.url }
            });

            return throwError(() => error);
          })
        );
      }

      // 非 401/403 錯誤，或是白名單 API，直接拋出錯誤
      return throwError(() => error);
    })
  );
};
