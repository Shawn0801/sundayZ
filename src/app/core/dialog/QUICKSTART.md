# 🚀 快速入門指南

## 30 秒開始使用共用彈窗

### 步驟 1：注入服務

在你的元件中注入 `DialogService`：

```typescript
import { Component, inject } from '@angular/core';
import { DialogService } from './dialogs/dialog.service';

export class YourComponent {
  private dialogService = inject(DialogService);
}
```

### 步驟 2：使用彈窗

```typescript
// 顯示錯誤
this.dialogService.showError('發生錯誤');

// 顯示成功
this.dialogService.showSuccess('操作成功');

// 處理 HTTP 錯誤
this.http.get(url).subscribe({
  error: (err) => this.dialogService.handleHttpError(err)
});
```

---

## 📦 完整範例：在元件中使用

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DialogService } from '../dialogs/dialog.service';

@Component({
  selector: 'app-my-component',
  standalone: true,
  template: `
    <button (click)="loadData()">載入資料</button>
  `
})
export class MyComponent {
  private http = inject(HttpClient);
  private dialogService = inject(DialogService);

  loadData() {
    this.http.get('/api/data').subscribe({
      next: (data) => {
        console.log('資料:', data);
        this.dialogService.showSuccess('資料載入成功');
      },
      error: (err) => {
        this.dialogService.handleHttpError(err);
      }
    });
  }
}
```

---

## 🎨 效果預覽

### 錯誤彈窗
- ❌ 紅色主題（danger-500）
- 圓形驚嘆號圖示
- 脈衝動畫效果
- 可選顯示錯誤代碼

### 成功彈窗
- ✅ 綠色主題（primary-500 森林深綠）
- 圓形勾選圖示
- 勾選動畫效果
- 可選顯示操作提示

---

## 📚 更多範例

查看以下檔案了解更多用法：

- [README.md](./README.md) - 完整說明文件
- [USAGE_EXAMPLES.ts](./USAGE_EXAMPLES.ts) - 10+ 種實際使用範例

---

## ✅ 已完成設定

- ✅ [app.config.ts](../app.config.ts) 已註冊 `DialogService`
- ✅ ErrorDialog 元件已建立
- ✅ SuccessDialog 元件已建立
- ✅ DialogService 封裝服務已建立
- ✅ 符合專案農業風格配色系統

**可以直接開始使用！**
