## 範圍（FR2.1、FR2.2、FR2.4、FR3.1 顯示、NFR5）
- 登入後每 10 秒在頁面隨機位置冒一坨便便，最多 3 坨；點掉呼叫 `POST /api/points/earn`，顯示「+10 ★」並更新頁首餘額，吉祥物開心
- 未登入不出現便便，掌機顯示「登入來幫我清便便！」
- 頁首顯示點數餘額；商品列表／商品頁顯示「★ N 點」
- 便便為可鍵盤聚焦的按鈕，aria-label「清掉便便，加 10 點」

## 相依
- 「[前端] 像素主題與右下角掌機吉祥物」的觸發函式（可先 stub）
- 後端點數 API（可先依合約 mock）

### 共用 API 合約
- 商品物件新增 `point_price`：`max(1, ceil(price))`
- `GET /api/me/points` → `{ "balance": number }`（需登入）
- `POST /api/points/earn` → `{ "balance": number }`；同一帳號任何 10 秒內最多成功 3 次，超過回 `429` 且不加點；每次 +10

規格來源：AIDLC 需求文件 `inception/requirements-analysis/requirements.md`、線框圖 `ideation/rough-mockups/wireframes.md`。
