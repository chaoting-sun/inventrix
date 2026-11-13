# 建置說明：issue #3（PostgreSQL）

依據：`construction/code-generation/code-generation-plan.md`、`construction/code-generation/unit-test-instructions.md`、`construction/code-generation/code-summary.md`。

## 前置需求

- Node.js 22。預設的 Homebrew Node 26 缺 `libsimdjson`，無法啟動；`bcrypt` 是 native module，也要用 Node 22。
  - 本機：`export PATH=/opt/homebrew/opt/node@22/bin:$PATH`
- pnpm 9：沒有安裝時用 `npx -y pnpm@9`。
- 容器執行環境：Docker 或 podman（本機用 podman compose）。

## 環境設定

在 `inventrix-code/` 下：

```bash
cp .env.example .env          # 設定 POSTGRES_PASSWORD 與 DATABASE_URL
docker compose up -d          # 或 podman compose up -d，啟動 PostgreSQL 16
```

`.env` 已被 `.gitignore` 排除，不要提交。

## 安裝與建置

```bash
npx -y pnpm@9 install
npx -y pnpm@9 build                         # api (tsc) + frontend (vite build)
npx -y pnpm@9 --filter api exec tsc --noEmit
```

## 啟動

```bash
set -a; . ./.env; set +a
npx -y pnpm@9 dev
```

API 啟動時會自動建表與寫入種子資料。沒有 `DATABASE_URL` 時，API 會印出錯誤並以 exit 1 結束。

## 建置驗證

- `pnpm build` 結束碼為 0，`packages/api/dist/` 與 `packages/frontend/dist/` 產生。
- `curl http://localhost:3000/api/products` 回傳商品列表。

## 常見問題

| 症狀 | 處理 |
|------|------|
| `Library not loaded: libsimdjson` | 改用 Node 22 |
| `DATABASE_URL is required` | 先載入 `.env` |
| `ECONNREFUSED 5432` | 先 `docker compose up -d` |
| 要清掉本機資料 | `docker compose down -v` |
