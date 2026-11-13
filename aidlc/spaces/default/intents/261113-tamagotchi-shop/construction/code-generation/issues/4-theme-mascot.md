## 範圍（FR1、FR6）
- 首頁、商品頁、購物車、結帳成功、我的訂單、登入／註冊套用像素／復古掌機風格
- 共用元件：右下角掌機 + 吉祥物，狀態：待機、開心、跳舞、餓了（60 秒無互動）
- 對外提供觸發函式（例如 `mascot.happy()`、`mascot.dance()`）供其他前端 issue 呼叫
- 掌機上的音效開關；`prefers-reduced-motion` 時停用動畫
- 只需支援桌機 Chrome（NFR4）

## 驗收
- 六個頁面都看得到掌機；四種狀態都有動畫；關閉音效後無聲音

規格來源：AIDLC 需求文件 `inception/requirements-analysis/requirements.md`、線框圖 `ideation/rough-mockups/wireframes.md`。其他前端 issue 依賴本 issue 的觸發函式，建議先定介面。
