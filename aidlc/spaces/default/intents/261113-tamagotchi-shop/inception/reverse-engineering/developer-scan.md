# Developer Code Scan — AIDLC-Workshop-v2

- 掃描日期：2026-11-13
- 掃描範圍：FULL scan（首次掃描，無既有 codekb），snapshot paths：`./`
- head_commit：unknown（非 git repository）
- 深度：Minimal；僅閱讀程式碼，未執行任何測試、建置或程式

## Developer Code Scan Results

### Scan Coverage
- **Analyzed deeply**:
  - `inventrix-code/package.json`, `inventrix-code/pnpm-workspace.yaml`, `inventrix-code/.gitignore`, `inventrix-code/README.md`, `inventrix-code/setup_info.txt`
  - `inventrix-code/deploy.sh`, `inventrix-code/destroy.sh`
  - `inventrix-code/packages/api/`（`package.json`、`tsconfig.json`、`src/` 全部 9 個 `.ts` 檔）
  - `inventrix-code/packages/frontend/`（`package.json`、`tsconfig*.json`、`vite.config.ts`、`index.html`、`src/` 全部 15 個檔案）
  - 根目錄 `README.md`、`AGENTS.md`、`LICENSE`、`.gitignore`
- **Skimmed only**:
  - `inventrix-code/pnpm-lock.yaml`（只擷取直接相依的 resolved 版本）
  - `inventrix-code/packages/api/public/images/`（24 張商品 PNG，只列檔名）
  - `AI-DLC v2 Config Map.html`（只確認標題為 AI-DLC 設定說明頁，非應用程式碼）
  - `inventrix-code/inventrix-key.pem`（只確認存在；依指示未開啟內容）
- **Left out**:
  - `.claude/`、`aidlc/`（AI-DLC 自身安裝與工作區）
  - `aidlc.settings.local.json`（AI-DLC 本機設定，被 `.gitignore` 忽略）
  - `.gitignore` 中 `# BEGIN AI-DLC:gitignore` 標記區塊
  - `node_modules/`、`dist/`、`*.db`、`.DS_Store`（皆不存在於磁碟或被忽略）

### Packages Found
- `inventrix`（root）— pnpm workspace root — N/A — 以 `pnpm --filter` 串接 api 與 frontend 的 dev/build/start
- `api` — Node.js 後端服務 — TypeScript（ESM）— Express REST API、SQLite 持久化、JWT 驗證、Bedrock 圖片生成
- `frontend` — SPA — TypeScript + React（TSX）— 顧客商店與 Admin 後台 UI

### Build System
- **Type**: pnpm workspace（lockfileVersion 9.0）；api 用 `tsc`（輸出 `dist/`）與 `tsx watch`；frontend 用 `tsc` + Vite 5
- **Config Files**: `inventrix-code/package.json`、`inventrix-code/pnpm-workspace.yaml`、`packages/api/package.json`、`packages/api/tsconfig.json`、`packages/frontend/package.json`、`packages/frontend/tsconfig.json`、`packages/frontend/tsconfig.node.json`、`packages/frontend/vite.config.ts`
- **Build Dependencies**: `frontend` 與 `api` 之間無套件層級相依；執行期 frontend 透過 HTTP `/api`、`/images`（開發時 Vite proxy 到 `localhost:3000`，正式環境由 nginx 反向代理）呼叫 api。原生模組 `bcrypt`、`better-sqlite3`、`esbuild` 列於 `onlyBuiltDependencies`。

### APIs Discovered
- REST（Express）— `packages/api/src/routes/` — 14 個 endpoint：auth 2、products 6、orders 4、analytics 2，另有 `/images` 靜態檔（詳見 `api-documentation.md`）
- 外部 AWS API — `packages/api/src/services/imageGenerator.ts` — Bedrock Runtime `InvokeModel`（`amazon.nova-canvas-v1:0`）
- 部署用 AWS CLI — `inventrix-code/deploy.sh` / `destroy.sh` — EC2、Security Group、Key Pair、CloudFront

### Frameworks & Libraries
- express — 4.21.2 — HTTP server / routing
- better-sqlite3 — 9.6.0 — 同步 SQLite driver（檔案 `inventrix.db`）
- bcrypt — 6.0.0 — 密碼雜湊
- jsonwebtoken — 9.0.3 — JWT 簽發/驗證
- express-rate-limit — 8.5.2 — 速率限制
- cors — 2.8.5 — CORS（全開）
- @aws-sdk/client-bedrock-runtime — 3.1068.0 — Nova Canvas 圖片生成
- react / react-dom — 18.3.1 — UI
- react-router-dom — 6.30.4 — client routing
- vite — 5.4.21；@vitejs/plugin-react — 4.7.0 — 前端建置
- typescript — 5.9.3；tsx — 4.20.6 — 編譯 / 開發執行

