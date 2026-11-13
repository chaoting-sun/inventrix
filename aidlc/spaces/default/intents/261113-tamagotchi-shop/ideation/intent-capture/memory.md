<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-13T06:11:45Z — 意圖聲明加入「使用者指定的限制條件」一節（容器、CI/CD、RDS）；構想階段規則不鼓勵技術細節，但這是使用者在摘要確認時主動提出的要求，記錄為 Q11–Q13 並明確交由可行性與限制階段評估，以保留可追溯性。

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-13T06:11:45Z — 點數機制的細節（便便出現頻率、每次獲得金額、是否完全取代付款）未在本階段定義，需求分析時要問；另外「僅內部示範」與「不能單點、要可擴展、CI/CD」的投入程度差距，可行性階段應確認成本與規模。
