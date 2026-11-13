# Technology Stack

版本為 `inventrix-code/pnpm-lock.yaml` 中解析出的實際版本（括號內為 `package.json` 宣告範圍）。

## 語言與執行環境

| 項目 | 版本 | 備註 |
|---|---|---|
| TypeScript | 5.9.3（^5.3.3） | api 與 frontend 皆 `strict` |
| Node.js | 22 | README 與 `deploy.sh` 的 NodeSource setup_22.x；無 `.nvmrc` / `engines` 鎖定 |
| pnpm | 未鎖定版本 | lockfileVersion 9.0；`deploy.sh` 以 `npm install -g pnpm` 安裝最新版 |

## 後端（`packages/api`）

| 套件 | 版本 | 用途 |
|---|---|---|
| express | 4.21.2（^4.18.2） | HTTP framework |
| better-sqlite3 | 9.6.0（^9.2.2） | SQLite driver（原生模組） |
| bcrypt | 6.0.0 | 密碼雜湊（原生模組） |
| jsonwebtoken | 9.0.3 | JWT |
| express-rate-limit | 8.5.2 | 速率限制 |
| cors | 2.8.5 | CORS |
| @aws-sdk/client-bedrock-runtime | 3.1068.0 | Bedrock 呼叫 |
| tsx | 4.20.6 | 開發時 watch 執行 |

模組系統：ESM，`target`/`module` 皆 ES2022，`tsc` 輸出至 `dist/`。

## 前端（`packages/frontend`）

| 套件 | 版本 | 用途 |
|---|---|---|
| react / react-dom | 18.3.1 | UI |
| react-router-dom | 6.30.4 | Client routing |
| vite | 5.4.21 | Dev server 與 bundler |
| @vitejs/plugin-react | 4.7.0 | React 支援 |

樣式：純 inline style + 一個全域 `index.css`；無 CSS framework、無 UI 元件庫、無狀態管理函式庫、無音效或動畫函式庫。

## 資料儲存

- SQLite 檔案 `inventrix.db`（相對於 process cwd，被 `.gitignore` 的 `*.db` 忽略）。

## 基礎設施與部署（現況）

- Amazon EC2（Amazon Linux 2023，預設 `t3.small`，IMDSv2 required，EBS 加密）
- nginx（自簽憑證，listen 80/443）+ PM2
- Amazon CloudFront（CachingDisabled、AllViewer managed policies，origin http-only）
- Amazon Bedrock（Nova Canvas）
- 部署工具：bash + AWS CLI；無 Docker、無 IaC、無 CI/CD

## 開發工具

- 無 linter、formatter、測試框架。
