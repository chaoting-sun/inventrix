# Business Overview

## 目的

Inventrix 是一個全端電子商務範例平台（`inventrix-code/README.md`），提供顧客端的虛擬商店與 Admin 端的商品、訂單、庫存管理及營運分析。本 repo 同時作為 AI-DLC v2 工作坊的 brownfield 練習專案（根目錄 `README.md`、`AGENTS.md`）。

## 使用者角色

| 角色 | 來源 | 可做的事 |
|---|---|---|
| 訪客 | 未登入 | 瀏覽商品列表與商品詳情 |
| Customer | `users.role = 'customer'`，可自行註冊 | 下單（單一商品）、查看自己的訂單 |
| Admin | `users.role = 'admin'`，僅由種子資料建立 | 商品 CRUD、AI 生成商品圖、變更訂單狀態、查看 Dashboard 與庫存 |

## 核心業務能力

1. **商品目錄**：24 項 3C 商品種子資料（`packages/api/src/db.ts:62-87`），含名稱、描述、價格（美元、`REAL`）、庫存、圖片。
2. **下單**：伺服器端以商品現價計算 `subtotal`，加上寫死的 10% GST 得出 `total`，並扣減庫存；訂單初始狀態為 `pending`。
3. **訂單履約**：Admin 可在 `pending → processing → shipped → delivered / cancelled` 之間任意切換（無狀態機約束）。
4. **庫存監控**：庫存 `< 10` 視為 low stock，`= 0` 為 out of stock。
5. **營運分析**：總營收（排除 cancelled）、訂單數、商品數、低庫存數、最近 10 筆訂單、熱銷前 5、各狀態訂單數。
6. **AI 商品圖**：Admin 透過 Amazon Bedrock Nova Canvas 依商品名稱與描述生成圖片。

## 業務規則摘要

- 註冊只會建立 `customer`；無法經 API 建立 admin。
- 下單時庫存不足即整筆拒絕（400）。
- 顧客只能讀取自己的訂單；admin 可讀取全部。
- 目前沒有購物車、點數、折扣或付款流程；「付款」不存在，下單即成立訂單。

## 與本次 intent 的關聯

本次 intent（Tamagotchi 主題商店）會改造顧客端：以點數取代金錢購買、加入購物車頁、吉祥物互動。Admin 端與分析的業務語意（以 `price`、`subtotal/gst/total` 計算營收）須保持不變，兩套計價方式如何共存是後續需求階段必須釐清的問題。技術細節見 `architecture.md` 與 `code-quality-assessment.md`。
