# Team Practices（草稿 — lead draft，待訪談確認）

> 狀態：**草稿**。本檔內容全部來自程式碼與腳本的推論，或來自 `org.md` 的框架預設值。尚未有任何一條經過人確認。
> 每段標示來源：「推論」= 由程式碼證據推得；「預設」= 沿用 `org.md`；「待確認」= 需要訪談回答。
> `team.md` 目前五個段落皆為空白範本（只有 HTML 註解），所以本次沒有既有的已確認基準。
> 證據細節見 `evidence.md`。

## Way of Working

- **現況（推論）**：專案根目錄 `/Users/timsun/Documents/workshops/AIDLC Workshop v2` 不是 git repository。沒有 branch、commit 歷史、PR 或 merge 紀錄可以分析。
- **現況（推論）**：`inventrix-code/` 是單一 pnpm monorepo（`packages/api`、`packages/frontend`）。工作方式看起來是單人在本機直接修改檔案，再用 `deploy.sh` 打包上傳。
- **提議（預設，待確認）**：本次 intent 是 workshop sandbox 上的單人工作。提議 AI-DLC 直接在現有工作目錄修改檔案，不建立 branch 或 worktree。理由：沒有 git，`org.md` 的 trunk-based squash-merge 預設無法執行。
- **待確認**：是否要先執行 `git init` 以取得變更紀錄與 rollback 能力，或維持無版本控制。

## Walking Skeleton

- **現況（推論）**：`infra` scope 宣告 `skeleton: on`。但本計畫中 `units-generation` 為 SKIP，因此沒有 Unit DAG。依 `org.md`，沒有 Unit DAG 就沒有 skeleton checkpoint 儀式。
- **提議（推論，待確認）**：不另做 walking skeleton。改用一個端到端驗證代替：重新部署後，瀏覽器或 `curl` 不加 `-k` 也能以 HTTPS 開啟網站、無憑證警告，並且 `/api` 與 `/images` 經 nginx 正常回應。

## Testing Posture

- **Methodology**: test-after
- **Methodology evidence**: 草稿推論。`inventrix-code/` 沒有任何測試檔、測試框架（無 jest/vitest/mocha 依賴）或 `test` script。沒有證據顯示團隊採用 TDD/BDD/ATDD。因此沿用 `org.md` 預設的 test-after，待訪談確認。
- **Ordering**: 先完成每一個可驗證的基礎設施變更（例如憑證與 nginx 設定），再對該變更執行對應的驗證檢查（smoke test）。
- **現況（推論）**：沒有單元測試、整合測試、coverage 工具，也沒有 CI。`pnpm build`（`tsc` + `vite build`）是目前唯一的自動化檢查。
- **與預設的落差（待確認）**：`org.md` 對 `infra` scope 加上 80% line-coverage 下限與 merge 前 CI 執行。此 repo 沒有測試也沒有 CI，而本計畫的 `code-generation` 與 `build-and-test` 都是 SKIP。需要人決定：本 intent 的驗證是否改為部署後 smoke test（憑證鏈驗證、HTTP→HTTPS redirect、API 回應），而不套用 coverage 下限。
- **Test Strategy**：Standard（來自 workflow 設定）。

## Deployment

- **現況（推論）**：手動、互動式部署。執行 `inventrix-code/deploy.sh`，用 AWS CLI 建立一台 EC2（Amazon Linux 2023、`t3.small`、default VPC），以 `ssh`/`scp` 上傳 tar 檔，在機器上執行 `pnpm install`、`pnpm build`，用 pm2 啟動 API，nginx 提供前端靜態檔並反向代理 `/api` 與 `/images` 到 `localhost:3000`。
- **現況（推論）**：實際部署使用 AWS profile `aidlc-workshop`、region `us-east-1`（`setup_info.txt`）。`deploy.sh` 的 region 預設值是 `ap-northeast-2`，`destroy.sh` 的預設值是 `ap-southeast-2`，兩者不一致。
- **現況（推論）**：TLS 憑證由 `openssl req -x509` 在機器上自簽（365 天，CN=`inventrix`），網址是 `https://<public-ip>`，沒有網域名稱。這就是瀏覽器顯示「not secure」的直接原因。
- **現況（推論）**：Security group 只對部署者自己的 `/32` IP 開放 22、80、443、3000。網站實際上只有部署者能連線。
- **現況（推論）**：只有一個環境（無 staging）。沒有 CD pipeline、沒有 health check、沒有自動 rollback。拆除用 `destroy.sh`。每次部署都建立新 instance，public IP 會改變。
- **與預設的落差（待確認）**：`org.md` 預設為「merge 後自動部署到 staging，production 需人工核准」。此專案不適用該預設。提議：本 intent 維持手動觸發部署，由人執行或核准每一次部署。
- **環境限制（推論）**：這是限時 workshop sandbox 帳號（暫時性 STS credentials，role `WSParticipantRole`）。可用的 AWS 服務、能否註冊或使用網域、資源存活時間，都需要確認。

## Code Style

- **現況（推論）**：沒有 Prettier、ESLint 或 EditorConfig 設定檔。依 `org.md`，風格交由專案設定決定，但此專案沒有設定。
- **觀察到的慣例（推論）**：TypeScript `strict: true`；ESM（`"type": "module"`），相對 import 帶 `.js` 副檔名；單引號、分號、2 空格縮排；camelCase 命名。
- **觀察到的慣例（推論）**：API 端每個資源一個 Express `Router` 檔案（`routes/*.ts`），中介層放在 `middleware/`，外部服務放在 `services/`。SQL 以 `better-sqlite3` prepared statement 內嵌。錯誤以 `res.status(<code>).json({ error: '<訊息>' })` 回傳。
- **觀察到的慣例（推論）**：Shell 腳本使用 `#!/bin/bash`、`set -e`、先 `cd` 到腳本所在目錄、以 `read -p` 互動取得參數、用 `=== ... ===` 標示階段輸出。
- **提議（待確認）**：本 intent 修改 `deploy.sh`/`destroy.sh` 或 nginx 設定時，沿用上述既有慣例，不新增 formatter 或 linter。
