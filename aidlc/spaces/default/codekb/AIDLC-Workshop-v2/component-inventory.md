# Component Inventory

各元件的 endpoint 細節見 `api-documentation.md`；問題清單見 `code-quality-assessment.md`。

## api-server

- 位置：`inventrix-code/packages/api/src/index.ts`
- 職責：建立 Express app、`cors()`、`express.json()`、`/images` 靜態檔、呼叫 `initDb()`、掛載 4 個 router、listen `PORT`
- 相依：database、所有 router

## database

- 位置：`inventrix-code/packages/api/src/db.ts`
- 職責：開啟 `inventrix.db`、建立 4 張表、空 DB 時植入 2 個使用者與 24 項商品、export `db` 單例
- 相依：better-sqlite3、bcrypt

## auth-middleware

- 位置：`inventrix-code/packages/api/src/middleware/auth.ts`
- 職責：`authenticate`（驗證 JWT 並設 `req.user`）、`requireAdmin`、`generateToken`、`AuthRequest` 型別
- 相依：jsonwebtoken、環境變數 `JWT_SECRET`

## rate-limit-middleware

- 位置：`inventrix-code/packages/api/src/middleware/rateLimit.ts`
- 職責：`authRateLimit`、`protectedRouteRateLimit`
- 相依：express-rate-limit

## auth-routes

- 位置：`inventrix-code/packages/api/src/routes/auth.ts`
- 職責：登入、註冊（僅 customer）
- 相依：database、auth-middleware、rate-limit-middleware、bcrypt

## products-routes

- 位置：`inventrix-code/packages/api/src/routes/products.ts`
- 職責：商品公開查詢、admin CRUD、觸發 AI 生成圖
- 相依：database、auth-middleware、rate-limit-middleware、image-generator-service

## orders-routes

- 位置：`inventrix-code/packages/api/src/routes/orders.ts`
- 職責：訂單查詢（依角色）、建立訂單（計價、扣庫存）、admin 變更狀態
- 相依：database、auth-middleware、rate-limit-middleware

## analytics-routes

- 位置：`inventrix-code/packages/api/src/routes/analytics.ts`
- 職責：admin Dashboard 統計與庫存狀態
- 相依：database、auth-middleware、rate-limit-middleware

## image-generator-service

- 位置：`inventrix-code/packages/api/src/services/imageGenerator.ts`
- 職責：呼叫 Bedrock Nova Canvas、把 PNG 寫入 `public/images`、回傳 URL
- 相依：@aws-sdk/client-bedrock-runtime、本機檔案系統

## frontend-app-shell

- 位置：`inventrix-code/packages/frontend/src/main.tsx`、`App.tsx`、`components/Layout.tsx`、`index.css`
- 職責：掛載 React、定義路由與 `ProtectedRoute`、頂部導覽列與全域樣式
- 相依：react-router-dom、auth-context

## auth-context

- 位置：`inventrix-code/packages/frontend/src/context/AuthContext.tsx`
- 職責：`user`/`token` 狀態、login/register/logout、`localStorage` 持久化
- 相依：auth-routes（HTTP）

## customer-pages

- 位置：`inventrix-code/packages/frontend/src/pages/` 的 `Login.tsx`、`Register.tsx`、`Storefront.tsx`、`ProductDetail.tsx`、`Orders.tsx`
- 職責：顧客登入註冊、商品瀏覽、單品下單、訂單列表（本次 intent 的改造目標）
- 相依：auth-context、products-routes、orders-routes

## admin-pages

- 位置：`inventrix-code/packages/frontend/src/pages/` 的 `AdminDashboard.tsx`、`AdminProducts.tsx`、`AdminOrders.tsx`、`AdminInventory.tsx`
- 職責：Admin 後台（本次 intent 要求保持不變）
- 相依：auth-context、products-routes、orders-routes、analytics-routes

## deployment-scripts

- 位置：`inventrix-code/deploy.sh`、`inventrix-code/destroy.sh`、`inventrix-code/setup_info.txt`
- 職責：以 AWS CLI 建立 / 刪除 EC2、Security Group、Key Pair、CloudFront，於 EC2 上安裝 Node 22、pnpm、PM2、nginx 並部署
- 相依：AWS CLI、ssh/scp、本機 `inventrix-key.pem`
