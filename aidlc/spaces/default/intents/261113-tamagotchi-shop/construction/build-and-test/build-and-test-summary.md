# Build and Test Summary：issue #3（PostgreSQL）

## 整體狀態

建置成功，8 個測試全部通過（4 個單元測試，4 個 PostgreSQL 整合測試）。前置需求是 Node 22 與本機 PostgreSQL（見 `build-instructions.md`）。

## 測試類型

- 單元測試：API 驗證（`orders.validation.test.ts`），mock 資料庫。
- 整合測試：資料庫初始化與下單交易（`db.integration.test.ts`、`orders.integration.test.ts`），在 Node 中打真的 PostgreSQL。
- Minimal 策略，不另外產生 integration、performance、security 測試說明檔。

## Coverage 期望

`poc` scope 沒有 coverage 下限，這一輪沒有設定門檻。

## Target Verification Matrix

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| T-FR5.3 | `requirements.md` FR5.3 | 非法數量回 400 | 3 個測試通過 | `test-results.md` 單元測試 | build-and-test | Met |
| T-STATUS | `issues/2-postgres.md` | 非法訂單狀態回 400 | 1 個測試通過 | `test-results.md` 單元測試 | build-and-test | Met |
| T-NFR1 | `requirements.md` NFR1 | 購物流程在 PostgreSQL 上跑通 | 4 個整合測試通過 | `test-results.md` 整合測試（Node，不是瀏覽器） | build-and-test | Met |
| T-BUILD | `code-generation-plan.md` | 建置成功、無型別錯誤 | 結束碼 0 | `test-results.md` 建置 | build-and-test | Met |
| T-CI | Testing Contract | CI 執行 | 不適用 | the plan runs no CI Pipeline | build-and-test | N/A |
| T-COVERAGE | Testing Contract（poc） | 沒有 coverage 下限 | 不適用 | `poc` 不加 coverage 下限 | build-and-test | N/A |

## 準備程度

- Build-ready：是。
- Test-ready：是。
- Deployment-ready：否。`deploy.sh` 沒有提供 PostgreSQL，部署在 issue `7-deploy.md` 處理。

## 已知限制

- 下單到後台的完整流程只在 Node 中用 HTTP 驗證，沒有在真的瀏覽器裡跑過。
- Code Generation 審查留下的 6 個 finding 已在批准時接受為風險，其中 R-01（刪除有訂單的商品回 500）和 R-02（重複商品可能超賣、並行下單可能死結）會影響後台與下單。
- 26 個需求依人的要求留到之後的 issue，見 `cross-unit-traceability.md`。
