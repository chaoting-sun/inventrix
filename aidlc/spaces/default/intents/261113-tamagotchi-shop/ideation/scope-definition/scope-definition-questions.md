# 範圍定義：釐清問題

依據：`ideation/intent-capture/intent-statement.md`、`ideation/feasibility/feasibility-assessment.md`、`ideation/feasibility/constraint-register.md`。時程優先：1.5 小時內一定要有可展示版本，基礎設施與互動範圍都可以縮減（可行性 Q6、Q11）。

## Q1. [維運] 1.5 小時內必做的基礎設施

基礎設施做到哪裡，決定第一版的時間有多少能留給網站本身。

A. 只要本機可展示，AWS 部署全部延後
B. 部署到 AWS us-east-1：容器 + RDS PostgreSQL，先用單一可用區（架構保留擴展空間），CI/CD 延後
C. B 再加上 CodePipeline／CodeBuild 自動化部署
D. 全部做到：多可用區 + 容器 + RDS PostgreSQL + CI/CD
X. Other (please specify)

[Answer]: B

## Q2. [專案管理] 排序偏好

必做項目要用什麼順序做？

A. 風險優先：先把資料庫與部署跑通，再做互動
B. 價值優先：先做能展示的互動與購物流程，再處理部署
C. 依相依關係排序
D. 尚未定義
X. Other (please specify)

[Answer]: B

## Q3. [產品] 1.5 小時內必做的網站互動（select all that apply）

沒選的項目會列為延後（nice-to-have）。

A. 便便點數兌換：每個商品都有點數價格，網頁上隨機出現便便，點掉得點數，點數夠了就能買
B. 吉祥物隨購物行為反應（加入購物車開心、結帳跳舞、久未互動會餓）
C. 像素／復古掌機風格視覺，加上動畫與音效
D. 養成成長（購物或點數讓吉祥物長大）
E. 尚未定義
X. Other (please specify)

[Answer]: A, B, C
