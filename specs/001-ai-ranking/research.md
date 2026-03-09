# Research: Qiita AI Ranking

**Date**: 2026-03-09
**Feature**: 001-ai-ranking

## Qiita API v2 記事取得

**Decision**: `GET /api/v2/items` エンドポイントをクエリパラメータ `query=tag:AI` 形式で使用する。

**Rationale**: Qiita API v2はタグベースの検索をサポートしており、`query` パラメータでタグフィルタリングが可能。`page` (1-100) と `per_page` (1-100, default 20) でページネーション対応。各タグごとに最大100ページ × 100件 = 10,000件取得可能だが、直近30日でフィルタすれば十分収まる。

**Alternatives considered**:
- `GET /api/v2/tags/:tag/items` - タグ別取得も可能だが、日付フィルタが弱い
- GraphQL API - Qiitaは提供していない

## レートリミット対応

**Decision**: リクエスト間に最低100msの間隔を設け、レスポンスヘッダの `Rate-Remaining` を監視。残り10以下で一時停止。

**Rationale**: 認証済みで1時間あたり1000リクエスト。複数タグを検索する場合でも、各タグ数ページずつで十分なデータが集まる（12タグ × 5ページ = 60リクエスト程度）。

**Alternatives considered**:
- 固定レート制限（全リクエストに1秒間隔） - 不必要に遅い
- リトライなし - API障害時にデータが取れなくなる

## スコアリングアルゴリズム

**Decision**: `score = likes_count * 3 + stocks_count * 2 + freshness_bonus` で計算。`freshness_bonus` は投稿日からの経過日数に基づく減衰関数: `max(0, 30 - days_since_posted)` で0〜30の範囲。

**Rationale**: clarificationで決定した重み比率（3:2:1）に従う。いいね数が最もポピュラーな評価指標であるため最重視。新しさボーナスは30日以内の記事に線形減衰で付与し、投稿当日が最大30ポイント。

**Alternatives considered**:
- 対数スケール（log(likes+1)） - 初期段階では不必要な複雑さ
- 指数減衰 - 線形で十分。YAGNIの原則に従う

## フレームワーク選定

**Decision**: Next.js 14 App Router + Static Export (`output: 'export'`)

**Rationale**: Constitution で定義済み。SSGにより完全な静的HTMLを生成。ビルド時にJSONデータを読み込みページを生成するため、ランタイムのAPI依存なし。Vercel/GitHub Pagesに直接デプロイ可能。

**Alternatives considered**:
- Astro - SSG特化だが、Next.jsの方がエコシステムが大きい
- Vite + React SPA - SSGではなくクライアントサイドレンダリングになる

## データ永続化

**Decision**: JSONファイル (`data/articles.json`, `data/ranked.json`) でローカル保存。

**Rationale**: Constitution の Static-First原則に合致。データベース不要でシンプル。ファイルはgitで管理可能（ただし.gitignoreで除外し、ビルド時に生成）。

**Alternatives considered**:
- SQLite - 50件程度のデータには過剰
- 外部DB（Supabase等） - 不必要な複雑さと外部依存

## 日次バッチ更新

**Decision**: GitHub Actions の cron スケジュール（毎日UTC 0:00）でデータ取得→スコアリング→ビルド→デプロイのパイプラインを実行。

**Rationale**: 追加インフラ不要。GitHub Actionsの無料枠で十分。Qiita APIトークンはGitHub Secretsで安全に管理。

**Alternatives considered**:
- ローカルcron - 常時稼働マシンが必要
- Vercel Cron Functions - 静的エクスポートとの組み合わせが複雑
