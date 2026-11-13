# 意圖擷取與界定：釐清問題

## Sources

- [desc] Initial description: "目標：互動式電商網站，介面有趣，塔瑪哥吉作為吉祥物代表 介面參考 https://tamagotchi-official.com/gb/"
- [scope] Workflow-selected scope: `mvp`.

## Q1. [產品] 與現有 Inventrix 電商平台的關係

專案裡已有一套 Inventrix 電商平台（商品瀏覽、下單、庫存、後台管理）。這個塔麻可吉網站要怎麼和它相處？

A. 以 Inventrix 為基礎，把顧客端前台改造成塔麻可吉主題的互動介面
B. 另起一個全新、獨立的網站，不沿用 Inventrix
C. 沿用 Inventrix 的後端與資料，另做一個新的塔麻可吉前台，兩者並存
D. 尚未決定
X. Other (please specify)

[Answer]: A

## Q2. [產品] 要解決的主要問題

這個網站最主要想解決什麼問題或達成什麼目的？

A. 現有購物介面平淡無趣，想用吉祥物與互動提升購物樂趣與黏著度
B. 要販售塔麻可吉（或類似風格）的周邊商品
C. 作為 AIDLC 工作坊的練習／示範專案
D. 尚未定義
X. Other (please specify)

[Answer]: A

## Q3. [產品] 目標顧客（select all that apply）

誰會來這個網站購物？他們目前在購物上遇到什麼痛點？

A. 懷舊的成人粉絲（小時候玩過塔麻可吉）
B. 兒童與家長
C. 收藏家
D. 工作坊參與者／內部示範觀眾
E. 尚未定義
X. Other (please specify)

[Answer]: A

## Q4. [產品] 「介面有趣、互動」具體指什麼（select all that apply）

參考網站 tamagotchi-official.com 有鮮明的色彩與角色。你希望顧客感受到哪些互動？

A. 吉祥物會隨購物行為反應（例如加入購物車時開心、結帳時跳舞、久未互動會餓）
B. 復古掌機／像素風格的視覺與版面
C. 養成或集點元素（例如購物可以「餵食」吉祥物、累積成長）
D. 動畫、音效等感官回饋
E. 尚未定義
X. Other (please specify)

[Answer]: A, B, C, D；並明確新增：蒐集點數的機制。點數機制：每個商品都有對應金額, 網頁上有便便, 隨機出現, 按掉就可以有錢, 按滿就可以買東西

## Q5. [產品] 成功的樣子與衡量指標

第一版上線後，怎樣算成功？要看哪些數字？

A. 能展示一個可完整操作的購物流程（瀏覽 → 加入購物車 → 下單），且吉祥物互動可見
B. 使用者停留時間或轉換率比現有介面提升（請在 Other 寫出目標數字）
C. 試用者回饋的趣味度／滿意度達到某個門檻
D. 尚未定義
X. Other (please specify)

[Answer]: A

## Q6. [產品] 為什麼是現在

這個專案的觸發點是什麼？

A. 參加 AIDLC 工作坊，需要一個練習題目
B. 品牌或行銷活動（例如新品、週年紀念）
C. 現有前台體驗不佳，需要改版
D. 不適用
X. Other (please specify)

[Answer]: C

## Q7. [產品] 塔麻可吉角色與品牌素材的使用

塔麻可吉是 Bandai 的註冊商標與角色，直接使用官方角色、圖片或商標有授權風險。吉祥物要怎麼處理？

A. 設計一個原創的「類塔麻可吉」電子寵物角色，只參考風格，不使用官方素材
B. 已取得或將取得授權，可以使用官方角色與素材
C. 僅作內部／工作坊示範、不公開上線，暫時使用官方風格素材
D. 尚未確定
X. Other (please specify)

[Answer]: C

## Q8. [專案管理] 關鍵利害關係人與決策者（select all that apply）

誰在意這個專案、誰決定範圍與優先順序？

A. 只有我自己（我負責決定，也是主要使用者）
B. 產品負責人、設計師、開發團隊
C. 工作坊講師或主辦方
D. 尚未識別
X. Other (please specify)