### Test Coverage
- **Test Directories**: 無
- **Test Frameworks**: 無（兩個 package 都沒有 `test` script）
- **Coverage Config**: absent

### Code Quality Indicators
- **Linting**: 無 ESLint / Prettier 設定；僅有 TypeScript `strict`（frontend 另開 `noUnusedLocals`、`noUnusedParameters`）
- **CI/CD**: 無 pipeline 檔；部署靠手動互動式 `deploy.sh`（EC2 + nginx + PM2 + CloudFront）
- **Documentation**: `inventrix-code/README.md` 說明啟動與部署；程式碼幾乎無註解

### Technical Debt Signals
- `inventrix-code/inventrix-key.pem`：EC2 SSH 私鑰存在於專案目錄（雖被 `inventrix-code/.gitignore` 的 `*.pem` 忽略），且 `deploy.sh:193` 的 `tar` 未排除 `*.pem`，會把私鑰一併上傳到 EC2
- `packages/api/src/middleware/auth.ts:4`：`JWT_SECRET` 有寫死的 fallback 值
- `packages/api/src/db.ts:52-60`：預設帳密 `admin123` / `customer123` 寫死並植入；README 與 `deploy.sh:303-304` 公開列出
- `packages/api/src/routes/orders.ts:49-81`：建立訂單（檢查庫存、寫 orders、寫 order_items、扣庫存）未包在 transaction 中；`items` 無驗證（數量可為負數或非整數）
- `packages/api/src/routes/orders.ts:83-87`、`products.ts:22-41`：request body 無驗證；非法 status 會觸發 SQLite CHECK 例外而變成未處理的 500
- `packages/api/src/routes/auth.ts:26-45`：註冊不檢查 email/password 格式與強度
- `packages/api/src/services/imageGenerator.ts:39-42`：檔名只取代空白，`productName` 含 `../` 時可造成路徑穿越（僅 admin 可觸發）
- `packages/api/src/index.ts:17`：`cors()` 不限 origin；無集中 error handler、無 logging、無 health check endpoint
- `packages/api/src/db.ts:4`：DB 路徑 `inventrix.db` 相對於 process cwd；schema 以 `CREATE TABLE IF NOT EXISTS` 管理，無 migration 機制；金額使用 `REAL`
- `packages/api/src/db.ts:85`：種子資料有兩個同名 `Tablet 10"` 商品
- frontend：所有樣式皆為 inline style 並大量重複；`fetch` 散落各頁面，無共用 API client；多數 `fetch` 未檢查 `res.ok`；JWT 存於 `localStorage`
- `packages/frontend/src/pages/ProductDetail.tsx:28-55`：一次只能下單單一商品，沒有購物車
- 金額格式：GST 10% 寫死於 `orders.ts:64`

## Handoff Summary
- **Intent-relevant finding**: 資料存取層與 SQLite 緊密耦合 — 所有 route 直接 `import db from '../db.js'` 並呼叫 better-sqlite3 的同步 API（`db.prepare(...).get/all/run`、`lastInsertRowid`，見 `packages/api/src/routes/*.ts`、`db.ts:1-94`），且 SQLite 專屬語法（`AUTOINCREMENT`、`DATETIME DEFAULT CURRENT_TIMESTAMP`）寫在 `db.ts:7-47`。遷移到 RDS PostgreSQL 必須把每個 handler 改為 async、改寫 schema 與種子邏輯，並引入 transaction。顧客端「點便便賺點數、只能用點數購買」需要新增點數資料（`users` 目前無點數欄位）與新的訂單計價路徑（目前 `orders.ts:52-65` 以 `price` + 10% GST 計算）。新購物車頁需要前端 cart state，後端 `POST /api/orders` 已支援多個 `items`。Admin 頁面（`pages/Admin*.tsx`）與 `/api/analytics/*` 依賴 `orders.subtotal/gst/total` 與 `products.price`，必須保持不變。
- **Risks / follow-up**:
  - `inventrix-key.pem` 私鑰在工作目錄且會被 `deploy.sh` 打包上傳；容器化時 build context 必須排除 `*.pem`、`*.db`、`setup_info.txt`。
  - 既有部署（`setup_info.txt`）為 us-east-1 的 EC2 + CloudFront；新的容器化部署須決定是否沿用或由 `destroy.sh` 清除。
  - `imageGenerator.ts` 把圖片寫入本機 `public/images`，容器化後檔案系統非持久，需要改存 S3 或掛載 volume。
  - `JWT_SECRET` fallback 與預設帳密在正式環境必須改為 Secrets Manager / 環境變數。
  - 無任何測試與 lint；mvp scope 要求 80% line coverage floor，需從零建立測試框架。
