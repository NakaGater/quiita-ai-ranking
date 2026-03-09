# Quickstart: Qiita AI Ranking

## Prerequisites

- Node.js 20 LTS
- npm
- Qiita APIアクセストークン（https://qiita.com/settings/tokens で発行）

## Setup

```bash
# リポジトリをクローン
git clone <repo-url>
cd quiita-ai-ranking

# 依存パッケージをインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集して QIITA_API_TOKEN を設定
```

## 環境変数

| Variable | Required | Description |
|----------|----------|-------------|
| QIITA_API_TOKEN | Yes | Qiita APIアクセストークン |

## データ取得 & ランキング生成

```bash
# 記事データを取得
npx tsx scripts/fetch-articles.ts

# スコアリング & ランキング生成
npx tsx scripts/generate-ranking.ts

# 一括実行（取得 → スコアリング → ビルド）
npx tsx scripts/update.ts
```

## 開発サーバー

```bash
# 開発モードで起動
npm run dev

# ブラウザで http://localhost:3000 を開く
```

## ビルド & デプロイ

```bash
# 静的サイトをビルド
npm run build

# out/ ディレクトリに静的ファイルが生成される
```

## テスト

```bash
# ユニットテスト実行
npm test
```

## ディレクトリ構成

```text
src/
├── types/index.ts       # 型定義
├── lib/
│   ├── fetcher.ts       # Qiita API通信
│   ├── scorer.ts        # スコアリング
│   └── config.ts        # 設定・定数
├── app/
│   ├── layout.tsx       # レイアウト
│   ├── page.tsx         # ランキングページ
│   └── globals.css      # スタイル
├── components/          # UIコンポーネント
scripts/                 # バッチスクリプト
data/                    # 生成データ（JSON）
tests/                   # テスト
```
