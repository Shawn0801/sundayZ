# 需求

# 分成提供view在儀表板顯示，跟edit在獨立menu頁面顯示
農務日誌系統需求規格 (Farmer Journal)
1. 系統目標
讓農夫能以最低的輸入負擔紀錄日常農務，並將數據回饋至儀表板，輔助採收與防護決策。

2. 儀表板顯示功能 (View Component)
這部分位於首頁 Dashboard 的 Bento Grid 卡片中，採「摘要式」顯示。

A. 今日待辦 / 狀態摘要
即時警示：若當前有正在進行中的「安全採收期（PHI）」倒數，顯示紅色進度條。

最近三筆紀錄：顯示最近的操作類型與時間（例如：1 小時前 施肥）。

B. 快速操作入口
一鍵紀錄按鈕：提供幾個常用的大按鈕（噴藥、施肥、採收、筆記），點擊後跳轉至 Edit 頁面。

C. 關鍵數據關聯
環境連動：顯示「上次噴藥後的累積雨量」（幫助判斷藥效是否被沖刷）。

3. 獨立管理頁功能 (Full Edit Menu)
這部分位於側邊欄選單的「農務日誌」獨立頁面。

A. 新增日誌 (Add / Edit Form)
提供表單填寫，欄位包含：

操作類型 (Type)：[下拉選單] 施肥、噴藥、採收、除草、整地、觀察紀錄。

資材名稱 (Name)：[搜尋框] 連動農藥/肥料資料庫。

使用劑量 (Quantity)：數字輸入 + 單位（如：c.c.、包）。

安全採收期 (PHI)：若類型為「噴藥」，需輸入天數（自動計算預計可採收日期）。

照片上傳 (Image)：支援田間實況拍照存檔。

備註 (Notes)：自由文字輸入。

B. 過去日誌查詢 (Log History)
時間軸視圖 (Timeline View)：以時間倒序排列的所有農務軌跡。

過濾篩選 (Filter)：可按「日期區間」或「操作類型」快速尋找紀錄。

數據統計：本月累計噴藥次數、施肥次數摘要。

4. 資料欄位定義 (Firestore Schema)
Markdown
| 欄位名稱 (Field) | 類型 (Type) | 說明 (Description) |
| :--- | :--- | :--- |
| `id` | String | Firestore 自動生成 ID |
| `userId` | String | 農夫唯一辨識碼 |
| `timestamp` | Timestamp | 紀錄發生的時間 |
| `type` | String | 動作分類 (Pesticide / Fertilizer / Harvest 等) |
| `targetCrop` | String | 對應作物 (如：青江菜、高麗菜) |
| `itemName` | String | 資材名稱 (如：益達胺) |
| `phi_days` | Number | 安全採收天數 (計算倒數用) |
| `phi_end_date` | Timestamp | 計算後的安全期截止日期 |
| `notes` | String | 備註文字 |
| `imageUrl` | String | 圖片存儲路徑 (Firebase Storage) |
5. 核心邏輯 (Business Logic)
安全期連動：當日誌中有一筆 type: 'Pesticide' 被新增，儀表板的「噴藥提醒」Widget 必須讀取最新的 phi_end_date 進行倒數。

離線支援：Firestore 開啟 persistence，確保農夫在網速慢的田間也能儲存成功。

預測關聯：日記中的「採收紀錄」可與「交易行情」圖表比對，幫助農夫分析獲利趨勢。
