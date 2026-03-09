export interface Tag {
  name: string;
}

export interface ArticleUser {
  id: string;
  name: string;
  profile_image_url: string;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  likes_count: number;
  stocks_count: number;
  tags: Tag[];
  created_at: string;
  user: ArticleUser;
}

export interface RankedArticle extends Article {
  score: number;
  rank: number;
  freshness_bonus: number;
}

export interface RankingMetadata {
  generated_at: string;
  total_articles_fetched: number;
  ranked_count: number;
  target_tags: string[];
  period_days: number;
}

export interface RankingData {
  metadata: RankingMetadata;
  articles: RankedArticle[];
}
