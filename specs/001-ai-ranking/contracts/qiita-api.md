# Contract: Qiita API v2 Integration

## Endpoint

```
GET https://qiita.com/api/v2/items
```

## Authentication

```
Authorization: Bearer ${QIITA_API_TOKEN}
```

## Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | 検索クエリ（例: `tag:AI created:>2026-02-07`） |
| page | number | No | ページ番号（1-100、デフォルト1） |
| per_page | number | No | 1ページあたりの件数（1-100、デフォルト20） |

## Response (200 OK)

### Headers

| Header | Description |
|--------|-------------|
| Rate-Limit | リクエスト上限数 |
| Rate-Remaining | 残りリクエスト数 |
| Rate-Reset | リセット時刻（Unix timestamp） |
| Total-Count | 検索結果の総件数 |
| Link | ページネーションリンク |

### Body: Item[]

```typescript
interface QiitaItem {
  id: string;
  title: string;
  url: string;
  likes_count: number;
  stocks_count: number;
  tags: Array<{ name: string; versions: string[] }>;
  created_at: string; // ISO8601
  updated_at: string; // ISO8601
  user: {
    id: string;
    name: string;
    profile_image_url: string;
  };
  page_views_count: number | null;
}
```

## 使用するタグクエリ一覧

```typescript
const TARGET_TAGS = [
  "AI", "機械学習", "MachineLearning",
  "LLM", "ChatGPT", "GPT",
  "深層学習", "DeepLearning",
  "NLP", "自然言語処理",
  "生成AI", "Transformer"
];
```

## Rate Limit Strategy

- 認証済み: 1000 requests/hour
- リクエスト間隔: 最低100ms
- `Rate-Remaining` < 10 で一時停止
- 429レスポンス時: `Rate-Reset` まで待機後リトライ
