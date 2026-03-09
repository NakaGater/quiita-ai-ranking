# Data Model: Qiita AI Ranking

**Date**: 2026-03-09
**Feature**: 001-ai-ranking

## Entities

### Article

Qiita APIから取得した生記事データ。

| Field | Type | Description |
|-------|------|-------------|
| id | string | Qiita記事の一意識別子 |
| title | string | 記事タイトル |
| url | string | Qiita記事のURL |
| likes_count | number | いいね数 |
| stocks_count | number | ストック数 |
| tags | Tag[] | タグ一覧 |
| created_at | string (ISO8601) | 投稿日時 |
| user | ArticleUser | 著者情報 |

### Tag

記事に付与されたタグ。

| Field | Type | Description |
|-------|------|-------------|
| name | string | タグ名 |

### ArticleUser

記事の著者情報（Qiita APIのuserオブジェクトから必要な項目のみ）。

| Field | Type | Description |
|-------|------|-------------|
| id | string | ユーザーID |
| name | string | 表示名 |
| profile_image_url | string | プロフィール画像URL |

### RankedArticle

スコアリング済みの記事データ。Articleを拡張。

| Field | Type | Description |
|-------|------|-------------|
| (Article全フィールド) | - | Articleの全属性を継承 |
| score | number | 複合スコア |
| rank | number | ランキング順位（1始まり） |
| freshness_bonus | number | 新しさボーナス（0-30） |

### RankingMetadata

ランキング全体のメタ情報。

| Field | Type | Description |
|-------|------|-------------|
| generated_at | string (ISO8601) | ランキング生成日時 |
| total_articles_fetched | number | 取得した記事総数 |
| ranked_count | number | ランキング掲載件数 |
| target_tags | string[] | 検索対象タグ一覧 |
| period_days | number | 対象期間（日数） |

## Data Flow

```text
Qiita API → fetcher.ts → data/articles.json (Article[])
                              ↓
                        scorer.ts
                              ↓
                     data/ranked.json ({ metadata: RankingMetadata, articles: RankedArticle[] })
                              ↓
                      Next.js SSG (page.tsx が ranked.json を import)
                              ↓
                       Static HTML (out/)
```

## Storage Format

### data/articles.json

```json
[
  {
    "id": "abc123",
    "title": "LLMを使った...",
    "url": "https://qiita.com/user/items/abc123",
    "likes_count": 150,
    "stocks_count": 80,
    "tags": [{ "name": "LLM" }, { "name": "AI" }],
    "created_at": "2026-03-01T10:00:00+09:00",
    "user": {
      "id": "user1",
      "name": "Taro",
      "profile_image_url": "https://..."
    }
  }
]
```

### data/ranked.json

```json
{
  "metadata": {
    "generated_at": "2026-03-09T00:00:00Z",
    "total_articles_fetched": 200,
    "ranked_count": 50,
    "target_tags": ["AI", "機械学習", "LLM", "ChatGPT", "..."],
    "period_days": 30
  },
  "articles": [
    {
      "id": "abc123",
      "title": "LLMを使った...",
      "url": "https://qiita.com/user/items/abc123",
      "likes_count": 150,
      "stocks_count": 80,
      "tags": [{ "name": "LLM" }, { "name": "AI" }],
      "created_at": "2026-03-01T10:00:00+09:00",
      "user": { "id": "user1", "name": "Taro", "profile_image_url": "https://..." },
      "score": 620,
      "rank": 1,
      "freshness_bonus": 22
    }
  ]
}
```

## Validation Rules

- `likes_count` と `stocks_count` が共に0の記事はランキング対象外
- `created_at` が直近30日以内の記事のみ対象
- 記事の重複排除は `id` フィールドで実施（複数タグ検索で同一記事が重複取得される可能性あり）
