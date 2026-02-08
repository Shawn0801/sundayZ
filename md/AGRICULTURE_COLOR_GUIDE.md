# 農業風格配色使用指南

## 🎨 配色系統

本專案使用農業主題的五色配色系統，帶給用戶溫暖、自然、專業的視覺體驗。

---

## 五大主色

### 1. 底色 (Base) - 暖胚白色 `#FCFAF8`
**象徵：** 棉麻質感、自然舒適
**用途：** 主要背景色、卡片背景

```html
<!-- Tailwind 使用 -->
<div class="bg-base">暖胚白背景</div>
<div class="bg-base-100">暖胚白背景（同上）</div>
<div class="bg-base-200">稍深的背景</div>

<!-- CSS 變數使用 -->
<div style="background-color: rgb(var(--color-base))">暖胚白背景</div>
```

---

### 2. 主色 (Primary) - 森林深綠 `#2D5A27`
**象徵：** 穩定、專業、生長
**用途：** Navbar、主要按鈕、重要的作物狀態、標題

```html
<!-- Tailwind 使用 -->
<button class="bg-primary text-base">主要按鈕</button>
<div class="bg-primary-500">森林深綠背景</div>
<h1 class="text-primary">主標題</h1>
<div class="border-primary">主色邊框</div>

<!-- PrimeNG 按鈕 -->
<p-button label="提交" severity="primary" />
<p-button label="提交" class="p-button-primary" />
```

**漸層色階：**
- `primary-50` - 極淺綠（適合卡片背景）
- `primary-100` to `primary-400` - 淺到中綠（適合 hover 狀態）
- `primary` / `primary-500` - **主色** `#2D5A27`
- `primary-600` to `primary-900` - 深綠（適合文字、active 狀態）

---

### 3. 次色 (Secondary) - 鼠尾草綠 `#8B9D77`
**象徵：** 柔和、平靜、輔助
**用途：** 次要圖表、卡片標題背景、側邊欄選單、輔助文字

```html
<!-- Tailwind 使用 -->
<div class="bg-secondary text-base">次要卡片</div>
<button class="bg-secondary-500 hover:bg-secondary-600">次要按鈕</button>
<p class="text-secondary-700">輔助文字</p>
<div class="border-secondary-200">柔和邊框</div>

<!-- PrimeNG 按鈕 -->
<p-button label="取消" severity="secondary" />
```

**使用場景：**
- 圖表的次要數據線條
- 側邊欄背景
- 卡片的副標題背景
- 分隔線、邊框

---

### 4. 點綴色 (Accent) - 麥稈焦糖 `#D4A373`
**象徵：** 溫暖、強調、收穫
**用途：** 強調提醒、預測模型的虛線、趨勢上升標示、CTA 按鈕

```html
<!-- Tailwind 使用 -->
<button class="bg-accent text-text">強調按鈕</button>
<div class="bg-accent-100 border-accent">提醒卡片</div>
<span class="text-accent font-bold">+12.5%</span>

<!-- PrimeNG 組件 -->
<p-button label="立即行動" class="p-button-accent" />
<p-message severity="warn" text="注意：需要澆水" />
```

**使用場景：**
- 上升趨勢指標
- 預測數據的虛線
- 重要提醒和通知
- Call-to-Action 按鈕
- 數據高亮顯示

---

### 5. 文字色 (Text) - 石墨深灰 `#353935`
**象徵：** 質感、專業、易讀
**用途：** 正文、數據標籤、標題

```html
<!-- Tailwind 使用 -->
<p class="text-text">正文內容</p>
<h1 class="text-text font-bold text-3xl">主標題</h1>
<span class="text-text-700">深色文字</span>
<span class="text-text-400">淺色文字</span>

<!-- 全局預設 -->
<body> <!-- 已自動套用 text-text 顏色 -->
```

**文字層級：**
- `text-text-900` - 最深（強調標題）
- `text-text` / `text-text-500` - **主要正文** `#353935`
- `text-text-400` - 次要文字
- `text-text-300` - 輔助說明
- `text-text-200` - 淡化文字

---

## 🎯 使用場景示例

### Navbar / Header
```html
<nav class="bg-primary text-base shadow-md">
  <div class="container mx-auto px-4 py-3">
    <h1 class="text-xl font-bold">農業管理系統</h1>
  </div>
</nav>
```

