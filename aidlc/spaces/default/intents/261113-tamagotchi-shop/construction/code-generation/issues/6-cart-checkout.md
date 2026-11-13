## 範圍（FR4、FR5.4、FR5.5）
- 新增 `/cart` 頁；商品頁「直接下單」改為「加入購物車」，數量上限為庫存，售完停用
- 購物車存在瀏覽器，未登入也可加入；結帳時才導向登入，登入後回到購物車
- 顯示點數合計與餘額；點數不足時停用結帳並顯示「還差 ★ N，去清便便吧！」；空購物車提示
- 結帳成功頁：訂單編號、花費點數、剩餘點數，吉祥物跳舞
- 我的訂單顯示每筆點數花費

## 相依
- 吉祥物觸發函式、後端結帳 API（可先依合約 mock）

### 共用 API 合約
- 商品物件新增 `point_price`：`max(1, ceil(price))`
- `GET /api/me/points` → `{ "balance": number }`（需登入）
- `POST /api/orders` body `{ "items": [{ "product_id": number, "quantity": number }] }` → `201 { "id", "points_spent", "balance" }`；數量非正整數 `400`；點數不足 `402`；庫存不足 `409`

規格來源：AIDLC 需求文件 `inception/requirements-analysis/requirements.md`、線框圖 `ideation/rough-mockups/wireframes.md`。
