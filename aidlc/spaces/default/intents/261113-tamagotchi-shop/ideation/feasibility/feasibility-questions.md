# 可行性與限制：釐清問題

依據：`ideation/intent-capture/intent-statement.md`，以及現有 Inventrix 程式碼（`inventrix-code/`）的盤點：

- 後端為 Node.js + Express + TypeScript，約 475 行；資料庫用 SQLite（`better-sqlite3`，同步 API，約 30 處查詢）。
- 目前用 `deploy.sh` 部署到單一台 EC2（預設區域 ap-northeast-2），沒有 CI/CD。
- 商品圖片可透過 Amazon Bedrock 產生，並存在伺服器本機的 `public/` 資料夾。
- 專案目錄目前不是 git repository。

## Q1. [專案管理] 高可用要求的真正目的

意圖聲明裡同時寫了「僅作內部／工作坊示範、不公開上線」和「不能單點故障、要可擴展、CI/CD、RDS」。這兩者的投入差很多，要先釐清高可用要做到什麼程度。

A. 示範可擴展、高可用的雲端架構本身就是工作坊的學習目標，要真的做到多可用區
B. 之後打算正式上線，現在先把基礎打好
C. 架構要「能」擴展、沒有設計上的單點，但示範期間可以用最小規模運行以節省成本
D. 尚未定義
X. Other (please specify)

[Answer]: A

## Q2. [產品] 便便點數的「錢」和下單的關係

點掉便便可以拿到錢、存夠就能買商品，而第一版不串真實金流。這筆錢要怎麼用在下單上？

A. 只能用遊戲內點數購買，完全不涉及真實金額
B. 點數可以折抵部分金額，其餘照原本的下單流程（仍不串真實金流）
C. 兩種都可以：用點數兌換，或照原本方式下單
D. 尚未定義
X. Other (please specify)

[Answer]: A

## Q3. [維運] AWS 帳號與區域

部署會用到哪個 AWS 帳號與區域？現有部署腳本預設是 ap-northeast-2（首爾）。

A. 已有 AWS 帳號，沿用 ap-northeast-2（首爾）
B. 已有 AWS 帳號，改用 ap-northeast-1（東京）
C. 已有 AWS 帳號，使用其他區域（請說明）
D. 尚未有帳號或尚未決定
X. Other (please specify)

[Answer]: X. 應該要是us-east-1（原答 A，核准時更正）

## Q4. [開發] 程式碼存放與 CI/CD 平台

CI/CD 需要程式碼放在版本控制平台上，但目前專案目錄不是 git repository。要用哪個平台？

A. GitHub，用 GitHub Actions 做 CI/CD
B. GitHub 存放程式碼，用 AWS CodePipeline／CodeBuild 做 CI/CD
C. GitLab，用 GitLab CI
D. 尚未決定
X. Other (please specify)

[Answer]: X. 等等專案統一改動在這個repo: https://github.com/chaoting-sun/inventrix

## Q5. [開發] RDS 資料庫引擎

改用 RDS 時要選哪種資料庫引擎？現有資料表（使用者、商品、訂單、訂單明細）都是標準的關聯式結構。

A. PostgreSQL
B. MySQL
C. 交給後續設計階段建議
D. 尚未決定
X. Other (please specify)

[Answer]: A

## Q6. [專案管理] 時程

工作坊的成果發表大約在什麼時候？這決定第一版能做多少。

A. 1 週內
B. 2–4 週內
C. 1–3 個月內
D. 尚未定義
X. Other (please specify)

[Answer]: X. 1.5小時內

## Q7. [專案管理] 雲端費用

多可用區的資料庫與多個容器會持續產生 AWS 費用。費用上有什麼限制？

A. 有每月上限（請寫出金額）
B. 只在示範期間短暫運行，用完就刪除
C. 沒有特別限制
D. 尚未定義
X. Other (please specify)

[Answer]: C

## Q8. [合規] 資料與合規要求

第一版不串真實金流，所以不涉及信用卡資料。網站上會有真實的使用者個資嗎？

A. 只用測試或假資料，沒有真實個資
B. 會有真實使用者的帳號、Email 等個資
C. 有特定的法規或公司規範要遵守（請說明）
D. 尚未定義
X. Other (please specify)

[Answer]: A

## Q9. [開發] 團隊的技術背景

團隊對這次會用到的技術熟悉到什麼程度？

A. 熟悉 React／TypeScript／Node.js，也熟悉 AWS 容器服務與 CI/CD
B. 熟悉 React／TypeScript／Node.js，但 AWS 容器服務與 CI/CD 經驗較少
C. 主要靠 AI 協助產生程式，團隊的相關經驗有限
D. 尚未定義
X. Other (please specify)

[Answer]: A

## Q10. [開發] CI/CD 工具

程式碼放在 GitHub（chaoting-sun/inventrix）。要用哪個工具做自動化部署？

A. GitHub Actions
B. AWS CodePipeline／CodeBuild（以 GitHub 為來源）
C. 交給後續設計階段建議
D. 尚未決定
X. Other (please specify)

[Answer]: B

## Q11. [專案管理] 時程與範圍的取捨

這幾個答案彼此衝突：

- 時程：1.5 小時內要成果發表（Q6）
- 基礎設施：真的做到多可用區（Q1）、容器、CI/CD、RDS PostgreSQL（意圖聲明 Q11–Q13、本階段 Q5）
- 產品：吉祥物反應、像素風格、養成、動畫音效、便便點數兌換（意圖聲明 Q4、本階段 Q2）
- 流程：這次的 mvp 流程共 20 個階段，每個都要你審核

要在 1.5 小時內把這些全部建好、部署上 AWS 並走完 20 個審核點，風險非常高：多可用區資料庫、容器叢集、負載平衡與 CI/CD 管線光是建立就需要不少時間，而且第一次部署很少一次成功。哪一項優先？

A. 時程優先：1.5 小時內一定要有可展示的版本；基礎設施與互動範圍都可以縮減
B. 基礎設施優先：多可用區、容器、CI/CD、RDS 一定要做到；網站互動先做最核心的部分（便便點數兌換與吉祥物基本反應）
C. 完整範圍優先：全部都要做到，1.5 小時只展示做到哪裡
D. 尚未決定
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- 高可用：原本希望真的做到多可用區（Q1），但時程優先後可以縮減（Q11）
- 點數用法：只能用遊戲內點數購買，完全不涉及真實金額（Q2）
- AWS：已有帳號，區域為 us-east-1（Q3，核准時由 ap-northeast-2 更正）
- 程式碼：之後的修改統一放在 GitHub repo chaoting-sun/inventrix（Q4）
- 資料庫：RDS for PostgreSQL（Q5）
- 時程：1.5 小時內成果發表（Q6）
- 費用：沒有特別限制（Q7）
- 資料：只用測試或假資料，沒有真實個資（Q8）
- 團隊：熟悉 React／TypeScript／Node.js，也熟悉 AWS 容器服務與 CI/CD（Q9）
- CI/CD：AWS CodePipeline／CodeBuild，以 GitHub 為來源（Q10）
- 取捨：時程優先，1.5 小時內一定要有可展示版本；基礎設施與互動範圍都可以縮減，縮減哪些在下一個「範圍定義」階段決定（Q11）

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
