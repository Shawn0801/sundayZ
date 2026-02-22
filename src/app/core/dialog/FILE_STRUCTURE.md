# 共用彈窗系統檔案結構

## 📁 檔案位置

所有彈窗相關檔案已移動至 `src/app/core/dialog/`

```
src/app/core/dialog/
├── error-dialog/                         # 錯誤彈窗元件
│   ├── error-dialog.component.ts
│   ├── error-dialog.component.html
│   └── error-dialog.component.scss
├── success-dialog/                       # 成功彈窗元件
│   ├── success-dialog.component.ts
│   ├── success-dialog.component.html
│   └── success-dialog.component.scss
├── dialog.service.ts                     # 彈窗服務（主要入口）
├── dialog-test.component.ts              # 測試元件
├── README.md                             # 完整說明文件
├── QUICKSTART.md                         # 快速入門指南
├── USAGE_EXAMPLES.md                     # 程式碼範例
├── INSTALLATION_SUMMARY.md               # 安裝總結
└── FILE_STRUCTURE.md                     # 本文件
```

---

## 🎯 Import 路徑

### 在元件中使用（推薦寫法）

```typescript
import { DialogService } from '../../core/dialog/dialog.service';
```

### 從不同位置 import 的路徑

| 檔案位置 | Import 路徑 |
|---------|------------|
| `src/app/components/**/*.ts` | `../../core/dialog/dialog.service` |
| `src/app/services/**/*.ts` | `../core/dialog/dialog.service` |
| `src/app/*.ts` | `./core/dialog/dialog.service` |
| `src/app/core/**/*.ts` | `../dialog/dialog.service` 或 `./dialog/dialog.service` |

---

## 🔧 已更新的檔案

### 1. [dashboard.ts](../../components/dashboard/dashboard.ts)
```typescript
import { DialogService } from '../../core/dialog/dialog.service';
```

### 2. [app.routes.ts](../../app.routes.ts)
```typescript
import { DialogTestComponent } from './core/dialog/dialog-test.component';
```

### 3. [dialog-test.component.ts](./dialog-test.component.ts)
```typescript
import { DialogService } from './dialog.service';
```

### 4. [dialog.service.ts](./dialog.service.ts)
```typescript
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { SuccessDialogComponent } from './success-dialog/success-dialog.component';
```

---

## ✅ 驗證清單

- [x] 所有檔案已移動至 `core/dialog/`
- [x] 所有 import 路徑已更新
- [x] 編譯成功（無錯誤）
- [x] 開發伺服器運行正常
- [x] 舊的 `dialogs/` 資料夾已刪除

---

## 🚀 使用方式

### 基本用法

```typescript
import { Component, inject } from '@angular/core';
import { DialogService } from '../../core/dialog/dialog.service';

@Component({
  selector: 'app-example',
  standalone: true,
  // ...
})
export class ExampleComponent {
  private dialogService = inject(DialogService);

  showError() {
    this.dialogService.showError('發生錯誤');
  }

  showSuccess() {
    this.dialogService.showSuccess('操作成功');
  }
}
```

---

## 📚 相關文件

- [README.md](./README.md) - 完整功能說明
- [QUICKSTART.md](./QUICKSTART.md) - 快速入門（30秒上手）
- [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - 10+ 種程式碼範例
- [INSTALLATION_SUMMARY.md](./INSTALLATION_SUMMARY.md) - 安裝總結

---

## 🎉 移動完成！

所有彈窗檔案現在都位於 `src/app/core/dialog/`，符合 Angular 最佳實踐。

**核心檔案應該放在 `core/` 資料夾** - 這是 Angular 建議的專案結構。
