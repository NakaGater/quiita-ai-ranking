# Implementation Plan: Qiita AI Ranking

**Branch**: `001-ai-ranking` | **Date**: 2026-03-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-ranking/spec.md`

## Summary

Qiita API v2からAI/機械学習関連の記事を取得し、いいね数・ストック数・新しさを加味したスコアリングで上位50件のランキングを生成し、Next.js SSGで静的サイトとして配信する。データ取得とスコアリングはビルド時バッチで実行し、GitHub Actionsで日次自動更新する。

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) / Node.js 20 LTS
**Primary Dependencies**: Next.js 14 (Static Export), Tailwind CSS 3.x
**Storage**: JSON files (data/articles.json, data/ranked.json)
**Testing**: Vitest
**Target Platform**: Static hosting (Vercel / GitHub Pages)
**Project Type**: Static web application with build-time data fetching
**Performance Goals**: < 3秒で初期表示完了（静的HTMLのため実質即時）
**Constraints**: Qiita API認証済み1000req/h、取得期間30日、上位50件表示
**Scale/Scope**: 単一ページ、50件表示、日次更新

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Static-First | ✅ PASS | Next.js Static Export使用。API呼び出しはビルド時のみ |
| II. API Responsibility Separation | ✅ PASS | fetcher / scorer / UI を独立モジュールに分離 |
| III. Simplicity & YAGNI | ✅ PASS | 単一ページ、最小限の依存、ページネーションなし |
| IV. Type Safety | ✅ PASS | TypeScript strict mode、API型定義を明示 |
| V. Testability | ✅ PASS | スコアリングロジックにユニットテスト、APIモック使用 |

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-ranking/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── index.ts           # Article, RankedArticle, RankingMetadata型定義
├── lib/
│   ├── fetcher.ts         # Qiita API通信・記事取得
│   ├── scorer.ts          # スコアリングアルゴリズム
│   └── config.ts          # 定数・タグ一覧・重み設定
├── app/
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ランキングページ（SSG）
│   └── globals.css        # Tailwind CSS
├── components/
│   ├── RankingTable.tsx   # ランキングテーブルコンポーネント
│   ├── ArticleRow.tsx     # 記事行コンポーネント
│   └── Header.tsx         # ヘッダーコンポーネント
scripts/
│   ├── fetch-articles.ts  # データ取得CLIスクリプト
│   ├── generate-ranking.ts # スコアリング→ランキングJSON生成
│   └── update.ts          # fetch + generate を一括実行
data/
├── articles.json          # 取得した生記事データ
└── ranked.json            # スコアリング済みランキングデータ
tests/
└── unit/
    ├── scorer.test.ts     # スコアリングロジックのテスト
    └── fetcher.test.ts    # フェッチャーのテスト（モック）
```

**Structure Decision**: Next.js App Router構成の単一プロジェクト。
データ取得・スコアリングは `src/lib/` に配置し、ビルド時に
`scripts/` 経由で実行してJSONファイルを生成。Next.jsのSSGが
`data/ranked.json` を読み込んで静的HTMLを生成する。

## Complexity Tracking

> No violations. All constitution principles satisfied.
