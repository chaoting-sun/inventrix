# Code Quality Assessment

## 總覽

| 面向 | 評等 | 說明 |
|---|---|---|
| Naming clarity | good | 檔名、函式名、資料表欄位語意清楚 |
| Function size | fair | 後端 handler 短；前端頁面 JSX 冗長，inline style 佔大量行數 |
| Error handling | poor | 後端多數 handler 無 try/catch；前端多數 `fetch` 不檢查 `res.ok` |
| Test presence | poor | 完全沒有測試 |
| Duplication | poor | 前端 inline style 與 `fetch` + Bearer header 樣板大量重複；interface 重複宣告 |
| Dead code | good | 無註解掉的程式碼、無 TODO/FIXME/HACK、無 lint 抑制註解 |

## 測試、Lint、CI/CD、文件

- **測試**：無測試目錄、無框架、無 coverage 設定。mvp scope 的 80% line coverage floor 需要從零建立。
- **Lint / Format**：無 ESLint、Prettier；只靠 TypeScript `strict`。
- **CI/CD**：無；部署為手動互動式 `deploy.sh`。
- **文件**：`inventrix-code/README.md` 涵蓋安裝、開發、部署與預設帳號；程式碼幾乎無註解；無 API 文件（本 codekb 的 `api-documentation.md` 補上）。

## 安全問題

| 嚴重度 | 位置 | 問題 |
|---|---|---|
| High | `inventrix-code/inventrix-key.pem` | EC2 SSH 私鑰放在專案目錄（`*.pem` 已被 `.gitignore` 忽略），且 `deploy.sh:193` 的 `tar` 未排除 `*.pem`，私鑰會被上傳到 EC2 家目錄 |
| High | `api/src/middleware/auth.ts:4` | `JWT_SECRET` 有寫死 fallback，未設環境變數時任何人可偽造 admin token |
| High | `api/src/db.ts:52-60` | 預設帳號密碼 `admin123` / `customer123` 寫死，並公開於 README 與 `deploy.sh` 輸出 |
| Medium | `api/src/services/imageGenerator.ts:39-42` | 檔名只替換空白，`productName` 含 `../` 可寫到 `public/images` 之外（需 admin 權限） |
| Medium | `api/src/routes/*.ts` | 無輸入驗證：下單數量可為負數（等同增加庫存且產生負金額）、商品價格可任意值、註冊無密碼強度 |
| Medium | `api/src/index.ts:17` | `cors()` 允許所有 origin |
| Low | `frontend/src/context/AuthContext.tsx` | JWT 存於 `localStorage`，遇 XSS 可被竊取；token 無法撤銷 |
| Low | `deploy.sh` | `StrictHostKeyChecking=no`；`curl | bash` 安裝 Node；nginx 使用自簽憑證 |

## 正確性與可靠性

- `api/src/routes/orders.ts:49-81`：建立訂單無 transaction，並發下單可能超賣，或中途失敗留下部分資料。
- `api/src/routes/orders.ts:83-87`：非法 `status` 觸發 SQLite CHECK 例外，未捕捉 → Express 預設 500。
- `api/src/routes/products.ts:30-36`：PUT 不存在的 id 仍回 200。
- 金額以 `REAL` 儲存與計算，存在浮點誤差；GST 10% 寫死（`orders.ts:64`）。
- `api/src/db.ts:4`：DB 檔案路徑相對於 cwd；schema 只靠 `CREATE TABLE IF NOT EXISTS`，無 migration 機制。
- `api/src/db.ts:85`：種子資料有兩個名稱同為 `Tablet 10"` 的商品。
- 無 health check endpoint、無結構化 logging、無 graceful shutdown。
- `frontend/src/pages/AdminOrders.tsx:19-21`、`AdminProducts.tsx:20-22`：`useEffect` 相依陣列漏掉 `token`/函式（無 lint 偵測）。

## 對本次 intent 的技術債影響

| 技術債 | 影響的工作 |
|---|---|
| SQL 直接寫在 route、同步 driver | PostgreSQL 遷移需改寫所有 router 為 async 並轉換 SQL 方言 |
| 圖片寫入本機磁碟 | 容器化後需持久儲存（S3 或 volume） |
| 寫死 secret 與預設帳密 | 上雲前需改為 Secrets Manager / 環境變數 |
| 私鑰與 `setup_info.txt` 在目錄內 | Docker build context 必須以 `.dockerignore` 排除 |
| 無測試 | 改造前需先建立測試框架與基準測試 |
| 前端無共用 API client、無設計系統 | 像素風改版與購物車頁可趁機抽出共用元件；Admin 頁須維持原樣 |
