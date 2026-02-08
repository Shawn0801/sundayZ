# 配置檔案完整說明

## 📚 目錄
1. [整體架構](#整體架構)
2. [檔案詳解](#檔案詳解)
3. [構建流程](#構建流程)
4. [配色系統實現](#配色系統實現)
5. [實際運作範例](#實際運作範例)

---

## 整體架構

### 技術堆疊層次圖
```
┌─────────────────────────────────────────┐
│         Angular 應用程式                 │
│  (src/app/*, *.component.html)          │
└──────────────┬──────────────────────────┘
               │ 使用 Tailwind 類別
               ↓
┌─────────────────────────────────────────┐
│       PrimeNG 組件 + Aura 主題           │
│    (providePrimeNG in app.config.ts)    │
└──────────────┬──────────────────────────┘
               │ 整合
               ↓
┌─────────────────────────────────────────┐
│      Tailwind CSS (配色系統)             │
│      (tailwind.config.js)               │
└──────────────┬──────────────────────────┘
               │ 處理 @tailwind 指令
               ↓
┌─────────────────────────────────────────┐
│      PostCSS (CSS 處理器)                │
│    (postcss.config.js)                  │
│  - tailwindcss 插件                      │
│  - autoprefixer 插件                     │
└──────────────┬──────────────────────────┘
               │ 讀取樣式
               ↓
┌─────────────────────────────────────────┐
│      樣式入口 (src/styles.scss)          │
│  - @tailwind base/components/utilities  │
│  - CSS 變數定義                          │
│  - 自定義組件樣式                        │
└──────────────┬──────────────────────────┘
               │ Angular 構建系統讀取
               ↓
┌─────────────────────────────────────────┐
│      Angular CLI (angular.json)         │
│  - 指定 styles 入口                      │
│  - 自動調用 PostCSS                      │
└──────────────┬──────────────────────────┘
               │ 輸出
               ↓
┌─────────────────────────────────────────┐
│   最終 CSS (dist/sundayZ/browser/)      │
│  - 包含 Tailwind utilities              │
│  - 包含瀏覽器前綴                        │
│  - 包含自定義樣式                        │
└─────────────────────────────────────────┘
```

---

## 檔案詳解

### 1️⃣ package.json - 依賴管理
**位置:** `/package.json`
**作用:** 定義專案依賴和腳本

#### 關鍵依賴項
```json
{
  "devDependencies": {
    "postcss": "^8.4.49",         // CSS 處理器核心
    "tailwindcss": "^3.4.17",     // Tailwind CSS 框架
    "autoprefixer": "^10.4.20"    // 自動添加瀏覽器前綴
  },
  "dependencies": {
    "@primeuix/themes": "^1.2.3", // PrimeNG 主題系統
    "primeng": "^20.1.1",         // PrimeNG UI 組件庫
    "primeicons": "^7.0.0"        // PrimeNG 圖示
  }
}
```

#### 相關腳本
```json
{
  "scripts": {
    "start": "ng serve",    // 開發伺服器（自動編譯 CSS）
    "build": "ng build"     // 生產環境構建
  }
}
```

**為什麼重要：**
- PostCSS、Tailwind、Autoprefixer 必須安裝才能運作
- Angular CLI 會自動偵測並使用這些工具

---

### 2️⃣ postcss.config.js - PostCSS 配置
**位置:** `/postcss.config.js`
**作用:** 告訴 PostCSS 要使用哪些插件處理 CSS

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},      // 處理 @tailwind 指令
    autoprefixer: {},     // 添加瀏覽器前綴
  },
};
```

#### 工作流程
```
1. Angular 構建系統發現 CSS 需要處理
   ↓
2. 自動調用 PostCSS（因為偵測到 postcss.config.js）
   ↓
3. PostCSS 載入 tailwindcss 插件
   ↓
4. Tailwind 讀取 tailwind.config.js
   ↓
5. PostCSS 載入 autoprefixer 插件
   ↓
6. 輸出最終處理過的 CSS
```

**與哪些檔案關聯：**
- ✅ 被 Angular CLI 自動調用（透過 `angular.json`）
- ✅ 調用 `tailwind.config.js` 獲取配色定義
- ✅ 處理 `src/styles.scss` 中的 `@tailwind` 指令

---

### 3️⃣ tailwind.config.js - Tailwind 配色定義
**位置:** `/tailwind.config.js`
**作用:** 定義 Tailwind 的配色系統和工具類

```javascript
module.exports = {
  content: [
    "./src/**/*.{html,ts}",  // 掃描這些檔案以生成 CSS
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 五大農業配色在這裡定義
        base: {
          DEFAULT: '#FCFAF8',
          100: '#FCFAF8',
          // ... 其他漸層
        },
        primary: {
          DEFAULT: '#2D5A27',
          500: '#2D5A27',
          // ... 其他漸層
        },
        // ... secondary, accent, text
      },
    },
  },
};
```

#### Tailwind 如何運作
```
1. 掃描 src/**/*.{html,ts} 所有檔案
   ↓
