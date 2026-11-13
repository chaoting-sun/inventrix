## 範圍（FR2.2、FR2.3、FR2.5、FR3.1、FR5.1、FR5.2）
- 實作下方合約的三個端點與 `point_price`
- 結帳：單一交易內檢查庫存與點數、扣庫存、扣點、建立訂單；訂單照舊記錄小計／GST／總額，另記 `points_spent`

## 相依
- 「[後端] SQLite 改為 PostgreSQL」的 schema（可先依合約開發）

## 驗收（NFR6）
- 測試：點數入帳 +10、10 秒內第 4 次回 429、點數不足回 402 且資料不變、結帳成功後扣點扣庫存

### 共用 API 合約（前後端照此並行開發）
- 商品物件新增 `point_price`：`max(1, ceil(price))`
- `GET /api/me/points` → `{ "balance": number }`（需登入）
- `POST /api/points/earn` → `{ "balance": number }`；同一帳號任何 10 秒內最多成功 3 次，超過回 `429` 且不加點；每次 +10
- `POST /api/orders` body `{ "items": [{ "product_id": number, "quantity": number }] }` → `201 { "id", "points_spent", "balance" }`；數量非正整數 `400`；點數不足 `402`；庫存不足 `409`；全部在單一交易內完成
- 既有與新帳號起始點數皆為 0

規格來源：AIDLC 需求文件 `inception/requirements-analysis/requirements.md`。
