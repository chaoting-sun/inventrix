# 意圖待辦清單：塔麻可吉主題互動電商前台

依據：`ideation/intent-capture/intent-statement.md`、`ideation/feasibility/feasibility-assessment.md`、`ideation/feasibility/constraint-register.md`、`scope-document.md`。優先序採 MoSCoW；排序依價值優先（本階段 Q2）。

## 待辦項目

| 順序 | ID | 項目 | MoSCoW | 相依 | 完成標準 |
|------|----|------|--------|------|----------|
| 1 | B1 | 塔麻可吉主題介面（像素風、動畫、音效） | Must | — | 商品列表、商品頁、購物車、下單畫面都換成像素風主題，並有動畫與音效 |
| 2 | B2 | 便便點數兌換 | Must | B1 | 便便隨機出現、點掉得點數、點數餘額看得到；每個商品有點數價格；點數足夠才能下單，下單後扣點 |
| 3 | B3 | 吉祥物反應 | Must | B1 | 加入購物車時開心、結帳時跳舞、閒置一段時間會餓，展示時都看得到 |
| 4 | B4 | 資料庫改用 RDS PostgreSQL | Must | B2（點數需要存進資料庫） | 完整購物流程（瀏覽 → 加入購物車 → 用點數下單）在 PostgreSQL 上跑通 |
| 5 | B5 | 容器化並部署到 AWS us-east-1（單一可用區） | Must | B4 | 透過 AWS 上的網址能完成完整購物流程；做不完時改用本機展示 |
| 6 | B6 | CodePipeline／CodeBuild 自動化部署 | Could | B5 | 推送到 GitHub 後自動建置並部署 |
| 7 | B7 | 多可用區（資料庫與容器） | Could | B5 | 任一可用區故障時服務仍可用 |
| 8 | B8 | 養成成長 | Won't（這一版） | B2、B3 | — |

## 時程分配建議（1.5 小時，估計）

| 區段 | 項目 | 建議時間 |
|------|------|----------|
| 網站本身 | B1–B3 | 約一半時間 |
| 資料庫遷移 | B4 | 約四分之一 |
| 部署 | B5 | 剩下的時間；超時就用本機展示 |

以上時間分配為估計，未經實測。

## Assumptions & Open Questions

- 時程分配為經驗估計，未經實測。[assumption]