### 儀表板卡片
```html
<div class="dashboard-card">
  <h3 class="text-secondary-700 text-sm font-medium mb-2">今日產量</h3>
  <p class="stat-value">1,234</p>
  <span class="stat-change-positive">
    <i class="pi pi-arrow-up"></i> +8.5%
  </span>
</div>
```

### 數據趨勢
```html
<!-- 上升趨勢 - 使用點綴色 -->
<span class="text-accent font-semibold">
  <i class="pi pi-trending-up"></i> +15%
</span>

<!-- 下降趨勢 - 使用危險色 -->
<span class="text-danger-600 font-semibold">
  <i class="pi pi-trending-down"></i> -5%
</span>
```

### 狀態指示器
```html
<!-- 健康狀態 - 主色 -->
<span class="status-healthy">生長良好</span>

<!-- 警告狀態 - 點綴色 -->
<span class="status-warning">需要關注</span>

<!-- 危急狀態 - 危險色 -->
<span class="status-critical">需要處理</span>

<!-- 非活動 - 次色 -->
<span class="status-inactive">休耕中</span>
```

### PrimeNG 按鈕組合
```html
<!-- 主要操作 -->
<p-button label="儲存" severity="primary" icon="pi pi-check" />

<!-- 次要操作 -->
<p-button label="取消" severity="secondary" icon="pi pi-times" />

<!-- 強調操作 -->
<p-button label="立即執行" class="p-button-accent" icon="pi pi-bolt" />
```

### 訊息提示
```html
<!-- 成功訊息 - 主色 -->
<p-message severity="success" text="作物記錄已成功儲存" />

<!-- 警告訊息 - 點綴色 -->
<p-message severity="warn" text="土壤濕度偏低，建議澆水" />

<!-- 資訊訊息 -->
<p-message severity="info" text="系統將於今晚進行維護" />

<!-- 錯誤訊息 -->
<p-message severity="error" text="無法連接感測器設備" />
```

---

## 📊 配色比例建議

在一個頁面中，建議的配色使用比例：

- **底色 (Base)**: 60% - 主要背景
- **主色 (Primary)**: 20% - Navbar、重要按鈕、標題
- **次色 (Secondary)**: 10% - 卡片標題、邊框、輔助元素
- **點綴色 (Accent)**: 5% - CTA、提醒、強調數據
- **文字色 (Text)**: 5% - 正文內容

---

## 🌗 深色模式

深色模式會自動調整以下顏色：

```html
<!-- 啟用深色模式 -->
<html class="dark">
  <!-- 背景自動變為深綠 -->
  <!-- 文字自動變為淺色 -->
</html>
```

---

## ⚠️ 注意事項

1. **對比度檢查**
   - 主色 (Primary) 背景搭配白色文字 ✅
   - 次色 (Secondary) 背景搭配白色或暗色文字 ✅
   - 點綴色 (Accent) 背景搭配深色文字 ✅
   - 文字色 (Text) 在淺色背景上 ✅

2. **避免使用**
   - 不要在點綴色背景上使用白色文字（對比度不足）
   - 不要過度使用點綴色（建議不超過 5-10%）

3. **無障礙設計**
   - 所有配色均符合 WCAG AA 標準
   - 重要操作使用主色，確保視覺層級清晰

---

## 🎨 顏色預覽

| 顏色名稱 | Hex | RGB | Tailwind Class |
|---------|-----|-----|----------------|
| 底色 (Base) | `#FCFAF8` | `252, 250, 248` | `bg-base` |
| 主色 (Primary) | `#2D5A27` | `45, 90, 39` | `bg-primary` |
| 次色 (Secondary) | `#8B9D77` | `139, 157, 119` | `bg-secondary` |
| 點綴色 (Accent) | `#D4A373` | `212, 163, 115` | `bg-accent` |
| 文字色 (Text) | `#353935` | `53, 57, 53` | `text-text` |

---

## 🔗 相關檔案

- [tailwind.config.js](tailwind.config.js) - Tailwind 配色定義
- [src/styles.scss](src/styles.scss) - CSS 變數和全局樣式
- [src/app/app.config.ts](src/app/app.config.ts) - PrimeNG 主題配置
- [PRIMENG_UNSTYLED_GUIDE.md](PRIMENG_UNSTYLED_GUIDE.md) - PrimeNG 使用指南
