# Discovered Rules（草稿 — lead draft，待訪談確認）

> 本檔只收錄由人明確說出的硬性限制。
> 標示「已由人陳述」的條目來自專案的 `AGENTS.md`（人撰寫的專案指示）。
> 標示「候選」的條目只是推論，訪談確認前不得視為規則。整合時未獲確認的候選條目會被刪除。

## Mandated

- ALWAYS 以環境變數或 AWS Secrets Manager 提供敏感資訊（例如 API key、密碼）。（已由人陳述：`AGENTS.md` 的 Security Considerations）
- ALWAYS 在每個核准關卡等待人的核准，不得略過。（已由人陳述：`AGENTS.md` 的 Workflow & Session Continuity）
- 候選：ALWAYS 在部署到 AWS 前，由人確認或執行部署指令。（推論自 `deploy.sh` 的 `Proceed with deployment? (yes/no)` 確認步驟，待訪談確認）

## Forbidden

- NEVER 把敏感資訊（例如 API key、密碼）直接寫進程式碼。（已由人陳述：`AGENTS.md` 的 Security Considerations）
- 候選：NEVER 讀取、輸出或上傳私鑰檔（`inventrix-key.pem`、`/etc/nginx/ssl/*.key`）的內容。（推論自 `.gitignore` 排除 `*.pem`，待訪談確認）
