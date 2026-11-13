## 範圍（NFR1、FR5.3）
- 以 `pg` 取代 `better-sqlite3`，所有 route handler 改為 async
- schema 改為 PostgreSQL 語法；新增 `users.points_balance INTEGER NOT NULL DEFAULT 0`、`orders.points_spent INTEGER`
- 連線資訊由環境變數提供（`DATABASE_URL`）
- 本機用 docker compose 起 PostgreSQL 開發
- 下單數量必須為正整數，非法回 400；非法訂單狀態回 400

## 驗收
- 本機以 PostgreSQL 跑通：登入 → 瀏覽 → 下單 → 我的訂單 → 後台頁面正常
- 至少一個測試涵蓋非法數量回 400

### 共用 API 合約（前後端照此並行開發）
- 商品物件新增 `point_price`：`max(1, ceil(price))`
- `GET /api/me/points` → `{ "balance": number }`（需登入）
- `POST /api/points/earn` → `{ "balance": number }`；同一帳號任何 10 秒內最多成功 3 次，超過回 `429` 且不加點；每次 +10
- `POST /api/orders` body `{ "items": [{ "product_id": number, "quantity": number }] }` → `201 { "id", "points_spent", "balance" }`；數量非正整數 `400`；點數不足 `402`；庫存不足 `409`；全部在單一交易內完成
- 既有與新帳號起始點數皆為 0

規格來源：AIDLC 需求文件 `inception/requirements-analysis/requirements.md`。
