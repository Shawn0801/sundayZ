---
name: iot-dashboard-core
description: 農業 IoT 儀表板專業技能。專精於 Angular + Tailwind 農業配色，直接操作實體介面 (MOA/Mock/GCP)，強調 API 的靈活擴張性。
---

# 農業 IoT 儀表板核心規範 (API 擴張版)

## 1. 視覺語彙 (Tailwind)
所有新元件必須優先使用專案已設定的 `tailwind.config.js` 配色：
- **容器背景**: `bg-beige-100` (暖胚白)
- **主要文字/成功**: `text-primary-500` (森林綠)
- **強調/數據標題**: `text-secondary-500` (鼠尾草綠)
- **警告/噴藥採收期**: `text-danger-500` (危險紅)
- **邊框/細節**: `border-primary-100`




## 2. 數據流與擴張原則 (Interface-First)
禁止建立中繼轉換格式。直接使用原始 `interface` 進行數據綁定，以應對未來的 API 變動。
- **現有實體**: 
    - `AutoWeatherStation`: 用於氣象與虛擬濕度顯示。
    - `JournalEntry`: 用於農務紀錄與 PHI 計算。
- **擴張策略 (Future API)**: 
    - 當接入 **GCP IoT Core** 或 **Cloud Functions** API 時，直接在 `DataService` 定義新介面。
    - 元件應具備強大的型別容錯力，使用 `Optional Chaining (?.)` 處理 API 可能缺漏的欄位。

## 3. 邏輯封裝與約束
- **業務邏輯**: 複雜計算（如 `calculateSoilMoisture`）應留在 `DataService` 或靜態 Helper 中，元件只負責渲染。
- **NO Edge AI**: 嚴禁在代碼中引入任何邊緣運算 AI 邏輯。
- **Standalone**: 預設產出 Standalone Components 並使用 `OnPush` 變更檢測策略以優化性能。

## 4. 元件開發建議範例
```typescript
// 範例：直接操作 AutoWeatherStation
@Component({ ... })
export class WeatherCard {
  @Input() data!: AutoWeatherStation;
}

```

## 5. 彈窗統一 
- **成功**: estSuccessDialog
- **失敗/警示**: testErrorDialog
- **失敗配合錯誤代碼**: testErrorWithCode


