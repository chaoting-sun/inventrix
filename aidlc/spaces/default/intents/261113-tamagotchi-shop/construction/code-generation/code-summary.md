# Code Summary：issue #3 — SQLite 改為 PostgreSQL，加入點數欄位

這一輪只做 GitHub issue #3（`issues/2-postgres.md`），依人的要求「先做 issue #3」。

## 修改與新增的檔案

路徑都在 `inventrix-code/` 下。

| 檔案 | 動作 | 內容 |
|------|------|------|
| `packages/api/package.json` | 修改 | 移除 `better-sqlite3`；加入 `pg`、`vitest`、`supertest` 與型別；新增 `test` script |
| `pnpm-lock.yaml` | 修改 | `pnpm install` 更新 |
| `packages/api/src/db.ts` | 改寫 | `pg.Pool`、`DATABASE_URL` 必填、`query`、`withTransaction`、`closeDb`、async `initDb`（含點數欄位與 advisory lock） |
| `packages/api/src/app.ts` | 新增 | Express `app`，統一錯誤處理回 500 並記錄 |
| `packages/api/src/index.ts` | 修改 | `await initDb()` 後 listen；失敗時 exit 1 |
| `packages/api/src/middleware/asyncHandler.ts` | 新增 | 把 async handler 的錯誤交給 Express |
| `packages/api/src/validation.ts` | 新增 | `isPositiveInteger`、`parseId`（計畫沒列，用來保住非數字 id 回 404） |
| `packages/api/src/routes/{auth,products,analytics,orders}.ts` | 修改 | 全部改為 async 與 PostgreSQL 語法；下單驗證與交易；狀態驗證 |
| `packages/api/vitest.config.ts` | 新增 | vitest 設定 |
| `packages/api/src/__tests__/*.test.ts` | 新增 | 1 個單元測試檔、2 個整合測試檔 |
| `docker-compose.yml`、`.env.example` | 新增 | 本機 PostgreSQL 16；密碼從 `.env` 讀取 |
| `README.md` | 修改 | 人的既有檔案，計畫有列：Tech Stack、資料庫啟動、測試指令 |

本機另外建立了 `.env`（拋棄式密碼，已被 `.gitignore` 排除，不會提交）。

## 主要實作決策

- 金額用 `DOUBLE PRECISION`，`created_at` 用 `TIMESTAMPTZ`。API 回應的欄位與型別不變，前端不用改。
- `initDb()` 在交易內先取 `pg_advisory_xact_lock`，避免多個 process 同時建表失敗。
- 下單先驗證 `items`，再進交易 `SELECT ... FOR UPDATE`。庫存不足仍回 400，合約的 409 留給點數 issue。
- 非數字的 `:id` 回 404，保住原本的行為。

## 測試結果

| 指令 | 結果 |
|------|------|
| `pnpm --filter api exec vitest run src/__tests__/orders.validation.test.ts` | 4 passed（conductor 另外重跑一次確認） |
| `DATABASE_URL=... pnpm --filter api exec vitest run src/__tests__/db.integration.test.ts src/__tests__/orders.integration.test.ts` | 4 passed，跑在 podman 的 PostgreSQL 16 |
| `pnpm --filter api test`（沒有 `DATABASE_URL`） | 4 passed，4 skipped |
| `pnpm --filter api exec tsc --noEmit`、`pnpm build` | 無錯誤 |

開發者另外對 PostgreSQL 手動用 curl 跑過登入、瀏覽、下單、我的訂單、後台 dashboard 與 inventory、改狀態，結果都符合預期。

## 寫了但沒有執行的測試

None. 所有新增測試都已執行。專案沒有 CI，以上結果都是本機執行。

## 與計畫的差異

- 整合測試 4 個，計畫寫 3 個：`db.integration` 的兩個斷言拆成兩個 test。
- 新增 `src/validation.ts`，計畫沒有列出。
- 執行環境改用 Node 22（`/opt/homebrew/opt/node@22/bin`）。預設的 Node 26 缺 `libsimdjson` 無法啟動，`bcrypt` 也是 native module。

## 已知問題（需要人決定）

- 刪除有訂單的商品，現在回 500。PostgreSQL 強制 foreign key，SQLite 原本不會。舊行為是刪除成功，並留下沒有商品的訂單明細。
- 同一張訂單內重複同一個 `product_id` 時，總數量可能超過庫存。舊程式就有這個問題。
- 庫存不足的測試在任何寫入前就失敗，沒有驗證「寫入後才失敗」的回滾。
- `middleware/auth.ts` 的 `JWT_SECRET` 仍有寫死的預設值，屬於 issue `1-security.md`。
- `deploy.sh` 沒有提供 PostgreSQL，目前無法部署，屬於 issue `7-deploy.md`。
- `pnpm-workspace.yaml` 仍列著 `better-sqlite3`，不影響執行。
