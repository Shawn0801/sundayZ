# 按鈕樣式使用指南

## 🎯 快速開始

現在您可以用簡潔的類別名稱來建立按鈕，不需要寫一大串 Tailwind 類別！

---

## 📦 基本按鈕

### 實心按鈕 (Solid Buttons)

```html
<!-- 主色按鈕（森林深綠） - 用於主要操作 -->
<button class="btn-primary">主要操作</button>

<!-- 次色按鈕（鼠尾草綠） - 用於次要操作 -->
<button class="btn-secondary">次要操作</button>

<!-- 點綴色按鈕（麥稈焦糖） - 用於強調操作 -->
<button class="btn-accent">強調操作</button>

<!-- 危險按鈕（紅色） - 用於刪除等危險操作 -->
<button class="btn-danger">刪除</button>
```

**預覽：**
| 類別 | 背景色 | 文字色 | 用途 |
|------|--------|--------|------|
| `btn-primary` | 森林深綠 #2D5A27 | 暖胚白 | 主要操作（提交、儲存） |
| `btn-secondary` | 鼠尾草綠 #8B9D77 | 暖胚白 | 次要操作（取消、返回） |
| `btn-accent` | 麥稈焦糖 #D4A373 | 石墨深灰 | 強調操作（立即行動） |
| `btn-danger` | 紅色 #ef4444 | 暖胚白 | 危險操作（刪除、重置） |

---

## 🔲 輪廓按鈕 (Outline Buttons)

只有邊框，沒有背景色，滑鼠移上去才有背景。

```html
<!-- 主色輪廓 -->
<button class="btn-outline-primary">主要輪廓</button>

<!-- 次色輪廓 -->
<button class="btn-outline-secondary">次要輪廓</button>

<!-- 點綴色輪廓 -->
<button class="btn-outline-accent">強調輪廓</button>
```

**適合場景：**
- 不想太突出的按鈕
- 與實心按鈕搭配使用
- 需要保持頁面清爽的地方

---

## 📝 文字按鈕 (Text Buttons)

沒有邊框、沒有背景，只有文字，滑鼠移上去有淡色背景。

```html
<!-- 主色文字按鈕 -->
<button class="btn-text-primary">查看更多</button>

<!-- 點綴色文字按鈕 -->
<button class="btn-text-accent">編輯</button>
```

**適合場景：**
- 次要連結
- 表格中的操作按鈕
- 不想干擾視覺的地方

---

## 📏 按鈕尺寸

可以搭配尺寸類別：

```html
<!-- 小按鈕 -->
<button class="btn-primary btn-sm">小按鈕</button>

<!-- 標準按鈕（預設） -->
<button class="btn-primary">標準按鈕</button>

<!-- 大按鈕 -->
<button class="btn-primary btn-lg">大按鈕</button>
```

| 類別 | 內距 | 字體大小 | 圓角 | 用途 |
|------|------|----------|------|------|
| `btn-sm` | px-3 py-1.5 | text-sm | rounded-md | 表格、卡片中的小按鈕 |
| （預設） | px-5 py-2.5 | 預設 | rounded-lg | 一般按鈕 |
| `btn-lg` | px-8 py-4 | text-lg | rounded-xl | 首頁、重要 CTA 按鈕 |

---

## 🎨 組合使用範例

### 範例 1: 表單按鈕組
```html
<div class="flex gap-2">
  <button class="btn-primary">儲存</button>
  <button class="btn-secondary">取消</button>
</div>
```

### 範例 2: 對話框按鈕
```html
<div class="flex justify-end gap-2">
  <button class="btn-outline-secondary">取消</button>
  <button class="btn-danger">確認刪除</button>
</div>
```

### 範例 3: 首頁 CTA
```html
<div class="flex flex-col gap-3 items-center">
  <button class="btn-accent btn-lg">立即開始</button>
  <button class="btn-text-primary">了解更多</button>
</div>
```

### 範例 4: 表格操作按鈕
```html
<div class="flex gap-1">
  <button class="btn-text-primary btn-sm">編輯</button>
  <button class="btn-text-accent btn-sm">查看</button>
  <button class="btn-text-primary btn-sm">刪除</button>
</div>
```

### 範例 5: 卡片動作
```html
<div class="dashboard-card">
  <h3 class="text-lg font-semibold mb-4">作物狀態</h3>
  <p class="text-text-400 mb-4">健康度良好</p>
  <div class="flex gap-2">
    <button class="btn-primary btn-sm">查看詳情</button>
    <button class="btn-outline-primary btn-sm">編輯</button>
  </div>
</div>
```

---

## 🔧 帶圖示的按鈕

使用 PrimeIcons 或其他圖示庫：

```html
<!-- 左側圖示 -->
<button class="btn-primary">
  <i class="pi pi-check mr-2"></i>
  儲存
</button>

<!-- 右側圖示 -->
<button class="btn-accent">
  查看更多
  <i class="pi pi-arrow-right ml-2"></i>
</button>

<!-- 只有圖示 -->
<button class="btn-primary btn-sm">
  <i class="pi pi-trash"></i>
</button>
```

