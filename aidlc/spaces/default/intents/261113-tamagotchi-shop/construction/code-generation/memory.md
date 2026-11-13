<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-13T07:07:25Z — 「回應的欄位與狀態碼維持原樣」解讀為也要保住 `:id` 非數字時的 404：PostgreSQL 對 INTEGER 欄位收到 `abc` 會丟錯（變 500），所以新增 `src/validation.ts` 的 `parseId`，`GET/PUT/DELETE /api/products/:id`、`GET /api/orders/:id`、`PATCH /api/orders/:id/status` 收到非數字 id 回 404。PUT/DELETE 原本對不存在的數字 id 回 200/204，這點不變。
- 2026-11-13T07:13:36Z — `POST /api/orders` 的 `quantity` 只接受 JSON number；字串 `"1"` 回 400。前端 `ProductDetail.tsx` 送的是 `Number(...)`，不受影響。

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-13T07:07:25Z — 預設的 Node v26（Homebrew `node`）無法啟動：缺 `libsimdjson.33.dylib`。所有 `pnpm`、`vitest`、`tsc` 指令改用 `PATH=/opt/homebrew/opt/node@22/bin:$PATH` 執行，與 README 的「Node.js 22」一致。
- 2026-11-13T07:13:36Z — Step 8 的 `docker-compose.yml` 與 `.env` 在 Step 4 執行整合測試前先建立，因為整合測試需要資料庫。內容與 Step 8 一致。
- 2026-11-13T07:13:36Z — `initDb()` 整個包在一個交易內並先取 `pg_advisory_xact_lock`：vitest 平行跑兩個整合測試檔時，兩個 process 同時對空資料庫 `CREATE TABLE IF NOT EXISTS` 會失敗。
- 2026-11-13T07:13:36Z — 整合測試共 4 個（計畫寫 3 個）：`db.integration.test.ts` 的「跑兩次不出錯」與「預設點數 0」拆成兩個 test。
- 2026-11-13T07:13:36Z — `code-summary.md` 與 `traceability.json`（Step 10 第二項）依 brief 由 conductor 撰寫，該勾選框保留未勾。

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-13T07:13:36Z — PostgreSQL 會強制 foreign key，SQLite 原本沒開 `PRAGMA foreign_keys`。刪除已有訂單的商品現在回 500（錯誤有記錄），原本會成功並留下孤兒 `order_items`。計畫要求狀態碼不變，所以沒有自行改成 409。

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-13T07:13:36Z — 刪除已有訂單的商品要回什麼？目前 500。選項：409 並提示、改為軟刪除、或維持。
- 2026-11-13T07:13:36Z — 同一張訂單內重複同一個 `product_id` 時，庫存檢查逐行進行，總量可能超過庫存（原本 SQLite 版就有）。是否在 `3-points-api.md` 一併合併同商品的數量再檢查？
- 2026-11-13T07:13:36Z — `middleware/auth.ts` 的 `JWT_SECRET` 仍有寫死的預設值（既有程式，不在 issue #3 範圍），違反 NFR3 精神，建議另開 issue 處理。
