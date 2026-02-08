# PrimeNG Unstyled 模式使用指南

## 什麼是 Unstyled 模式？

PrimeNG 的 Unstyled 模式讓你可以完全使用 Tailwind CSS（或其他 CSS 框架）來設計組件，而不受 PrimeNG 預設樣式的限制。

## 三種使用方式

### 方式 1: 完全使用主題（目前使用 ✅）

**app.config.ts**
```typescript
providePrimeNG({
  theme: {
    preset: Aura,  // 使用 Aura 主題
    options: {
      darkModeSelector: 'class',
      cssLayer: false
    }
  }
})
```

**優點：**
- 有基礎樣式，不需要從零開始
- 可以用 Tailwind 覆蓋
- 支援深色模式

**適合：** 快速開發，需要基礎樣式的專案

---

### 方式 2: PassThrough API（部分自訂）

為特定組件使用 Tailwind 類別：

```typescript
// 在組件中使用
<p-button
  label="Click me"
  [pt]="{
    root: { class: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg' },
    label: { class: 'font-bold' }
  }"
/>
```

**或在 app.config.ts 全局設定：**
```typescript
providePrimeNG({
  theme: {
    preset: Aura
  },
  pt: {
    button: {
      root: { class: 'custom-button-class' },
      label: { class: 'custom-label-class' }
    }
  }
})
```

**優點：**
- 靈活控制每個組件
- 保留組件功能
- 可以混合使用主題和自訂樣式

**適合：** 需要精細控制樣式的專案

---

### 方式 3: 完全 Unstyled（移除所有樣式）

```typescript
// app.config.ts
providePrimeNG({
  // 不設定任何 theme
  pt: {
    button: {
      root: { class: 'bg-blue-500 px-4 py-2 rounded' }
    },
    // 為每個使用的組件定義樣式
  }
})
```

**注意：** 需要為所有組件定義完整的樣式

**優點：**
- 完全控制
- 包體積更小
- 完全符合設計系統

**缺點：**
- 需要大量工作
- 需要為每個組件定義樣式

**適合：** 有完整設計系統的大型專案

---

## 實際範例

### 使用 PassThrough 自訂 Button

```typescript
// header.component.html
<p-button
  label="Submit"
  icon="pi pi-check"
  [pt]="{
    root: {
      class: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-300'
    },
    icon: { class: 'text-lg mr-2' },
    label: { class: 'text-base' }
  }"
/>
```

### 全局配置 PassThrough

```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'class',
          cssLayer: false
        }
      },
      pt: {
        // 全局按鈕樣式
        button: {
          root: {
            class: 'transition-all duration-200 hover:shadow-lg'
          }
        },
        // 全局輸入框樣式
        inputtext: {
          root: {
            class: 'border-2 border-gray-300 focus:border-blue-500 rounded-lg px-4 py-2'
          }
        }
      }
    })
  ]
};
```

---

## 目前專案建議

**保持現有配置**，因為：

1. ✅ 已經有 Aura 主題提供基礎樣式
2. ✅ 使用 Tailwind 覆蓋和擴展樣式效果很好
3. ✅ 支援深色模式
4. ✅ 開發速度快

**如果需要更多自訂：**

- 使用 PassThrough API 針對特定組件
- 在 HTML 中直接添加 Tailwind classes（像現在這樣）
- 不需要完全 unstyled

---

## 參考資源

- [PrimeNG PassThrough 文檔](https://primeng.org/passthrough)
- [PrimeNG Tailwind 整合](https://primeng.org/tailwind)
- [@primeuix/themes 文檔](https://primeng.org/theming)

---

## 總結

你目前的配置（方式 1）是最佳選擇，因為：
- 快速開發
- 樣式一致
- 可以用 Tailwind 輕鬆覆蓋
- 不需要從零開始設計每個組件

只有在需要完全自訂設計系統時，才考慮使用完全 unstyled 模式。
