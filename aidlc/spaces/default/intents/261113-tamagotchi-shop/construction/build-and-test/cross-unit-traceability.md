# 跨單元追溯：issue #3

**Verdict:** Fail（依計畫的範圍限制）。這一輪只做 issue #3，26 個需求依人的要求「先做 issue #3」留到之後的 issue。

## 已涵蓋

| ID | Owning Stage | 目標檔案 |
|----|--------------|----------|
| FR5.3 | code-generation | `inventrix-code/packages/api/src/__tests__/orders.validation.test.ts` |
| NFR1 | code-generation | `inventrix-code/packages/api/src/db.ts` |

## 未涵蓋（Deferred）

| ID | 預定的 issue |
|----|--------------|
| FR1.1–FR1.4 | `4-theme-mascot.md` |
| FR2.1、FR2.4 | `5-poop-points-ui.md` |
| FR2.2、FR2.3、FR2.5、FR3.1、FR5.1、FR5.2 | `3-points-api.md`（FR2.3、FR5.2 的資料欄位已在本輪建立） |
| FR4.1–FR4.4、FR5.4、FR5.5 | `6-cart-checkout.md` |
| FR6.1–FR6.3 | `4-theme-mascot.md` |
| NFR2 | `7-deploy.md` |
| NFR3 | `1-security.md`（`DATABASE_URL` 已在本輪改為只讀環境變數，`JWT_SECRET` 仍有寫死的預設值） |
| NFR4、NFR5 | 前端相關 issue |
| NFR6 | 各 issue 補上自己的測試 |
