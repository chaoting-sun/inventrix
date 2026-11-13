# Code Structure

## 目錄配置

```
./
├── README.md, AGENTS.md, LICENSE      # 工作坊說明（非應用程式碼）
├── AI-DLC v2 Config Map.html          # AI-DLC 設定說明頁（非應用程式碼）
└── inventrix-code/                    # 應用程式 pnpm workspace
    ├── package.json, pnpm-workspace.yaml, pnpm-lock.yaml
    ├── deploy.sh, destroy.sh, setup_info.txt
    ├── inventrix-key.pem              # EC2 私鑰（安全問題，見 code-quality-assessment.md）
    └── packages/
        ├── api/
        │   ├── public/images/         # 24 張種子商品圖 + AI 生成圖寫入處
        │   └── src/
        │       ├── index.ts           # app 進入點
        │       ├── db.ts              # schema + 種子 + db 單例
        │       ├── middleware/        # auth.ts, rateLimit.ts
        │       ├── routes/            # auth.ts, products.ts, orders.ts, analytics.ts
        │       └── services/          # imageGenerator.ts
        └── frontend/
            ├── index.html, vite.config.ts
            └── src/
                ├── main.tsx, App.tsx, index.css
                ├── context/AuthContext.tsx
                ├── components/Layout.tsx
                └── pages/             # 9 個頁面元件
```

## 檔案分類

| 分類 | 檔案 |
|---|---|
| Configuration | `api/src/index.ts`、`frontend/vite.config.ts`、各 `package.json`、`tsconfig*.json`、`pnpm-workspace.yaml` |
| Model/Entity + Migration + Repository（合一） | `api/src/db.ts` |
| Controller/Handler | `api/src/routes/auth.ts`、`products.ts`、`orders.ts`、`analytics.ts` |
| Middleware | `api/src/middleware/auth.ts`、`rateLimit.ts` |
| Service | `api/src/services/imageGenerator.ts` |
| UI 狀態 | `frontend/src/context/AuthContext.tsx` |
| UI 元件 / 頁面 | `frontend/src/components/Layout.tsx`、`frontend/src/pages/*.tsx`、`App.tsx`、`main.tsx` |
| Static/Asset | `frontend/src/index.css`、`frontend/index.html`、`api/public/images/*.png` |
| 部署腳本 | `deploy.sh`、`destroy.sh`、`setup_info.txt` |
| Test | 無 |

## 程式碼模式

- **後端 ESM**：`"type": "module"`，相對 import 帶 `.js` 副檔名（例：`import db from '../db.js'`）。
- **Router-per-resource**：每個資源一個 `Router()`，在 `index.ts` 以 `/api/<resource>` 掛載。
- **Middleware 串接順序**：`protectedRouteRateLimit → authenticate → requireAdmin → handler`。
- **直接 SQL**：handler 內以 `db.prepare(sql).get/all/run` 同步存取，結果大量 `as any`。
- **錯誤回應格式**：`{ error: string }` 搭配 400/401/403/404/500。
- **前端頁面模式**：每頁自行宣告 interface、`useState` + `useEffect(fetch)`，以 inline style 排版；共用狀態只有 `AuthContext`。
- **路由保護**：`App.tsx` 的 `ProtectedRoute`（`adminOnly` 參數）僅做前端導頁，真正授權在後端 middleware。

## 依賴鄰接表（內部）

```
api/index.ts        -> db.ts, routes/auth.ts, routes/products.ts, routes/orders.ts, routes/analytics.ts
routes/auth.ts      -> db.ts, middleware/auth.ts, middleware/rateLimit.ts
routes/products.ts  -> db.ts, middleware/auth.ts, middleware/rateLimit.ts, services/imageGenerator.ts
routes/orders.ts    -> db.ts, middleware/auth.ts, middleware/rateLimit.ts
routes/analytics.ts -> db.ts, middleware/auth.ts, middleware/rateLimit.ts
frontend/main.tsx   -> App.tsx, index.css
frontend/App.tsx    -> context/AuthContext.tsx, components/Layout.tsx, pages/*
pages/*, Layout.tsx -> context/AuthContext.tsx（Storefront 除外）
```

無循環相依。