2. 找出使用的類別（如 bg-primary, text-base）
   ↓
3. 根據 theme.extend.colors 生成對應的 CSS
   ↓
4. 只生成有使用到的 CSS（Tree-shaking）
```

**生成的 CSS 範例：**
```css
/* 根據 tailwind.config.js 生成 */
.bg-primary {
  background-color: #2D5A27;
}
.bg-base {
  background-color: #FCFAF8;
}
.text-text {
  color: #353935;
}
```

**與哪些檔案關聯：**
- ✅ 被 `postcss.config.js` 的 tailwindcss 插件調用
- ✅ 掃描 `src/**/*.{html,ts}` 找出使用的類別
- ✅ 配色被 `src/styles.scss` 使用（透過 `@apply`）

---

### 4️⃣ src/styles.scss - 全局樣式入口
**位置:** `/src/styles.scss`
**作用:** 專案的主要樣式文件

```scss
/* 1. 引入 Tailwind CSS */
@tailwind base;        // 重置樣式、基礎樣式
@tailwind components;  // 組件樣式層
@tailwind utilities;   // 工具類樣式

/* 2. 引入 PrimeIcons */
@import "primeicons/primeicons.css";

/* 3. CSS 變數定義 - 農業風格配色 */
@layer base {
  :root {
    /* 定義 CSS 變數供其他地方使用 */
    --color-base: 252 250 248;
    --color-primary: 45 90 39;
    --color-secondary: 139 157 119;
    --color-accent: 212 163 115;
    --color-text: 53 57 53;
  }
}

/* 4. 全局樣式 */
body {
  background-color: rgb(var(--color-base));
  color: rgb(var(--color-text));
}

/* 5. PrimeNG 組件自定義樣式 */
@layer components {
  .p-button-primary {
    @apply bg-primary text-base hover:bg-primary-600;
  }

  .dashboard-card {
    @apply bg-base border border-secondary-200 rounded-xl p-6;
  }
}
```

#### @layer 的作用
```
@layer base       → 基礎樣式（優先級最低）
@layer components → 組件樣式（中等優先級）
@layer utilities  → 工具類樣式（優先級最高）
```

#### @apply 的作用
```scss
/* 使用 @apply 將 Tailwind 類別轉為 CSS */
.my-custom-class {
  @apply bg-primary text-white px-4 py-2 rounded-lg;
}

/* 編譯後 */
.my-custom-class {
  background-color: #2D5A27;
  color: #ffffff;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  border-radius: 0.5rem;
}
```

**與哪些檔案關聯：**
- ✅ 被 `angular.json` 指定為樣式入口
- ✅ 使用 `tailwind.config.js` 定義的配色
- ✅ 被 `postcss.config.js` 處理（`@tailwind` 指令）
- ✅ 供 Angular 組件使用（全局樣式）

---

### 5️⃣ angular.json - Angular 構建配置
**位置:** `/angular.json`
**作用:** 告訴 Angular CLI 如何構建專案

```json
{
  "projects": {
    "sundayZ": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "src/styles.scss"  // 👈 指定樣式入口
            ],
            "inlineStyleLanguage": "scss"
          }
        }
      }
    }
  }
}
```

#### 構建流程
```
1. ng build 或 ng serve
   ↓
2. Angular CLI 讀取 angular.json
   ↓
3. 找到 styles: ["src/styles.scss"]
   ↓
4. 偵測到 postcss.config.js 存在
   ↓
5. 自動調用 PostCSS 處理 styles.scss
   ↓
6. PostCSS 執行 tailwindcss 和 autoprefixer
   ↓
7. 輸出最終 CSS 到 dist/
```

**與哪些檔案關聯：**
- ✅ 指定 `src/styles.scss` 為樣式入口
- ✅ 自動偵測並使用 `postcss.config.js`

---

### 6️⃣ src/app/app.config.ts - PrimeNG 配置
**位置:** `/src/app/app.config.ts`
**作用:** 配置 PrimeNG 主題和 Angular 應用

```typescript
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: Aura,  // 使用 Aura 主題
        options: {
          prefix: 'p',
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities'
          }
        }
      }
    })
  ]
};
```

#### cssLayer 的作用
```
tailwind-base       → Tailwind 基礎樣式（最底層）
primeng             → PrimeNG 組件樣式（中間層）
tailwind-utilities  → Tailwind 工具類（最上層，可覆蓋）
```

**這樣設計的好處：**
- PrimeNG 提供基礎樣式
- Tailwind utilities 可以覆蓋 PrimeNG 樣式
- 例如：`<p-button class="bg-accent">` 可以覆蓋按鈕顏色

**與哪些檔案關聯：**
- ✅ 使用 `tailwind.config.js` 定義的配色（透過 Tailwind 類別）
- ✅ 與 `src/styles.scss` 配合（CSS 層級順序）

---

## 構建流程

### 開發模式 (`npm start`)
```
1. 執行 ng serve
   ↓
