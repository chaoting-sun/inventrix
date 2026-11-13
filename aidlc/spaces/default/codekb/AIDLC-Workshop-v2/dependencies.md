# Dependencies

套件版本見 `technology-stack.md`，本檔記錄相依關係與相依管理設定。

## 內部（跨 package）相依

- `frontend` 與 `api` 之間沒有套件層級（workspace protocol）相依，也沒有共用的型別套件；前端各頁面自行重複宣告 `Product`、`Order` 等 interface。
- 執行期相依：frontend → api 透過 HTTP 相對路徑 `/api/*`、`/images/*`。
  - 開發：`vite.config.ts` proxy 到 `http://localhost:3000`。
  - 正式：nginx `location /api`、`location /images` 代理到 `localhost:3000`（`deploy.sh:227-248`）。
- api 模組內部相依圖見 `code-structure.md`。

## 外部相依

| 相依 | 使用者 | 性質 |
|---|---|---|
| SQLite 檔案 `inventrix.db` | api | 本機檔案，process 內嵌 |
| Amazon Bedrock Runtime | api（imageGenerator） | 外部 AWS 服務，需 `bedrock:InvokeModel` 權限與 Nova Canvas 模型存取 |
| 本機檔案系統 `api/public/images` | api | 圖片讀寫 |
| `https://checkip.amazonaws.com` | `deploy.sh` | 偵測部署者 IP |
| `https://rpm.nodesource.com/setup_22.x` | EC2 user data | 安裝 Node 22（`curl | bash`） |
| AWS EC2 / CloudFront / SSM public parameter | `deploy.sh`、`destroy.sh` | 部署資源 |

## 環境變數

| 變數 | 使用處 | 預設 |
|---|---|---|
| `PORT` | `api/src/index.ts` | `3000` |
| `JWT_SECRET` | `api/src/middleware/auth.ts` | 寫死的 fallback 字串（安全問題） |
| `AWS_REGION` | `api/src/services/imageGenerator.ts` | `us-east-1` |
| AWS SDK credential chain | imageGenerator | — |

## pnpm workspace 設定（`pnpm-workspace.yaml`）

- `overrides`：`path-to-regexp: 0.1.13`、`qs: 6.15.2`（固定 express 的遞移相依，推測為安全修補）。
- `onlyBuiltDependencies` / `allowBuilds`：`bcrypt`、`better-sqlite3`、`esbuild`。這兩個後端原生模組在容器映像建置時需要 build toolchain（`deploy.sh` 在 EC2 上安裝 `gcc gcc-c++ make` 正是為此）；改用 PostgreSQL 後可移除 `better-sqlite3`。

## 相依風險

- `express` 4.x 仍可用，但 5.x 已發布；`@types/node` 為 20 而執行環境為 22。
- 沒有自動化相依掃描（無 CI、無 Dependabot 設定）。
