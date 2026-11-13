# 需求分析：釐清問題

依據：`ideation/intent-capture/intent-statement.md`、`ideation/scope-definition/scope-document.md`、`ideation/rough-mockups/wireframes.md`，以及現有程式碼知識庫 `aidlc/spaces/default/codekb/AIDLC-Workshop-v2/`（商品只有金額 `price`；訂單記錄小計、10% GST 與總額，後台分析依賴這些金額；`users` 沒有點數欄位）。

## Q1. [產品] 商品的點數價格怎麼訂

每個商品要有點數價格，但後台管理頁這次不改，所以沒有地方手動設定點數價格。

A. 依現有售價自動換算：1 元 = 1 點（無條件進位成整數）
B. 依現有售價自動換算：1 元 = 10 點
C. 所有商品分成三個固定點數價位（便宜、中等、昂貴），依售價歸類
D. 交給我決定
X. Other (please specify)

[Answer]: A（使用者交由我決定，採推薦選項）

## Q2. [產品] 便便與點數的節奏

決定展示時多快能買到一件商品。新帳號從 0 點開始。

A. 每 10 秒冒出一坨，每坨 +10 點，畫面上最多 3 坨
B. 每 5 秒冒出一坨，每坨 +5 點，畫面上最多 5 坨
C. 每 20 秒冒出一坨，每坨 +50 點，畫面上最多 2 坨
D. 交給我決定（以展示時 1–2 分鐘內能買到一件便宜商品為準）
X. Other (please specify)

[Answer]: A（使用者交由我決定，採推薦選項）

## Q3. [產品] 用點數下單後，訂單金額與後台分析

後台的訂單與分析頁依賴訂單的金額（小計、GST、總額），這次後台不改。

A. 訂單照舊記錄金額與 GST（後台照常運作），另外記錄花了多少點
B. 訂單只記點數，金額欄位記 0（後台營收會顯示 0）
C. 交給我決定
D. 尚未決定
X. Other (please specify)

[Answer]: A（使用者交由我決定，採推薦選項）

## Q4. [產品] 未登入時按「加入購物車」

A. 可以加入，購物車先存在瀏覽器，結帳時再登入
B. 按下時先導向登入，登入後回到商品頁
C. 交給我決定
D. 尚未決定
X. Other (please specify)

[Answer]: A（使用者交由我決定，採推薦選項）
