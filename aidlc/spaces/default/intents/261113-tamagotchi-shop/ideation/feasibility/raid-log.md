# RAID 紀錄：塔麻可吉主題互動電商前台

依據：`ideation/intent-capture/intent-statement.md`（意圖聲明）、`feasibility-assessment.md`、`constraint-register.md`。

## Risks（風險）

| ID | 風險 | 可能性 | 影響 | 因應 |
|----|------|--------|------|------|
| R1 | 1.5 小時內無法完成完整範圍（多可用區、容器、CI/CD、RDS、完整互動） | 高 | 高 | 範圍定義時排出必做與延後清單（Q11 時程優先） |
| R2 | 第一次部署到 AWS（RDS、容器、負載平衡、管線）需要多次修正，吃掉展示時間 | 高 | 高 | 先確保本機或最簡部署可展示，雲端部署當加分 |
| R3 | SQLite 改 PostgreSQL 時，同步改非同步的查詢遺漏或 SQL 語法差異造成錯誤 | 中 | 中 | 改完後跑過完整購物流程（瀏覽 → 加入購物車 → 下單） |
| R4 | 多個容器同時運行時，存在本機的商品圖片無法共用 | 中 | 中 | 改放共用儲存，或示範時不產生新圖片 |
| R5 | 剩餘 18 個審核點佔用大量時程 | 高 | 中 | 由你決定是否改用步驟較少的流程 |
| R6 | 公開使用官方風格素材有 Bandai 商標與角色授權風險 | 低（目前不公開） | 高 | 公開前改用原創角色或取得授權（C-R2） |

## Assumptions（假設）

| ID | 假設 | 來源 |
|----|------|------|
| A1 | 本機 `inventrix-code/` 與 GitHub repo `chaoting-sun/inventrix` 是同一份程式碼 | 待確認 |
| A2 | 各項建立時間為經驗估計，未經實測 | 本評估 |

## Issues（問題）

| ID | 問題 | 處理方式 |
|----|------|----------|
| I1 | 專案目錄內有 `inventrix-key.pem`（EC2 私鑰），推上 GitHub 會外洩 | 推送前加入 `.gitignore` 並確認未被提交；若曾外洩須作廢該金鑰 |
| I2 | 資料庫初始化寫入固定密碼（例如管理員 `admin123`） | 示範只用假資料可接受（Q8）；不得帶到正式環境 |
| I3 | 本機專案目錄不是 git repository | 開始寫程式前接上 GitHub repo `chaoting-sun/inventrix` |

## Dependencies（相依）

| ID | 相依項目 | 說明 |
|----|----------|------|
| D1 | AWS 帳號（us-east-1）的建立權限；目前使用的是有時效的臨時憑證，部署時需確認仍有效 | RDS、容器服務、負載平衡、CodePipeline／CodeBuild（Q3、Q10） |
| D2 | GitHub repo `chaoting-sun/inventrix` 的寫入權限與 CodePipeline 連線 | Q4、Q10 |
| D3 | Amazon Bedrock（商品圖片產生功能） | 現有功能沿用時需要 |

## Assumptions & Open Questions

- 本機 `inventrix-code/` 與 GitHub repo `chaoting-sun/inventrix` 是同一份程式碼。[assumption]
- 各項建立時間為經驗估計，未經實測。[assumption]
