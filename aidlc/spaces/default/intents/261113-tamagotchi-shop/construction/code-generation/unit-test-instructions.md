# 單元測試說明：issue #3（PostgreSQL 遷移）

## 測試框架與設定

- 執行器：`vitest`（新增於 `packages/api`），設定檔 `packages/api/vitest.config.ts`。
- HTTP 測試：`supertest` 直接打 `src/app.ts` export 的 `app`，不啟動伺服器。
- 驗證測試用 `vi.mock('../db.js')` 取代資料庫，並斷言驗證失敗時資料庫沒有被呼叫。測試前設定 `process.env.JWT_SECRET='test-secret'`，用 `generateToken` 產生 token。

## 執行這一輪的測試

在 `inventrix-code/` 目錄下執行。

單元測試（不需要資料庫）：

```bash
pnpm --filter api exec vitest run src/__tests__/orders.validation.test.ts
```

整合測試（需要本機 PostgreSQL）：

```bash
docker compose up -d
DATABASE_URL=postgres://inventrix:<POSTGRES_PASSWORD>@localhost:5432/inventrix pnpm --filter api exec vitest run src/__tests__/db.integration.test.ts src/__tests__/orders.integration.test.ts
```

沒有設定 `DATABASE_URL` 時，整合測試會被略過，不算失敗。

## 預期覆蓋

- Minimal 策略：每個需求一個測試。FR5.3 有 3 個，非法訂單狀態 1 個，NFR1 有 3 個整合測試。
- `poc` scope 沒有 coverage 下限，不設定 coverage 門檻。

## Mocking / stubbing

- 只 mock `../db.js`。不要 mock Express 或驗證邏輯本身。
- 整合測試使用真的 PostgreSQL，不 mock。

## 測試資料

- 整合測試在 `beforeAll` 呼叫 `initDb()`，使用種子資料的預設帳號與商品。
- 每個整合測試自己建立需要的商品與庫存（例如庫存 1 的測試商品），結束後刪除，不依賴其他測試的狀態。
