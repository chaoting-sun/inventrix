<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-13T05:56:29Z — 專案不是 git repository，沒有 CI；Way of Working 與 Deployment 只能由 `deploy.sh`/`destroy.sh` 推論，草稿全部標為推論。
- 2026-11-13T05:56:29Z — `infra` scope 為 `skeleton: on`，但沒有 Unit DAG，依 `org.md` 不觸發 skeleton 儀式；草稿改以部署後無憑證警告作為端到端驗證。

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-13T05:56:29Z — 草稿偏離 `org.md` 的 trunk-based squash-merge 與 on-merge staging deploy 預設，因為沒有 git、沒有 staging；偏離理由記入 `team-practices.md`，待訪談確認。

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-13T05:56:29Z — Methodology 草稿選 test-after（`org.md` 預設），驗證改為部署後 smoke test；代價是 `infra` scope 的 80% coverage 下限無法滿足，需人決定。

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-13T05:56:29Z — sandbox 帳號是否有網域或 Route 53 hosted zone、`WSParticipantRole` 能否使用 CloudFront/ACM，決定受信任憑證的取得方式。
- 2026-11-13T05:56:29Z — security group 只開放部署者 `/32`；需確認網站是否要讓其他人連線。
- 2026-11-13T05:56:29Z — `JWT_SECRET` 有寫死的預設值，與 `AGENTS.md` 的秘密資訊規則衝突；不屬於本 intent 範圍，交由 requirements-analysis 決定是否納入。
