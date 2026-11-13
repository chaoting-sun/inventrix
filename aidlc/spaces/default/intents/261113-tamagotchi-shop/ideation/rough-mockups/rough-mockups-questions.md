# 粗略介面草圖：釐清問題

依據：`ideation/intent-capture/intent-statement.md`、`ideation/scope-definition/scope-document.md`、`ideation/scope-definition/intent-backlog.md`，以及現有前台（`inventrix-code/packages/frontend/src/`）：首頁商品列表、商品頁、我的訂單、登入／註冊。現有前台**沒有購物車**，是在商品頁選數量後直接下單，而且下單前必須登入。

## Q1. [產品] 購物車

範圍裡的流程是「瀏覽 → 加入購物車 → 用點數下單」，吉祥物也要在「加入購物車」時開心，但現有前台沒有購物車。要怎麼處理？

A. 新增購物車頁，可以放多件商品一起用點數結帳
B. 新增簡易購物車（畫面側邊的抽屜，不另開頁面）
C. 不做購物車，沿用商品頁直接用點數購買；吉祥物改在按「購買」時開心
D. 尚未決定
X. Other (please specify)

[Answer]: A

## Q2. [產品] 登入時機

點數要存進資料庫，就得知道是誰的點數。現有前台下單前必須登入。

A. 沿用現有做法：逛商品不用登入，點便便、下單前要登入
B. 進站就要登入（展示時用示範帳號），所有點數都記在帳號上
C. 先逛、先點便便都不用登入，點數暫存在瀏覽器；下單時登入，再把點數併進帳號
D. 尚未決定
X. Other (please specify)

[Answer]: A

## Q3. [設計] 吉祥物與便便在畫面上的位置

A. 吉祥物固定在畫面右下角（像一台小掌機），便便隨機出現在整個頁面任何地方
B. 頁首放一台大掌機，吉祥物與便便都只出現在掌機螢幕裡
C. 吉祥物在右下角小掌機裡，便便隨機出現在商品列表之間
D. 交給設計決定
X. Other (please specify)

[Answer]: A

## Q4. [設計] 要支援的裝置

A. 只要桌機瀏覽器（成果發表用）
B. 桌機為主，手機也能正常瀏覽
C. 手機優先
D. 尚未定義
X. Other (please specify)

[Answer]: A
