# DialogService 使用範例程式碼

這個檔案包含各種實際使用情境的程式碼範例，可直接複製貼上到你的元件或服務中使用。

---

## 範例 1️⃣：在元件中基本使用

```typescript
import { Component, inject } from '@angular/core';
import { DialogService } from './dialogs/dialog.service';

@Component({
  selector: 'app-example-basic',
  standalone: true,
  template: `
    <button (click)="showError()">顯示錯誤</button>
    <button (click)="showSuccess()">顯示成功</button>
  `
})
export class ExampleBasicComponent {
  private dialogService = inject(DialogService);

  showError() {
    this.dialogService.showError('這是一個錯誤訊息');
  }

  showSuccess() {
    this.dialogService.showSuccess('操作成功完成！');
  }
}
```

---

## 範例 2️⃣：表單驗證與提交

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DialogService } from './dialogs/dialog.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-example-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="submitForm()">
      <input [(ngModel)]="formData.name" name="name" placeholder="姓名" />
      <input [(ngModel)]="formData.email" name="email" placeholder="Email" />
      <button type="submit">送出</button>
    </form>
  `
})
export class ExampleFormComponent {
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

  formData = {
    name: '',
    email: ''
  };

  submitForm() {
    // 前端驗證
    if (!this.validateForm()) {
      this.dialogService.showError(
        '請填寫所有必填欄位',
        '表單驗證失敗'
      );
      return;
    }

    // 送出表單
    this.http.post('/api/forms', this.formData).subscribe({
      next: () => {
        this.dialogService.showSuccess(
          '您的表單已成功送出',
          '送出成功',
          '我們會在 3 個工作天內回覆您'
        );
      },
      error: (err) => {
        this.dialogService.handleHttpError(err, '表單送出失敗');
      }
    });
  }

  private validateForm(): boolean {
    return this.formData.name.trim() !== '' &&
           this.formData.email.trim() !== '';
  }
}
```

---

## 範例 3️⃣：API 資料載入

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data-service';
import { DialogService } from './dialogs/dialog.service';

@Component({
  selector: 'app-example-data-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="loadData()">載入資料</button>
    @if (data) {
      <div>{{ data | json }}</div>
    }
  `
})
export class ExampleDataLoadingComponent {
  private dataService = inject(DataService);
  private dialogService = inject(DialogService);

  data: any = null;

  loadData() {
    this.dataService.getAgriProductsTransType().subscribe({
      next: (response) => {
        this.data = response.Data;
        this.dialogService.showSuccess('資料載入成功');
      },
      error: (err) => {
        // 使用 handleHttpError 自動處理 HTTP 錯誤
        this.dialogService.handleHttpError(err);
      }
    });
  }
}
```

---

## 範例 4️⃣：刪除操作

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DialogService } from './dialogs/dialog.service';

@Component({
  selector: 'app-example-delete',
  standalone: true,
  template: `
    <button (click)="deleteItem('123')">刪除項目</button>
  `
})
export class ExampleDeleteComponent {
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

  deleteItem(id: string) {
    this.http.delete(\`/api/items/\${id}\`).subscribe({
      next: () => {
        this.dialogService.showSuccess(
          '項目已成功刪除',
          '刪除成功'
        );
      },
      error: (err) => {
        this.dialogService.handleHttpError(err, '刪除失敗');
      }
    });
  }
}
```

---

## 範例 5️⃣：登入功能

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DialogService } from './dialogs/dialog.service';

@Component({
  selector: 'app-example-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="login()">
      <input [(ngModel)]="username" name="username" placeholder="使用者名稱" />
      <input [(ngModel)]="password" name="password" type="password" placeholder="密碼" />
      <button type="submit">登入</button>
    </form>
  `
})
export class ExampleLoginComponent {
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

  username = '';
  password = '';

  login() {
    this.http.post('/api/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: () => {
        this.dialogService.showSuccess(
          '登入成功，歡迎回來！',
          '登入成功'
        );
      },
      error: (err) => {
        if (err.status === 401) {
          this.dialogService.showError(
            '帳號或密碼錯誤，請重新輸入',
            '登入失敗'
          );
        } else {
          this.dialogService.handleHttpError(err);
        }
      }
    });
  }
}
```

---

## 範例 6️⃣：上傳檔案

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DialogService } from './dialogs/dialog.service';

@Component({
  selector: 'app-example-upload',
  standalone: true,
  template: `
    <input type="file" (change)="onFileSelected($event)" />
    <button (click)="uploadFile()">上傳</button>
  `
})
export class ExampleUploadComponent {
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

  selectedFile: File | null = null;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (!this.selectedFile) {
      this.dialogService.showError('請選擇要上傳的檔案', '未選擇檔案');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post('/api/upload', formData).subscribe({
      next: () => {
        this.dialogService.showSuccess(
          '檔案上傳成功',
          '上傳完成',
          '已成功上傳 ' + this.selectedFile?.name
        );
      },
      error: (err) => {
        this.dialogService.handleHttpError(err, '檔案上傳失敗');
      }
    });
  }
}
```

---

## 範例 7️⃣：在服務層中使用（推薦）

在 `src/app/services/data-service.ts` 中整合 DialogService：

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DialogService } from '../dialogs/dialog.service';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

  // 方法 1：在服務層自動顯示錯誤
  getDataWithAutoErrorHandling() {
    return this.http.get('/api/data').pipe(
      catchError((err) => {
        this.dialogService.handleHttpError(err);
        return throwError(() => err);
      })
    );
  }

  // 方法 2：在服務層自動顯示成功訊息
  saveDataWithAutoSuccess(data: any) {
    return this.http.post('/api/data', data).pipe(
      tap(() => {
        this.dialogService.showSuccess('資料已成功儲存');
      }),
      catchError((err) => {
        this.dialogService.handleHttpError(err, '儲存失敗');
        return throwError(() => err);
      })
    );
  }

  // 方法 3：讓元件決定是否顯示彈窗（推薦）
  getData() {
    return this.http.get('/api/data');
    // 元件中使用：
    // this.dataService.getData().subscribe({
    //   next: (data) => this.dialogService.showSuccess('載入成功'),
    //   error: (err) => this.dialogService.handleHttpError(err)
    // });
  }
}
```

---

## 範例 8️⃣：取得 DialogRef 並監聽關閉事件

```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DialogService } from './dialogs/dialog.service';

@Component({
  selector: 'app-example-dialog-ref',
  standalone: true,
  template: `<button (click)="saveAndNavigate()">儲存並導向</button>`
})
export class ExampleDialogRefComponent {
  private dialogService = inject(DialogService);
  private router = inject(Router);

  saveAndNavigate() {
    // 模擬儲存操作
    const ref = this.dialogService.showSuccess(
      '資料已儲存',
      '儲存成功'
    );

    // 監聽彈窗關閉事件
    ref.onClose.subscribe(() => {
      console.log('彈窗已關閉，準備導向...');
      this.router.navigate(['/list']);
    });
  }
}
```

---

## 範例 9️⃣：自訂錯誤代碼

```typescript
import { Component, inject } from '@angular/core';
import { DialogService } from './dialogs/dialog.service';

@Component({
  selector: 'app-example-error-code',
  standalone: true,
  template: `<button (click)="triggerError()">觸發錯誤</button>`
})
export class ExampleErrorCodeComponent {
  private dialogService = inject(DialogService);

  triggerError() {
    this.dialogService.showError(
      '無法連線到氣象資料伺服器',
      '資料載入失敗',
      'WEATHER_API_001'
    );
  }
}
```

---

## 範例 🔟：批次操作

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DialogService } from './dialogs/dialog.service';

@Component({
  selector: 'app-example-batch',
  standalone: true,
  template: `<button (click)="batchDelete()">批次刪除</button>`
})
export class ExampleBatchComponent {
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

  selectedIds = ['1', '2', '3'];

  batchDelete() {
    this.http.post('/api/batch-delete', { ids: this.selectedIds }).subscribe({
      next: () => {
        this.dialogService.showSuccess(
          \`已成功刪除 \${this.selectedIds.length} 個項目\`,
          '批次刪除完成'
        );
      },
      error: (err) => {
        this.dialogService.handleHttpError(err, '批次刪除失敗');
      }
    });
  }
}
```

---

## 💡 使用建議

1. **統一使用 DialogService**：避免在各元件中重複撰寫彈窗邏輯
2. **提供有意義的訊息**：讓使用者清楚知道發生什麼事
3. **善用 actionHint**：在成功彈窗中告訴使用者下一步可以做什麼
4. **HTTP 錯誤優先使用 handleHttpError()**：自動提供友善的錯誤訊息
5. **需要 FormsModule 時記得 import**：使用 `[(ngModel)]` 時要引入 `FormsModule`
