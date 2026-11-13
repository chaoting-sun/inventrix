# Code Generation 計畫：issue #3 — SQLite 改為 PostgreSQL，加入點數欄位

## Summary

- Builds: API 改用 PostgreSQL（`pg`），schema 加點數欄位，下單在單一交易內完成，數量與訂單狀態的 400 驗證
- Touches: `inventrix-code/packages/api/`（db、routes、app 拆分、package.json、測試）、`inventrix-code/docker-compose.yml`、`.env.example`、README
- Tests: 4 個 API 驗證單元測試（不需資料庫），加 3 個需要本機 PostgreSQL 的整合測試

## 範圍

這一輪只做 GitHub issue #3（`issues/2-postgres.md`），依人的要求「先做 issue #3」。

- 追溯：NFR1（PostgreSQL）、FR5.3（非法數量回 400）、FR2.3 與 FR5.2 的資料欄位部分（`users.points_balance`、`orders.points_spent`）、NFR3 的資料庫密碼部分（`DATABASE_URL` 只從環境變數讀取）。
- 共用 API 合約的端點（`point_price`、`/api/me/points`、`/api/points/earn`、402）屬於 issue `3-points-api.md`，這一輪不做。
- 下單時庫存不足維持現有的 400 回應。合約要求的 409 和點數扣除一起在 `3-points-api.md` 改。
- `deploy.sh` 目前在 EC2 上只跑 API，沒有資料庫。改完後它無法直接部署，部署在 issue `7-deploy.md` 處理。

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "org",
  "ordering": "implement each applicable testable layer, then write and run that layer's tests.",
  "scope": "poc",
  "test_strategy": "minimal",
  "project_type": "brownfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    }
  ],
  "obligations": {
    "strategy": "minimal",
    "strategy_volume": [
      "One verifiable test per requirement at the narrowest effective level.",
      "At least one happy-path unit test per component.",
      "Unit tests are the default; a bugfix/security scope floor may require an integration or E2E regression when that is the narrowest level that reproduces the defect."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Verify the existing test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Verify the existing test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:ddd208517f68585f816e80821872bd21e26dc15e7bf545c6a78ec96b6afc20da",
  "contract_sha256": "sha256:8780c9b6738d34215859c7d0d02b149a16944cf2942a43d2c2dee67268c80df0"
}
```

## 步驟

### Step 1：專案結構與正式設定骨架（NFR1、NFR3）
- [x] `packages/api/package.json`：移除 `better-sqlite3`、`@types/better-sqlite3`；加入 `pg`、`@types/pg`；devDependencies 加入 `vitest`、`supertest`、`@types/supertest`；新增 script `"test": "vitest run"`。
- [x] 拆出 `packages/api/src/app.ts`：建立並 export Express `app`（middleware、routes、靜態圖片、統一錯誤處理 middleware 回 500 並記錄錯誤）。`src/index.ts` 只負責 `await initDb()` 後 `app.listen`；初始化失敗時印出錯誤並以非零狀態結束。
- [x] 新增 `packages/api/src/middleware/asyncHandler.ts`：包裝 async route handler，把 rejection 交給 Express 錯誤處理（Express 4 不會自己接）。

### Step 2：確認測試執行器並記錄指令
- [x] 專案原本沒有任何測試執行器。新增 `packages/api/vitest.config.ts`（`environment: 'node'`，`include: ['src/**/*.test.ts']`）。
- [x] 執行 `pnpm install`，確認 `pnpm --filter api exec vitest run src/__tests__/orders.validation.test.ts` 可以跑（檔案在 Step 7 建立）。指令記錄在 `unit-test-instructions.md`。

### Step 3：資料模型 / 資料庫行為 — 實作（NFR1、FR2.3、FR5.2、NFR3）
- [x] 改寫 `packages/api/src/db.ts`：用 `pg` 的 `Pool`，連線字串只從 `DATABASE_URL` 讀取；缺少時丟出明確錯誤「DATABASE_URL is required」。
- [x] `initDb()` 改為 async，用 PostgreSQL 語法建表：`SERIAL PRIMARY KEY`、`TIMESTAMPTZ DEFAULT now()`、金額用 `DOUBLE PRECISION`（讓 JSON 維持 number，前端 `toFixed` 不受影響）、保留 `role` 與 `status` 的 CHECK 條件。
- [x] 新增欄位 `users.points_balance INTEGER NOT NULL DEFAULT 0`、`orders.points_spent INTEGER`。既有資料庫用 `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` 補上，既有帳號起始點數為 0。
- [x] 保留原本的預設帳號與 24 筆商品種子資料，只在 `users` 為空時寫入。

### Step 4：資料模型 — 測試（整合）
- [x] `packages/api/src/__tests__/db.integration.test.ts`：`initDb()` 跑兩次不出錯；`users.points_balance` 預設為 0。沒有 `DATABASE_URL` 時以 `describe.skipIf` 略過，並在 `code-summary.md` 記錄是否實際執行。

### Step 5：資料存取 — 實作
- [x] `db.ts` export `query(text, params)` 與 `withTransaction(fn)`（`BEGIN` / `COMMIT`，例外時 `ROLLBACK` 並釋放連線）。
- [x] SQLite 的 `?` 參數全部改為 `$1, $2...`；`lastInsertRowid` 改用 `RETURNING id`；`COUNT` / `SUM` 加上 `::int` / `::float` 轉型，避免 `pg` 回傳字串。

### Step 6：API 端點 — 實作（NFR1、FR5.3）
- [x] `routes/auth.ts`、`routes/products.ts`、`routes/analytics.ts`、`routes/orders.ts` 全部改為 async，並用 `asyncHandler` 包裝。回應的欄位與狀態碼維持原樣，只有下面兩項改變。
- [x] `POST /api/orders`：先驗證再碰資料庫。`items` 必須是非空陣列，每筆 `product_id` 為正整數、`quantity` 為正整數，否則回 400 `{ error }`。驗證通過後在 `withTransaction` 內 `SELECT ... FOR UPDATE` 鎖住商品、檢查庫存、建立訂單與明細、扣庫存；任一步失敗全部回滾。庫存不足維持回 400（409 留給點數 issue）。
- [x] `PATCH /api/orders/:id/status`：`status` 不在 `pending | processing | shipped | delivered | cancelled` 時回 400，不碰資料庫；訂單不存在回 404。

### Step 7：API 端點 — 測試
- [x] `packages/api/src/__tests__/orders.validation.test.ts`（單元，用 `supertest` 打 `app`，`vi.mock('../db.js')` 並斷言資料庫沒有被呼叫）：
  - 數量為 0 回 400（FR5.3）
  - 數量為 1.5 回 400（FR5.3）
  - `items` 為空陣列回 400（FR5.3）
  - 非法訂單狀態回 400
- [x] `packages/api/src/__tests__/orders.integration.test.ts`（需要 `DATABASE_URL`，沒有時略過）：
  - 合法下單回 201，庫存正確扣除（NFR1 happy path）
  - 庫存不足回 400，訂單沒有建立、庫存不變（交易回滾）
- [x] 執行 `unit-test-instructions.md` 的指令並記錄結果。

### Step 8：環境 / 建置設定
- [x] 新增 `inventrix-code/docker-compose.yml`：`postgres:16`，資料庫 `inventrix`，port `5432`，具名 volume，帳密從 `.env` 讀取（`POSTGRES_PASSWORD` 不寫死在 compose 檔）。
- [x] 新增 `inventrix-code/.env.example`：`POSTGRES_PASSWORD`、`DATABASE_URL=postgres://inventrix:<password>@localhost:5432/inventrix`。`.env` 已被 `.gitignore` 排除。
- [x] 根目錄 `package.json` 的 `dev` 不變；API 啟動前需要先 `docker compose up -d`。

### Step 9：前端行為
- [x] 不需要修改。API 回應的欄位名稱與型別維持不變（金額仍為 number，`created_at` 為 ISO 字串，`new Date()` 可解析）。

### Step 10：文件與追溯
- [x] 更新 `inventrix-code/README.md`（人的既有檔案，因為資料庫改變，原本的啟動步驟會失效）：Tech Stack 改為 PostgreSQL，Getting Started 加入 `cp .env.example .env`、`docker compose up -d`、`DATABASE_URL`。
- [ ] 寫 `code-summary.md` 與 `traceability.json`。這一輪沒做的需求標為 `Deferred`，target 寫人的原話「先做 issue #3」。

## 追溯

| 步驟 | 需求 |
|------|------|
| Step 3、4、5、6、8 | NFR1 |
| Step 6、7 | FR5.3 |
| Step 3 | FR2.3、FR5.2（只有資料欄位） |
| Step 3、8 | NFR3（只有 `DATABASE_URL`） |