**需要加上 flex 布局：**
```html
<button class="btn-primary inline-flex items-center gap-2">
  <i class="pi pi-check"></i>
  儲存
</button>
```

---

## 🎭 按鈕狀態

### 禁用狀態
```html
<button class="btn-primary" disabled>
  無法點擊
</button>
```

如果需要自定義禁用樣式：
```html
<button class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed" disabled>
  禁用按鈕
</button>
```

### 載入狀態
```html
<button class="btn-primary" disabled>
  <i class="pi pi-spin pi-spinner mr-2"></i>
  載入中...
</button>
```

---

## 📋 完整按鈕類別列表

### 實心按鈕
- `btn-primary` - 森林深綠（主要操作）
- `btn-secondary` - 鼠尾草綠（次要操作）
- `btn-accent` - 麥稈焦糖（強調操作）
- `btn-danger` - 紅色（危險操作）

### 輪廓按鈕
- `btn-outline-primary` - 主色輪廓
- `btn-outline-secondary` - 次色輪廓
- `btn-outline-accent` - 點綴色輪廓

### 文字按鈕
- `btn-text-primary` - 主色文字
- `btn-text-accent` - 點綴色文字

### 尺寸
- `btn-sm` - 小按鈕
- （無類別） - 標準按鈕
- `btn-lg` - 大按鈕

---

## 🎨 視覺層級建議

在一個頁面或區塊中，按鈕的視覺層級應該清晰：

### 主要操作（1個）
```html
<button class="btn-primary">儲存</button>
```

### 次要操作（1-2個）
```html
<button class="btn-secondary">取消</button>
<button class="btn-outline-primary">預覽</button>
```

### 輔助操作（多個）
```html
<button class="btn-text-primary">編輯</button>
<button class="btn-text-primary">刪除</button>
```

**範例：完整的表單**
```html
<form>
  <!-- 表單內容 -->

  <div class="flex justify-between mt-6">
    <!-- 左側次要操作 -->
    <button type="button" class="btn-text-primary">返回</button>

    <!-- 右側主要操作 -->
    <div class="flex gap-2">
      <button type="button" class="btn-secondary">取消</button>
      <button type="submit" class="btn-primary">提交</button>
    </div>
  </div>
</form>
```

---

## 🔍 與 PrimeNG 按鈕的區別

### 自定義按鈕類別（推薦用於簡單場景）
```html
<button class="btn-primary">儲存</button>
```

**優點：**
- ✅ 簡潔，只需一個類別
- ✅ 完全掌控樣式
- ✅ 適合靜態按鈕

### PrimeNG 按鈕（推薦用於複雜功能）
```html
<p-button label="儲存" severity="primary" icon="pi pi-check" />
```

**優點：**
- ✅ 豐富的功能（loading、badge、menu）
- ✅ 無障礙設計
- ✅ 主題整合

**選擇建議：**
- 簡單按鈕 → 用自定義類別 `btn-primary`
- 需要圖示、載入狀態、下拉選單 → 用 PrimeNG `<p-button>`

---

## 💡 進階自定義

如果您需要特殊的按鈕樣式，可以在 `src/styles.scss` 的 `@layer components` 中添加：

```scss
@layer components {
  .btn-gradient {
    @apply btn bg-gradient-to-r from-primary to-secondary text-base;
  }

  .btn-icon-only {
    @apply btn w-10 h-10 p-0 flex items-center justify-center;
  }
}
```

然後在 HTML 中使用：
```html
<button class="btn-gradient">漸層按鈕</button>
<button class="btn-icon-only btn-primary">
  <i class="pi pi-heart"></i>
</button>
```

---

## 📖 總結

### 最常用的按鈕
```html
<!-- 主要操作（用得最多） -->
<button class="btn-primary">確定</button>

<!-- 次要操作 -->
<button class="btn-secondary">取消</button>

<!-- 強調操作 -->
<button class="btn-accent">立即行動</button>

<!-- 危險操作 -->
<button class="btn-danger">刪除</button>
```

### 記住這些組合
- **表單提交**: `btn-primary` + `btn-secondary`
- **對話框**: `btn-outline-secondary` + `btn-danger`
- **卡片動作**: `btn-primary btn-sm`
- **文字連結**: `btn-text-primary`

---

## 🎯 快速決策樹

```
需要按鈕？
  │
  ├─ 是主要操作？ → btn-primary
  │
  ├─ 是次要操作？ → btn-secondary
  │
  ├─ 要吸引注意？ → btn-accent
  │
  ├─ 是危險操作？ → btn-danger
  │
  ├─ 不想太突出？ → btn-outline-*
  │
  └─ 像文字連結？ → btn-text-*

需要調整大小？
  ├─ 在表格/卡片中 → 加上 btn-sm
  └─ 是首頁 CTA → 加上 btn-lg
```

---

有任何疑問或需要新的按鈕樣式，隨時在 `src/styles.scss` 中添加！
