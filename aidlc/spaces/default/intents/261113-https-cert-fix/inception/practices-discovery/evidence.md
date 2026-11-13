# Practices Discovery Evidence（草稿 — lead draft）

> 參與者：`aidlc-pipeline-deploy-agent`（lead，單獨作業；本 scope 的 Collaborators 為 off，沒有 support agent 貢獻檔）。
> 掃描時間：2026-11-13T05:56:29Z。

## 1. 檢查範圍

| 來源 | 檢查結果 |
|---|---|
| git 歷史 | 無。專案根目錄不是 git repository，`inventrix-code/` 內也沒有 `.git`。無法推論 branch 策略、merge 方式或部署頻率。 |
| CI/CD 設定 | 無。找不到 `.github/workflows/`、`buildspec.yml`、`Jenkinsfile`、`.gitlab-ci.yml` 或任何 pipeline 定義。 |
| Reverse-engineering artifacts | 無。`reverse-engineering` 在 `infra` scope 為 SKIP，因此直接檢查程式碼。 |
| `inventrix-code/deploy.sh` | 完整讀取。手動互動式部署腳本（細節見 §2）。 |
| `inventrix-code/destroy.sh` | 完整讀取。讀取 `setup_info.txt`，終止 instance，刪除 security group 與 key pair。 |
| `inventrix-code/setup_info.txt` | 讀取。profile `aidlc-workshop`、region `us-east-1`、一台 instance、security group `inventrix-sg`。 |
| `package.json`（root、`packages/api`、`packages/frontend`） | 讀取。只有 `dev`、`build`、`start`、`preview` scripts。沒有 `test`、`lint`、`format`。 |
| `pnpm-workspace.yaml`、`.gitignore`、`README.md`、`packages/api/tsconfig.json` | 讀取。`.gitignore` 排除 `.env`、`*.db`、`*.pem`。 |
| `packages/api/src/`（`index.ts`、`middleware/auth.ts`、`routes/products.ts`）與前端 `fetch` 呼叫 | 抽樣讀取，並搜尋 `process.env`、URL、`fetch(`。 |
| `inventrix-key.pem` | 未讀取內容（私鑰）。只記錄其存在。 |
| Active-space memory | `team.md`、`project.md` 各段皆為空白範本。`org.md` 為框架預設。 |
| Scope 定義 `.claude/scopes/aidlc-infra.md` | `skeleton: on`、`collaborators: off`；`units-generation`、`code-generation`、`build-and-test` 為 SKIP。 |

## 2. 推論與依據

### Way of Working
- 沒有 git，因此沒有任何 branch/merge 證據。`org.md` 的 trunk-based、squash-merge 到 `main` 預設在此無法執行。
- 推論：單人在本機修改，用 `deploy.sh` 直接上傳原始碼 tar 檔（`--exclude=.git` 只是通用寫法，不代表有 git）。

### Walking Skeleton
- `infra` scope 為 `skeleton: on`，但沒有 Unit DAG。依 `org.md`「no Unit DAG means no skeleton checkpoint ceremony」，本 intent 不會觸發 skeleton 儀式。
- 推論：以「重新部署後瀏覽器不再顯示憑證警告」作為端到端驗證即可。

### Testing Posture
- 沒有測試檔、測試框架或 coverage 工具。唯一的自動檢查是 `pnpm build`（`tsc` 型別檢查 + `vite build`）。
- 推論 Methodology 為 test-after（沿用 `org.md` 預設），因為沒有任何證據支持其他方法。
- 衝突：`org.md` 對 `infra` scope 要求 80% coverage 下限與 merge 前 CI。此專案沒有測試、沒有 CI，且本計畫不執行 `code-generation`/`build-and-test`。需要人決定如何處理。

