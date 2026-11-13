# API Documentation

Base：Express app（`packages/api/src/index.ts`），預設 port `3000`（`PORT` 環境變數）。所有 JSON 錯誤格式為 `{ "error": string }`。

驗證：`Authorization: Bearer <JWT>`，JWT payload `{ id, email, role }`，有效期 7 天（`middleware/auth.ts`）。

速率限制（`middleware/rateLimit.ts`）：`authRateLimit` 每 15 分鐘 20 次；`protectedRouteRateLimit` 每 15 分鐘 300 次。

## REST Endpoints

| Method | Path | Middleware | Request | Response |
|---|---|---|---|---|
| POST | `/api/auth/login` | authRateLimit | `{ email, password }` | 200 `{ token, user{id,email,name,role} }`；401 |
| POST | `/api/auth/register` | authRateLimit | `{ email, password, name }` | 201 `{ token, user }`（role 固定 `customer`）；400 email 重複 |
| GET | `/api/products` | 無 | — | 200 `Product[]`（依 `created_at DESC`） |
| GET | `/api/products/:id` | 無 | — | 200 `Product`；404 |
| POST | `/api/products` | rate, auth, admin | `{ name, description, price, stock, image_url }` | 201 Product |
| PUT | `/api/products/:id` | rate, auth, admin | 同上 | 200 Product（不檢查是否存在） |
| DELETE | `/api/products/:id` | rate, auth, admin | — | 204 |
| POST | `/api/products/generate-image` | rate, auth, admin | `{ productName, description }` | 200 `{ imageUrl }`；500 |
| GET | `/api/orders` | rate, auth | — | admin：全部訂單含 `user_name`、`user_email`；customer：自己的訂單 |
| GET | `/api/orders/:id` | rate, auth | — | 200 Order + `items[]`（含 `product_name`）；403 非本人；404 |
| POST | `/api/orders` | rate, auth | `{ items: [{ product_id, quantity }] }` | 201 `{ id, subtotal, gst, total, status:'pending' }`；400 庫存不足 |
| PATCH | `/api/orders/:id/status` | rate, auth, admin | `{ status }` | 200 `{ id, status }` |
| GET | `/api/analytics/dashboard` | rate, auth, admin | — | `{ summary{totalRevenue,totalOrders,totalProducts,lowStockItems}, recentOrders, topProducts, ordersByStatus }` |
| GET | `/api/analytics/inventory` | rate, auth, admin | — | `[{ id, name, stock, price, status: in_stock/low_stock/out_of_stock }]` |

靜態檔：`GET /images/<file>` 由 `express.static(api/public/images)` 提供。

## 資料契約

- `Product`：`id, name, description, price (REAL), stock (INTEGER), image_url, created_at`
- `Order`：`id, user_id, subtotal, gst, total (REAL), status ∈ {pending, processing, shipped, delivered, cancelled}, created_at`
- `OrderItem`：`id, order_id, product_id, quantity, price`（下單當下單價）
- `User`：`id, email (UNIQUE), password (bcrypt), name, role ∈ {admin, customer}, created_at`

## 外部 API

- **Amazon Bedrock Runtime** `InvokeModel`，model `amazon.nova-canvas-v1:0`，`TEXT_IMAGE`，512x512，region 取 `AWS_REGION`（預設 `us-east-1`），憑證走 AWS SDK 預設 credential chain。

## 前端呼叫對照

| 頁面 / 模組 | 呼叫的 endpoint |
|---|---|
| `AuthContext` | login、register |
| `Storefront` | GET products |
| `ProductDetail` | GET products/:id、POST orders |
| `Orders` | GET orders |
| `AdminDashboard` | GET analytics/dashboard |
| `AdminInventory` | GET analytics/inventory |
| `AdminOrders` | GET orders、PATCH orders/:id/status |
| `AdminProducts` | GET/POST/PUT/DELETE products、POST products/generate-image |

`GET /api/orders/:id` 目前沒有前端使用者。
