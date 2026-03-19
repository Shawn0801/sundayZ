import { inject } from '@angular/core';
import { Router, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Auth Guard - Protects routes that require authentication
 *
 * 功能：
 * 1. 保護需要登入才能存取的路由
 * 2. 檢查使用者是否已登入
 * 3. 未登入時導向登入頁，並記錄原始 URL (returnUrl)
 * 4. 登入成功後可自動返回原始頁面
 */
export const authGuard: CanActivateFn = (route, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        // 導向登入頁，並保存原始 URL
        router.navigate(['/login'], {
          queryParams: {
            returnUrl: state.url  // 保存原始 URL，登入後可返回
          }
        });
        return false;
      }
      return true;
    })
  );
};

/**
 * Guest Guard - Redirects authenticated users away from login/register pages
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        router.navigate(['/dashboard']);
        return false;
      }
      return true;
    })
  );
};