### Deployment
- 部署流程：`deploy.sh` 偵測部署者 public IP → 選 AWS profile 與 region → 建立/重用 security group → 建立 key pair → 以 user-data 安裝 nodejs、nginx、pnpm、pm2 → `run-instances`（IMDSv2 required、EBS 加密）→ `ssh` 輪詢直到工具就緒 → `scp` 上傳 tar → 遠端 `pnpm install && pnpm build` → pm2 啟動 API → 產生自簽憑證並寫入 nginx 設定 → 寫出 `setup_info.txt`。
- 自簽憑證：`openssl req -x509 -nodes -days 365 -newkey rsa:2048 ... -subj "/C=US/ST=State/L=City/O=Inventrix/CN=inventrix"`。CN 與實際存取的 IP 不符，也沒有受信任 CA 簽發，所以瀏覽器必定警告。腳本結尾也明確印出「Your browser will show a security warning due to the self-signed certificate」。
- 網路暴露：security group 只允許部署者 `/32` 存取 22、80、443、3000。任何需要由外部存取 port 80/443 的憑證驗證方式（例如 ACME HTTP-01），在目前規則下都會失敗。
- 單一環境、單一 instance、無 health check、無 rollback。每次 `deploy.sh` 都會建新 instance，public IP 隨之改變。
- region 預設值不一致：`deploy.sh` 為 `ap-northeast-2`，`destroy.sh` 為 `ap-southeast-2`，實際使用 `us-east-1`。
- Bedrock client 在 `imageGenerator.ts` 以 `process.env.AWS_REGION || 'us-east-1'` 設定 region。

### Code Style
- 沒有 formatter/linter 設定。觀察到的慣例：TS strict、ESM 帶 `.js` 副檔名、單引號、分號、2 空格縮排、每資源一個 `Router`、錯誤回傳 `{ error }` JSON。
- Shell 腳本慣例：`set -e`、`cd "$(dirname "${BASH_SOURCE[0]}")"`、`read -p` 互動輸入、`=== ... ===` 階段標題。

### 與已陳述規則相關的觀察（不在本 stage 修正，只記錄）
- `middleware/auth.ts` 的 `JWT_SECRET` 在環境變數缺少時退回一個寫死的字串。這與 `AGENTS.md`「不得把敏感資訊直接寫進程式碼」相衝突。
- `deploy.sh` 不會在 instance 上設定 `JWT_SECRET`，所以目前部署的 API 使用寫死的預設值。
- `README.md` 與 `deploy.sh` 輸出列出預設帳號密碼（`admin123`、`customer123`）。
- 這些不屬於本 intent 的 HTTPS 憑證範圍。是否納入，由 `requirements-analysis` 決定。

## 3. 訪談必須釐清的問題

1. **工作方式（Way of Working）**：專案沒有 git。AI-DLC 是否直接修改現有檔案而不建立 branch？還是先 `git init` 以保留變更紀錄與 rollback 能力？
2. **測試與驗證（Testing Posture）**：專案沒有測試也沒有 CI。本 intent 的完成標準是否改為部署後 smoke test（瀏覽器/`curl` 不加 `-k` 可通過憑證驗證、HTTP 轉 HTTPS、`/api` 正常），並且不套用 80% coverage 下限？
3. **部署方式（Deployment）**：部署是否維持「由人手動執行 `deploy.sh`」，還是允許改成非互動式腳本或 IaC（例如 CloudFormation/CDK）？每次部署前是否都需要人核准？
4. **網域與憑證來源（Deployment，環境限制）**：sandbox 帳號是否有可用的網域名稱或 Route 53 hosted zone？若沒有，是否接受使用 AWS 提供的網域（例如 CloudFront 的 `*.cloudfront.net`）來取得受信任憑證？網站是否需要讓部署者以外的人連線（影響 security group 規則）？
5. **程式碼風格（Code Style）**：修改 shell 腳本與 nginx 設定時，是否沿用現有慣例且不新增 formatter/linter？

## 4. 尚未解決的不確定性

- Sandbox 帳號的 IAM 權限範圍未知。`WSParticipantRole` 是否允許 CloudFront、ACM、Route 53、ELB 等服務，需要在後續 stage 驗證。
- Sandbox 帳號的到期時間未知。這會影響憑證有效期與自動續期是否值得投入。
