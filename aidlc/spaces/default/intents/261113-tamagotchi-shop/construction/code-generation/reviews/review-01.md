## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-13T07:15:18Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | inventrix-code/packages/api/src/routes/products.ts > DELETE handler (see code-summary.md > 已知問題) | PostgreSQL 強制 foreign key，刪除已有訂單明細的商品現在回 500。SQLite 原本會成功刪除。issue #3 要求「後台頁面正常」，這是後台可見的行為退化。 | 批准前決定處理方式。選項：回 409 並附訊息、改成下架（soft delete）、或明確記錄為已接受的退化並排入後續 issue。 | New |
| R-02 | Major | inventrix-code/packages/api/src/routes/orders.ts > createOrder（逐筆 `SELECT ... FOR UPDATE`） | 兩個問題。(1) 同一張訂單重複同一個 `product_id` 時，每筆都對照尚未扣除的庫存，總量可超賣，且 `products.stock` 沒有 CHECK 防止負數。(2) 鎖定順序依請求順序，兩筆訂單 `[1,2]` 與 `[2,1]` 並行會死結，PostgreSQL 中止其中一筆並回 500。這是新加入 `FOR UPDATE` 才出現的新失敗模式。 | 先合併同 `product_id` 的數量再檢查庫存，並依 `product_id` 排序後再鎖定。可選：加 `CHECK (stock >= 0)`。若決定延後，需記錄在 code-summary 並指定 issue。 | New |
| R-03 | Minor | inventrix-code/packages/api/src/__tests__/orders.integration.test.ts > 庫存不足測試 | 該測試在任何寫入前就失敗，沒有驗證「寫入訂單後才失敗」的回滾，所以「單一交易」的承諾沒有被測試證明。 | 增加一個在 `orders` 插入後才失敗的案例（例如第二個商品庫存不足），斷言沒有留下訂單與庫存變動。 | New |
| R-04 | Minor | aidlc/spaces/default/intents/261113-tamagotchi-shop/construction/code-generation/traceability.json > NFR3、FR2.3、FR5.2 | 計畫的追溯表宣稱這三項已部分完成（`DATABASE_URL`、`points_balance`、`points_spent`），traceability 全標 `Deferred`。表達的是「整項未完成」，讀者看不出資料欄位與環境變數已做。 | 在 target 文字註明已完成的部分（例如「欄位已建，endpoint 在 3-points-api」），或保持 Deferred 並在 code-summary 對照。 | New |
| R-05 | Minor | inventrix-code/pnpm-workspace.yaml > better-sqlite3 | 仍列著 `better-sqlite3`（built dependency 設定），已無對應套件。 | 一併移除，避免誤導。 | New |
| R-06 | Minor | inventrix-code/packages/api/src/db.ts > SCHEMA_SQL（`DOUBLE PRECISION` 金額） | 金額用浮點數。這是為了保持 JSON 為 number 的取捨，與原 SQLite 行為一致，但 GST 乘法累積誤差在點數 issue 引入 `ceil(price)` 後會更敏感。 | 在點數 issue 前確認是否維持浮點數，或改 `NUMERIC` 並在輸出轉 number。 | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| vitest run src/__tests__/orders.validation.test.ts | PASS: 4 passed | 非法數量與非法狀態的 400 單元測試可重現。 |
| tsc --noEmit | PASS: 無輸出 | 型別檢查通過。 |
| 整合測試（需要 DATABASE_URL） | 未重跑 | 採用 code-summary 紀錄的 4 passed；本次審查未執行。 |

### Summary

範圍與計畫一致：`pg`、交易、`DATABASE_URL`、點數欄位與 400 驗證都已落地，且單元測試與型別檢查可重現。兩個 Major 需要人在批准前決定處理或延後，分別是商品刪除的 500 退化，以及下單的重複商品超賣與鎖順序死結。