[Answer]: B

## Q9. [專案管理] 溝通與回報要求

是否有固定的進度回報或溝通節奏？

A. 沒有正式要求，在每個階段審核時確認即可
B. 每週回報一次進度
C. 要配合工作坊的時程與成果發表
D. 尚未定義
X. Other (please specify)

[Answer]: C

## Q10. [產品] 第一版先不做的事（select all that apply）

這次已選定 `mvp` 流程（先交付核心）。第一版的網站「不」包含哪些內容？

A. 不改動後台管理頁（商品、庫存、訂單管理維持原樣）
B. 不串接真實金流
C. 不做手機 App，只做網頁
D. 不做會員社群功能（排行榜、分享、好友互動）
E. 尚未定義
X. Other (please specify)

[Answer]: A, B, C, D

## Q11. [維運] 可用性與擴展性

系統是否允許單點故障？需要多大的擴展能力？

A. 不能有單點故障，需可擴展
B. 單一主機即可，不要求擴展
C. 先單點，之後再擴展
D. 尚未定義
X. Other (please specify)

[Answer]: X. 不能單點, 要有可擴展性, 可考慮container等服務, 優先考慮易於建立

## Q12. [開發] 部署方式

新版前台與後端要怎麼部署？

A. 自動化部署，有 CI/CD
B. 手動部署（沿用現有部署腳本）
C. 不需要部署，僅在本機示範
D. 尚未定義
X. Other (please specify)

[Answer]: A. 自動化部署, 有CICD

## Q13. [開發] 資料庫

現有 Inventrix 使用 SQLite。新版要用什麼資料庫？

A. 改用 RDS，不使用 SQLite
B. 沿用 SQLite
C. 其他託管資料庫
D. 尚未定義
X. Other (please specify)

[Answer]: A. 要用rds, 不要用sqlite

## Consolidated Summary Confirmation

- 平台：以現有 Inventrix 為基礎，把顧客端前台改造成塔麻可吉主題的互動介面（Q1）
- 要解決的問題：現有購物介面平淡無趣，用吉祥物與互動提升購物樂趣與黏著度（Q2）
- 目標顧客：懷舊的成人粉絲（Q3）
- 互動內容：吉祥物隨購物行為反應、復古掌機／像素風格、養成或集點元素、動畫與音效，並明確包含蒐集點數的機制（Q4）
- 點數機制：每個商品都有對應金額；網頁上會隨機出現便便，點掉就能拿到錢，錢存夠了就能買商品（Q4）
- 成功標準：能展示完整購物流程（瀏覽 → 加入購物車 → 下單），且吉祥物互動可見（Q5）
- 為什麼是現在：現有前台體驗不佳，需要改版（Q6）
- 角色與素材：僅作內部／工作坊示範、不公開上線，暫時使用官方風格素材（Q7）
- 利害關係人：產品負責人、設計師、開發團隊（Q8）
- 溝通節奏：配合工作坊的時程與成果發表（Q9）
- 第一版不做：後台管理頁、真實金流、手機 App、會員社群功能（Q10）
- 可用性與擴展性：不能單點故障，要可擴展，可考慮容器等服務，優先選易於建立的方式（Q11）
- 部署：自動化部署，有 CI/CD（Q12）
- 資料庫：改用 RDS，不再使用 SQLite（Q13）

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct

## Requested Changes Feedback

What should change?

[Answer]: 新增蒐集點數的機制

## Requested Changes Feedback

What should change?

[Answer]: 互動內容: 每個商品都有對應金額, 網頁上有便便, 隨機出現, 按掉就可以有錢, 按滿就可以買東西

## Assumption Confirmation

利害關係人地圖中有兩項尚未說明的內容，目前標記為假設／待解問題：

- 產品負責人、設計師、開發團隊各自最關注什麼，目前尚未說明。[assumption]
- 產品負責人、設計師、開發團隊三者之間，誰對範圍與優先順序有最終決定權，目前尚未說明。[assumption]

A. Accept assumptions
B. Convert to follow-up questions

[Answer]: A. Accept assumptions
