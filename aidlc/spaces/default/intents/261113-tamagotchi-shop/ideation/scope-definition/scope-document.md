# 範圍定義：塔麻可吉主題互動電商前台

依據：`ideation/intent-capture/intent-statement.md`（意圖聲明）、`ideation/feasibility/feasibility-assessment.md`（可行性評估）、`ideation/feasibility/constraint-register.md`（限制清單）、`scope-definition-questions.md`（Q1–Q3）。

## 目標

在 1.5 小時內交付一個可展示的版本：顧客能在塔麻可吉主題的介面上完成「瀏覽 → 加入購物車 → 用點數下單」，而且吉祥物的互動清楚可見（意圖聲明成功指標、可行性 Q6、Q11）。

## 範圍內（第一版必做）

| 項目 | 說明 | 來源 |
|------|------|------|
| 塔麻可吉主題介面 | 以現有 Inventrix 顧客端前台為基礎，改成像素／復古掌機風格，加上動畫與音效 | 意圖聲明 Q1、Q4；本階段 Q3 |
| 便便點數兌換 | 每個商品有點數價格；網頁上隨機出現便便，點掉就得到點數；點數夠了就能購買。只用遊戲內點數，不涉及真實金額 | 意圖聲明 Q4；可行性 Q2；本階段 Q3 |
| 吉祥物反應 | 吉祥物隨購物行為反應：加入購物車時開心、結帳時跳舞、太久沒互動會餓 | 意圖聲明 Q4；本階段 Q3 |
| 改用 RDS PostgreSQL | 取代 SQLite | 限制清單 C-T2 |
| 容器化並部署到 AWS | 部署到 us-east-1，容器 + RDS PostgreSQL，先用單一可用區，架構保留擴展空間 | 本階段 Q1；限制清單 C-T3、C-T5 |

## 範圍外（延後或不做）

| 項目 | 狀態 | 來源 |
|------|------|------|
| 多可用區（不能單點故障） | 延後 | 本階段 Q1 |
| CodePipeline／CodeBuild 自動化部署 | 延後 | 本階段 Q1 |
| 養成成長（吉祥物長大） | 延後 | 本階段 Q3 |
| 後台管理頁改動、真實金流、手機 App、會員社群功能 | 不做 | 意圖聲明 Q10 |
| 公開上線（含官方風格素材授權處理） | 不做 | 意圖聲明 Q7；限制清單 C-R2 |

## 排序與保底

- 價值優先（本階段 Q2）：先做能展示的介面、點數兌換與吉祥物反應，再改資料庫，最後做容器化部署。
- 保底：部署排在最後，若 1.5 小時內 AWS 部署沒完成，就用本機版本展示（可行性評估 R1、R2）。

## 價值流

顧客進站 → 看到吉祥物與像素風商品頁 → 點掉隨機出現的便便、累積點數 → 加入購物車（吉祥物開心）→ 用點數結帳（吉祥物跳舞）→ 訂單完成。

## 推上 GitHub 前的必要條件

- 專案目錄裡的 `inventrix-key.pem` 必須排除，不能提交到 `chaoting-sun/inventrix`（可行性 RAID I1）。

## Assumptions & Open Questions

- 本機 `inventrix-code/` 與 GitHub repo `chaoting-sun/inventrix` 是同一份程式碼（可行性 RAID A1）。[assumption]
- 便便出現頻率、每次獲得點數、商品點數價格怎麼訂，留到需求分析決定。[assumption]
