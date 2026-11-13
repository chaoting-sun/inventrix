# 測試結果：issue #3（PostgreSQL）

執行時間：2026-11-13，本機 macOS，Node 22.23.5，PostgreSQL 16（podman compose）。

## 建置

| 指令 | 結束碼 | 結果 |
|------|--------|------|
| `npx -y pnpm@9 build` | 0 | api 編譯成功；frontend 打包成功（`index-*.js` 188.95 kB） |
| `npx -y pnpm@9 --filter api exec tsc --noEmit` | 0 | 沒有型別錯誤 |

## 單元測試

| 指令 | 總數 | 通過 | 失敗 | 略過 |
|------|------|------|------|------|
| `npx -y pnpm@9 --filter api exec vitest run src/__tests__/orders.validation.test.ts` | 4 | 4 | 0 | 0 |

## 整合測試（Node 中執行，打真的 PostgreSQL）

| 指令 | 總數 | 通過 | 失敗 | 略過 |
|------|------|------|------|------|
| `DATABASE_URL=... npx -y pnpm@9 --filter api exec vitest run src/__tests__/db.integration.test.ts src/__tests__/orders.integration.test.ts` | 4 | 4 | 0 | 0 |

## 失敗細節

None.

## 覆蓋率

`poc` scope 沒有 coverage 下限，Testing Contract 也沒有設定門檻，所以沒有跑 coverage。

## Target Verification Matrix

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| T-FR5.3 | `requirements.md` FR5.3；`issues/2-postgres.md` 驗收 | 非法數量回 400，至少一個測試 | 3 個測試通過（0、1.5、空陣列） | 上方單元測試指令 | build-and-test | Met |
| T-STATUS | `issues/2-postgres.md` 範圍 | 非法訂單狀態回 400 | 1 個測試通過 | 上方單元測試指令 | build-and-test | Met |
| T-NFR1 | `requirements.md` NFR1 | 購物流程在 PostgreSQL 上跑通 | 建表、下單 201、庫存扣除、庫存不足時不留訂單，4 個整合測試通過 | 上方整合測試指令（在 Node 中執行，不是瀏覽器） | build-and-test | Met |
| T-BUILD | `code-generation-plan.md` | api 與 frontend 建置成功、無型別錯誤 | 結束碼 0 | 上方建置指令 | build-and-test | Met |
| T-CI | Testing Contract | CI 執行 | 不適用 | the plan runs no CI Pipeline | build-and-test | N/A |
| T-COVERAGE | Testing Contract（poc） | 沒有 coverage 下限 | 不適用 | `poc` 不加 coverage 下限 | build-and-test | N/A |
