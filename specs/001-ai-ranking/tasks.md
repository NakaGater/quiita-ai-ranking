# Tasks: Qiita AI Ranking

**Input**: Design documents from `/specs/001-ai-ranking/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Constitution requires unit tests for core business logic (scorer, fetcher). Test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/`, `scripts/`, `data/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Next.js プロジェクト初期化と基本構成

- [x] T001 Initialize Next.js 14 project with TypeScript and Tailwind CSS using `npx create-next-app@14`
- [x] T002 Configure tsconfig.json with strict mode enabled and path aliases
- [x] T003 [P] Configure next.config.js for static export (`output: 'export'`)
- [x] T004 [P] Configure ESLint and Prettier with project rules
- [x] T005 [P] Create .env.example with QIITA_API_TOKEN placeholder and .env.local in .gitignore
- [x] T006 [P] Install Vitest and configure vitest.config.ts for TypeScript

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 全ユーザーストーリーで共有される型定義と設定

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Define TypeScript types (Article, Tag, ArticleUser, RankedArticle, RankingMetadata, RankingData) in src/types/index.ts per data-model.md
- [x] T008 [P] Create config module with TARGET_TAGS, scoring weights (3:2:1), PERIOD_DAYS=30, RANKING_SIZE=50, and API constants in src/lib/config.ts
- [x] T009 [P] Create data/ directory with .gitkeep and add data/*.json to .gitignore

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 2 - 記事データの自動収集 (Priority: P1)

**Goal**: Qiita API v2からAI関連タグの直近30日間の記事を取得し、JSONファイルに保存する

**Independent Test**: `npx tsx scripts/fetch-articles.ts` を実行し、data/articles.json にデータが保存されることを確認する

### Tests for User Story 2

- [x] T010 [P] [US2] Write unit tests for fetcher (API呼び出しモック、レートリミット処理、重複排除、日付フィルタ) in tests/unit/fetcher.test.ts

### Implementation for User Story 2

- [x] T011 [US2] Implement Qiita API fetcher with rate limiting, pagination, date filtering, and deduplication in src/lib/fetcher.ts. Must use TARGET_TAGS from config, handle Rate-Remaining header, retry on 429, filter to last 30 days, deduplicate by article id
- [x] T012 [US2] Create fetch-articles CLI script that calls fetcher and writes results to data/articles.json in scripts/fetch-articles.ts

**Checkpoint**: `npx tsx scripts/fetch-articles.ts` でデータ取得が動作する

---

## Phase 4: User Story 3 - スコアリングとランキング算出 (Priority: P1)

**Goal**: 取得した記事データにスコアリングを適用し、上位50件のランキングJSONを生成する

**Independent Test**: サンプルのdata/articles.jsonに対して `npx tsx scripts/generate-ranking.ts` を実行し、data/ranked.json が正しく生成されることを確認する

### Tests for User Story 3

- [x] T013 [P] [US3] Write unit tests for scorer (スコア計算: likes*3 + stocks*2 + freshness, ソート順, 上位50件切り出し, 0いいね0ストック除外, freshness_bonus計算) in tests/unit/scorer.test.ts

### Implementation for User Story 3

- [x] T014 [US3] Implement scoring algorithm in src/lib/scorer.ts. Score formula: `likes_count * 3 + stocks_count * 2 + max(0, 30 - days_since_posted)`. Filter out articles with likes=0 AND stocks=0. Sort by score descending. Assign rank (1-based). Return top RANKING_SIZE items with RankingMetadata
- [x] T015 [US3] Create generate-ranking CLI script that reads data/articles.json, runs scorer, and writes data/ranked.json in scripts/generate-ranking.ts

**Checkpoint**: `npx tsx scripts/generate-ranking.ts` でランキングJSON生成が動作する

---

## Phase 5: User Story 1 - ランキング一覧の閲覧 (Priority: P1) 🎯 MVP

**Goal**: ランキングデータをWebページとして表示する。記事タイトル、著者名、スコア、タグ一覧、投稿日を表示し、タイトルからQiita記事にリンクする

**Independent Test**: サンプルのdata/ranked.jsonを配置し、`npm run dev` でランキングページが正しく表示されることを確認する

### Implementation for User Story 1

- [x] T016 [P] [US1] Create Header component with site title and last updated timestamp in src/components/Header.tsx
- [x] T017 [P] [US1] Create ArticleRow component displaying rank, title (as link to Qiita URL), author name, score, tags, and posted date in src/components/ArticleRow.tsx
- [x] T018 [US1] Create RankingTable component that renders a list of ArticleRow components with table headers in src/components/RankingTable.tsx
- [x] T019 [US1] Configure Tailwind global styles and responsive layout in src/app/globals.css
- [x] T020 [US1] Create root layout with metadata (title, description) and font configuration in src/app/layout.tsx
- [x] T021 [US1] Create ranking page that imports data/ranked.json at build time, passes data to RankingTable, and shows empty state message when no articles in src/app/page.tsx

**Checkpoint**: data/ranked.json を配置して `npm run build` → `out/` に静的HTMLが生成され、ランキングが表示される

---

## Phase 6: User Story 4 - 日次バッチ更新 (Priority: P2)

**Goal**: データ取得→スコアリング→ビルドを一括実行するバッチスクリプトと、GitHub Actionsによる日次自動更新を提供する

**Independent Test**: `npx tsx scripts/update.ts` を実行し、fetch→score→build の全工程が正常に完了することを確認する

### Implementation for User Story 4

- [x] T022 [US4] Create update batch script that sequentially runs fetch-articles, generate-ranking, and `npm run build` in scripts/update.ts
- [x] T023 [US4] Create GitHub Actions workflow for daily cron (UTC 0:00) that runs update script and deploys to GitHub Pages in .github/workflows/daily-update.yml. Use QIITA_API_TOKEN from GitHub Secrets

**Checkpoint**: バッチスクリプトで全工程が自動完了し、GitHub Actionsでスケジュール実行できる

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 品質改善とドキュメント整備

- [x] T024 [P] Add mobile responsive styles to RankingTable and ArticleRow components
- [x] T025 Run full pipeline validation per quickstart.md (setup → fetch → score → build → verify output)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US2 (Phase 3)**: Depends on Foundational. Data fetching layer
- **US3 (Phase 4)**: Depends on Foundational. Can be developed in parallel with US2 using sample data
- **US1 (Phase 5)**: Depends on Foundational. Can be developed in parallel with US2/US3 using sample ranked.json
- **US4 (Phase 6)**: Depends on US2 + US3 + US1 completion (orchestrates all three)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **US3 (P1)**: Can start after Foundational (Phase 2) - Can use sample articles.json for development
- **US1 (P1)**: Can start after Foundational (Phase 2) - Can use sample ranked.json for development
- **US4 (P2)**: Requires US2 + US3 + US1 to be complete (integration of all pipelines)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (for US2, US3)
- Library modules before CLI scripts
- Components before pages (for US1)
- Story complete before moving to next priority

### Parallel Opportunities

- T003, T004, T005, T006 can run in parallel (Phase 1 setup tasks)
- T008, T009 can run in parallel (Phase 2 foundational tasks)
- T010 (US2 tests) and T013 (US3 tests) can run in parallel
- T016, T017 (Header and ArticleRow) can run in parallel
- US1, US2, US3 can be developed in parallel with sample data after Phase 2

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all parallel setup tasks together:
Task: "Configure next.config.js for static export in next.config.js"
Task: "Configure ESLint and Prettier"
Task: "Create .env.example and update .gitignore"
Task: "Install Vitest and configure vitest.config.ts"
```

## Parallel Example: User Story 1

```bash
# Launch parallel component tasks:
Task: "Create Header component in src/components/Header.tsx"
Task: "Create ArticleRow component in src/components/ArticleRow.tsx"
```

---

## Implementation Strategy

### MVP First (US2 → US3 → US1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (types and config)
3. Complete Phase 3: US2 - Data fetching
4. Complete Phase 4: US3 - Scoring
5. Complete Phase 5: US1 - Display
6. **STOP and VALIDATE**: Full pipeline test (fetch → score → build → view)
7. Deploy if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US2 → Test fetch independently (MVP data layer)
3. Add US3 → Test scoring independently (MVP scoring)
4. Add US1 → Test display independently → Deploy/Demo (MVP complete!)
5. Add US4 → Daily automated updates

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Constitution requires unit tests for scorer and fetcher (Principle V: Testability)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
