### 共用 API 合約（前後端照此並行開發）
- 商品物件新增 `point_price`：`max(1, ceil(price))`
- `GET /api/me/points` → `{ "balance": number }`（需登入）
- `POST /api/points/earn` → `{ "balance": number }`；同一帳號任何 10 秒內最多成功 3 次，超過回 `429` 且不加點；每次 +10
- `POST /api/orders` body `{ "items": [{ "product_id": number, "quantity": number }] }` → `201 { "id", "points_spent", "balance" }`；數量非正整數 `400`；點數不足 `402`；庫存不足 `409`；全部在單一交易內完成
- 既有與新帳號起始點數皆為 0

規格來源：AIDLC 需求文件 `aidlc/spaces/default/intents/261113-tamagotchi-shop/inception/requirements-analysis/requirements.md`（FR/NFR 編號出自此檔）；線框圖 `ideation/rough-mockups/wireframes.md`。