2. Angular CLI 讀取 angular.json
   ↓
3. 載入 src/styles.scss
   ↓
4. 偵測到 postcss.config.js
   ↓
5. PostCSS 執行 tailwindcss 插件
   │ ├─ 讀取 tailwind.config.js
   │ ├─ 掃描 src/**/*.{html,ts}
   │ ├─ 生成使用到的 Tailwind CSS
   │ └─ 處理 @tailwind 指令
   ↓
6. PostCSS 執行 autoprefixer 插件
   │ └─ 添加瀏覽器前綴（-webkit-, -moz-, -ms-）
   ↓
7. Angular 編譯組件
   │ └─ 應用 PrimeNG 主題（app.config.ts）
   ↓
8. 開發伺服器啟動（localhost:4200）
   ↓
9. 熱重載監聽檔案變化
   └─ 檔案改變 → 重新執行步驟 3-7
```

### 生產構建 (`npm run build`)
```
1. 執行 ng build
   ↓
2. 與開發模式相同的步驟 2-7
   ↓
3. 額外的優化：
   │ ├─ CSS 壓縮
   │ ├─ 移除未使用的 CSS（PurgeCSS）
   │ ├─ JavaScript 打包和壓縮
   │ └─ 檔案名稱加上 hash（快取管理）
   ↓
4. 輸出到 dist/sundayZ/browser/
   ├─ styles-XXXXXXXX.css  （包含所有樣式）
   ├─ main-XXXXXXXX.js     （應用程式代碼）
   └─ index.html           （入口 HTML）
```

---

## 配色系統實現

### 流程圖：從定義到使用

```
1. tailwind.config.js 定義配色
   ↓
   colors: {
     primary: { DEFAULT: '#2D5A27', ... },
     base: { DEFAULT: '#FCFAF8', ... }
   }
   ↓
2. src/styles.scss 定義 CSS 變數
   ↓
   :root {
     --color-primary: 45 90 39;
     --color-base: 252 250 248;
   }
   ↓
