## 範圍（NFR2、NFR3）
- API 與前端的 Dockerfile（排除 `*.pem`、`*.db`、`setup_info.txt`）
- 部署到 us-east-1：容器服務 + RDS for PostgreSQL，單一可用區；應用程式無本機狀態，保留水平擴展空間
- 機密用 Secrets Manager 或環境變數
- 決定既有 EC2 + CloudFront 部署（`setup_info.txt`）沿用或清除
- 延後：多可用區、CodePipeline／CodeBuild

## 相依
- 「[後端] SQLite 改為 PostgreSQL」、「[安全] 排除私鑰與寫死的機密」

## 驗收
- 透過 AWS 網址完成完整購物流程；時間不夠時以本機展示為保底

規格來源：AIDLC 需求文件 `inception/requirements-analysis/requirements.md`。
