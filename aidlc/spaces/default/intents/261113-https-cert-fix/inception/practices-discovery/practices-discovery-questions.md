# Practices Discovery — 問題

這些問題只問程式碼和設定看不出來的團隊做法。每題都附上建議答案。

## Q1. [開發者] 版本控制

專案目前沒有用 git。這次要修改 `deploy.sh` 和 nginx 設定，改壞了需要能還原。

A. 直接修改，不用 git
B. 先執行 `git init`，再直接在 `main` 上修改（建議：成本低，改壞了能還原）
X. Other (please specify)

[Answer]: B

## Q2. [開發者] 程式碼風格

專案沒有 formatter 或 linter。修改 shell 腳本和 nginx 設定時，要用什麼風格？

A. 沿用現有寫法（`set -e`、互動式 `read -p`），不新增工具（建議）
B. 加上 `shellcheck` 檢查 shell 腳本
C. 加上 Prettier + ESLint，涵蓋整個專案
X. Other (please specify)

[Answer]: A

## Q3. [品質工程師] 完成標準

專案沒有自動化測試，也沒有 CI。框架對 infra 工作的預設是 80% coverage 加上 CI。這次修正要怎麼算完成？

A. 重新部署後做 smoke test：瀏覽器和 `curl`（不加 `-k`）都不再出現憑證警告、HTTP 會轉到 HTTPS、`/api` 正常回應（建議）
B. 照框架預設，補單元測試並達到 80% coverage，再加上 CI
X. Other (please specify)

[Answer]: A

## Q4. [品質工程師] 先做一條最小的完整路徑嗎？

Walking skeleton 是一個能從頭跑到尾的最小版本。它先做出來，證明各部分接得起來，之後再加真正的功能。

A. 不另外做。這次只修一個基礎設施問題，直接用「重新部署後沒有憑證警告」當端到端驗證（建議）
B. 要做
X. Other (please specify)

[Answer]: A

## Q5. [發布工程師] 部署方式與網域

受信任的憑證必須綁在網域上，只有 IP 拿不到。workshop 的 sandbox 帳號可能沒有自己的網域。

A. 修改 `deploy.sh`，改用 AWS 提供的網域，例如 CloudFront 的 `*.cloudfront.net`（建議：改動最小，適合限時 workshop）
B. 改用 IaC（CloudFormation 或 CDK），一樣用 AWS 提供的網域
C. 我有自己的網域，要用它
X. Other (please specify)

[Answer]: X. ec2 應該要有 public ip

## Q6. [維運工程師] 誰能連線

目前 security group 只開放你部署時的 IP。有些憑證和網域做法需要對外開放 port 80 或 443。

A. 只給自己用，盡量維持只開放我的 IP（建議）
B. 要讓 workshop 其他人或任何人都能連線
X. Other (please specify)

[Answer]: A

## Q7. [發布工程師] 直接用 EC2 public IP 拿受信任的憑證

你在 Q5 回答「ec2 應該要有 public ip」，在 Q6 選了「只給自己用」。直接幫 IP 簽受信任的憑證是可行的，例如 Let's Encrypt 的 IP 憑證。但它有兩個限制。第一，Let's Encrypt 要從網際網路連進 port 80 驗證，所以 port 80 必須對所有人開放，這和「只開放我的 IP」衝突。第二，IP 憑證有效期很短，要自動續期。另外，EC2 重開機後 public IP 會變，要改用 Elastic IP。

A. 用 Let's Encrypt IP 憑證，搭配 Elastic IP。port 80 對所有人開放，但只回應驗證請求和轉址。port 443 仍然只開放我的 IP（建議）
B. 前面加 CloudFront，用 `*.cloudfront.net` 的憑證。用 WAF 限制只有我的 IP 能連
C. 保留自簽憑證，把它加進我這台電腦的信任清單。只有我的電腦不會出現警告
X. Other (please specify)

[Answer]:
