# 共用彈窗系統使用說明

本專案提供統一的錯誤與成功彈窗元件，符合「田間助理」農業風格配色系統。

## 📁 資料夾結構

```
src/app/dialogs/
├── error-dialog/           # 錯誤彈窗元件
│   ├── error-dialog.component.ts
│   ├── error-dialog.component.html
│   └── error-dialog.component.scss
├── success-dialog/         # 成功彈窗元件
│   ├── success-dialog.component.ts
│   ├── success-dialog.component.html
│   └── success-dialog.component.scss
├── dialog.service.ts       # 封裝服務
└── README.md              # 本文件
```

---

## 🎨 設計規範

### 錯誤彈窗 (ErrorDialog)
- **主色**：`danger-500` (#ef4444) 紅色
- **圖示**：驚嘆號圓形圖示
- **動畫**：脈衝動畫
- **支援欄位**：
  - `title`：標題（預設：發生錯誤）
  - `message`：錯誤訊息（必填）
  - `errorCode`：錯誤代碼（選用）

### 成功彈窗 (SuccessDialog)
- **主色**：`primary-500` (#2D5A27) 森林深綠
- **圖示**：勾選圓形圖示
- **動畫**：彈出動畫 + 勾選線條動畫
- **支援欄位**：
  - `title`：標題（預設：操作成功）
  - `message`：成功訊息（必填）
  - `actionHint`：操作提示（選用）

---

## 🚀 使用方式

### 1️⃣ 在元件中注入服務

```typescript
import { Component, inject } from '@angular/core';
import { DialogService } from './dialogs/dialog.service';

@Component({
  selector: 'app-example',
  standalone: true,
  // ...
})
export class ExampleComponent {
  private dialogService = inject(DialogService);

  // 你的程式碼...
}
```

### 2️⃣ 顯示錯誤彈窗

```typescript
// 基本用法
this.dialogService.showError('資料載入失敗');

// 自訂標題
this.dialogService.showError('無法連線到伺服器', '網路錯誤');

// 包含錯誤代碼
this.dialogService.showError(
  '無法連線到伺服器',
  '網路錯誤',
  'ERR_NETWORK_001'
);
```

### 3️⃣ 顯示成功彈窗

```typescript
// 基本用法
this.dialogService.showSuccess('資料已成功儲存');

// 自訂標題
this.dialogService.showSuccess('新增成功', '完成');

// 包含操作提示
this.dialogService.showSuccess(
  '田間日誌已新增',
  '新增成功',
  '可至列表查看新增的日誌記錄'
);
```

### 4️⃣ 處理 HTTP 錯誤

```typescript
import { HttpClient } from '@angular/common/http';

export class DataService {
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

  getData() {
    this.http.get('/api/data').subscribe({
      next: (data) => {
        console.log('資料:', data);
      },
      error: (err) => {
        // 自動根據 HTTP 狀態碼顯示友善訊息
        this.dialogService.handleHttpError(err);
      }
    });
  }

  // 自訂錯誤訊息
  saveData(data: any) {
    this.http.post('/api/data', data).subscribe({
      error: (err) => {
        this.dialogService.handleHttpError(err, '儲存失敗，請稍後再試');
      }
    });
  }
}
```

---

## 📝 完整範例

### 範例 1：登入錯誤處理

```typescript
login(username: string, password: string) {
  this.http.post('/api/login', { username, password }).subscribe({
    next: () => {
      this.dialogService.showSuccess('登入成功', '歡迎回來');
    },
    error: (err) => {
      if (err.status === 401) {
        this.dialogService.showError('帳號或密碼錯誤', '登入失敗');
      } else {
        this.dialogService.handleHttpError(err);
      }
    }
  });
}
```

### 範例 2：表單提交

```typescript
submitForm() {
  if (!this.validateForm()) {
    this.dialogService.showError('請填寫所有必填欄位', '表單驗證失敗');
    return;
  }

  this.http.post('/api/submit', this.formData).subscribe({
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
```

### 範例 3：刪除確認後顯示結果

```typescript
deleteItem(id: string) {
  // 先用 PrimeNG ConfirmDialog 確認
  this.confirmationService.confirm({
    message: '確定要刪除此項目嗎？',
    accept: () => {
      this.http.delete(`/api/items/${id}`).subscribe({
        next: () => {
          this.dialogService.showSuccess('項目已刪除');
        },
        error: (err) => {
          this.dialogService.handleHttpError(err, '刪除失敗');
        }
      });
    }
  });
}
```

---

## ⚙️ 進階設定

### 取得彈窗參照（DialogRef）

如果需要在彈窗關閉後執行動作：

```typescript
const ref = this.dialogService.showSuccess('儲存成功');

ref.onClose.subscribe(() => {
  console.log('彈窗已關閉');
  this.router.navigate(['/list']);
});
```

### HTTP 錯誤代碼對應

`handleHttpError()` 自動處理以下 HTTP 狀態碼：

| 狀態碼 | 顯示訊息 |
|--------|---------|
| 400 | 請求格式錯誤，請檢查輸入資料 |
| 401 | 未授權，請重新登入 |
| 403 | 權限不足，無法執行此操作 |
| 404 | 找不到請求的資源 |
| 500 | 伺服器錯誤，請稍後再試 |
| 503 | 服務暫時無法使用，請稍後再試 |

---

## 🎯 最佳實踐

1. **統一使用 DialogService**：避免在各元件中重複撰寫彈窗邏輯
2. **提供有意義的訊息**：讓使用者清楚知道發生什麼事
3. **善用 actionHint**：在成功彈窗中告訴使用者下一步可以做什麼
4. **HTTP 錯誤優先使用 handleHttpError()**：自動提供友善的錯誤訊息

---

## 🔧 技術說明

- **框架**：Angular 20 Standalone Components
- **UI 庫**：PrimeNG 20 DynamicDialog
- **樣式**：Tailwind CSS + 專案自訂農業配色
- **動畫**：CSS Animations

---

## 📞 需要協助？

如有任何問題或建議，請聯繫開發團隊。
