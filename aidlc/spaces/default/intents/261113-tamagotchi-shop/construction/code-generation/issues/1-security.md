## 範圍（NFR3）
- `.gitignore` 確認排除 `*.pem`、`*.db`、`setup_info.txt`；新增 `.dockerignore` 同樣排除
- `JWT_SECRET` 只從環境變數讀取，缺少時啟動失敗（移除 `middleware/auth.ts` 寫死的預設值）
- 確認 `inventrix-key.pem` 從未被提交到 repo

## 驗收
- repo 與容器映像中不含 `*.pem`、`*.db`
- 未設定 `JWT_SECRET` 時 API 啟動即失敗並有明確訊息

規格來源：AIDLC 需求文件 `inception/requirements-analysis/requirements.md`。建議最先做，改動最小，其他 issue 不受阻。