3. PostCSS + Tailwind 生成工具類
   ↓
   .bg-primary { background-color: #2D5A27; }
   .bg-base { background-color: #FCFAF8; }
   .text-text { color: #353935; }
   ↓
4. 在組件中使用
   ↓
   HTML: <div class="bg-base text-text">
   或
   SCSS: @apply bg-base text-text;
```

### 三種使用方式

#### 方式 1: Tailwind 類別（推薦）
```html
<div class="bg-primary text-base">
  森林深綠背景，白色文字
</div>
```

#### 方式 2: CSS 變數
```html
<div style="background-color: rgb(var(--color-primary))">
  使用 CSS 變數
</div>
```

#### 方式 3: @apply 指令
```scss
.my-custom-card {
  @apply bg-base border border-secondary-200 rounded-lg p-4;
}
```

---

## 實際運作範例

### 範例 1: 使用 Tailwind 類別

**HTML (組件模板):**
```html
<button class="bg-primary text-base px-4 py-2 rounded-lg">
  提交
</button>
```

**處理流程:**
```
1. Tailwind 掃描到 "bg-primary"
   ↓
2. 查找 tailwind.config.js
   ↓
   colors: { primary: { DEFAULT: '#2D5A27' } }
   ↓
3. 生成 CSS
   ↓
   .bg-primary { background-color: #2D5A27; }
   ↓
4. Autoprefixer 添加前綴（如果需要）
   ↓
5. 輸出到最終 CSS 檔案
```

**最終生成的 CSS:**
```css
.bg-primary {
  background-color: #2D5A27;
}
.text-base {
  color: #FCFAF8;
}
.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}
.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
.rounded-lg {
  border-radius: 0.5rem;
}
```

---

### 範例 2: PrimeNG 組件 + Tailwind

**HTML:**
```html
<p-button
  label="儲存"
  severity="primary"
  class="shadow-lg"
/>
```

**處理流程:**
```
1. PrimeNG 應用 Aura 主題的 primary 樣式
   ↓
   (來自 app.config.ts 的 providePrimeNG)
   ↓
2. Tailwind 處理 "shadow-lg" 類別
   ↓
3. CSS Layer 順序決定優先級
   ↓
   tailwind-base → primeng → tailwind-utilities
   ↓
4. 最終樣式 = PrimeNG 基礎 + Tailwind 覆蓋
```

**最終效果:**
- PrimeNG 提供按鈕結構和基礎樣式
- Aura 主題提供 primary 顏色（但被 Tailwind 覆蓋）
- Tailwind 的 `shadow-lg` 添加陰影效果

---

### 範例 3: 自定義組件樣式

**SCSS (src/styles.scss):**
```scss
@layer components {
  .dashboard-card {
    @apply bg-base border border-secondary-200 rounded-xl p-6 shadow-sm;
  }
}
```

**HTML:**
```html
<div class="dashboard-card">
  <h3>今日產量</h3>
  <p>1,234 公斤</p>
</div>
```

**處理流程:**
```
1. PostCSS 處理 @layer components
   ↓
2. Tailwind 處理 @apply 指令
   ↓
3. 將 Tailwind 類別展開為 CSS
   ↓
   .dashboard-card {
     background-color: #FCFAF8;
     border: 1px solid #CFD7C3;
     border-radius: 0.75rem;
     padding: 1.5rem;
     box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
   }
   ↓
4. 輸出到 components 層
```

---

## 檔案關聯總結圖

```
package.json (依賴定義)
    ↓ 安裝
    ├─ postcss
    ├─ tailwindcss
    ├─ autoprefixer
    └─ primeng

postcss.config.js (PostCSS 配置)
    ↓ 使用插件
    ├─ tailwindcss → 讀取 tailwind.config.js
    └─ autoprefixer

tailwind.config.js (配色定義)
    ↓ 提供配色給
    ├─ PostCSS tailwindcss 插件
    └─ 掃描 src/**/*.{html,ts}

src/styles.scss (樣式入口)
    ↓ 被處理
    ├─ PostCSS + Tailwind (處理 @tailwind)
    └─ 生成 CSS 變數和自定義樣式

angular.json (構建配置)
    ↓ 指定
    ├─ styles: ["src/styles.scss"]
    └─ 自動調用 PostCSS

src/app/app.config.ts (應用配置)
    ↓ 配置
    ├─ PrimeNG Aura 主題
    └─ CSS Layer 順序

最終輸出 (dist/sundayZ/browser/)
    ├─ styles-*.css (包含所有樣式)
    └─ index.html (載入 CSS)
```

---

## 常見問題

### Q1: 修改 tailwind.config.js 後需要重啟嗎？
**A:** 需要。Tailwind 配置只在啟動時讀取一次。
```bash
# 停止開發伺服器 (Ctrl+C)
npm start  # 重新啟動
```

### Q2: 修改 src/styles.scss 後會自動更新嗎？
**A:** 會。開發模式下有熱重載，樣式會自動更新。

### Q3: 為什麼要用 CSS 變數和 Tailwind 配色兩種方式？
**A:**
- **Tailwind 配色**: 用於 HTML 類別 (`bg-primary`)
- **CSS 變數**: 用於動態計算和 JavaScript 操作

### Q4: 可以移除 postcss.config.js 嗎？
**A:** 不行。沒有它，Tailwind 的 `@tailwind` 指令無法被處理。

### Q5: 如何確認配色是否正確應用？
```bash
# 構建專案
npm run build

# 檢查生成的 CSS
cat dist/sundayZ/browser/styles-*.css | grep "bg-primary"
```

---

## 總結

### 核心檔案（不可移除）
1. ✅ **package.json** - 定義所有依賴
2. ✅ **postcss.config.js** - PostCSS 配置
3. ✅ **tailwind.config.js** - Tailwind 配色定義
4. ✅ **src/styles.scss** - 樣式入口
5. ✅ **angular.json** - 構建配置

### 配置檔案（應用層）
6. ✅ **src/app/app.config.ts** - PrimeNG 配置

### 參考文檔（非必要但有幫助）
7. 📖 **AGRICULTURE_COLOR_GUIDE.md** - 配色使用指南
8. 📖 **PRIMENG_UNSTYLED_GUIDE.md** - PrimeNG 使用指南
9. 📖 **CONFIG_EXPLANATION.md** - 本檔案

---

## 下一步

1. 閱讀 [AGRICULTURE_COLOR_GUIDE.md](AGRICULTURE_COLOR_GUIDE.md) 了解如何使用配色
2. 在組件中實際使用配色系統
3. 有問題隨時參考本文檔

希望這份詳細的說明能幫助您理解整個配置架構！
