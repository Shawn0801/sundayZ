import { HttpInterceptorFn } from "@angular/common/http";
import { DialogService } from "../services/dialog.service";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(DialogService);

  return next(req).pipe(
    catchError((err) => {
      // 這裡寫你的彈窗邏輯
      dialog.showError(err.message || '未知錯誤需交由工程師排解');
      return throwError(() => err);
    })
  );
};
