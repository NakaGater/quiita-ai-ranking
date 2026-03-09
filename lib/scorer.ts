import type { Article, RankedArticle, RankingData } from '@/types';
import {
  SCORING_WEIGHTS,
  RANKING_SIZE,
  TARGET_TAGS,
  PERIOD_DAYS,
} from './config';

export function calculateScore(
  article: Article,
  now: Date,
): { score: number; freshness_bonus: number } {
  const createdAt = new Date(article.created_at);
  const daysSincePosted = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  const freshness_bonus = Math.max(0, 30 - daysSincePosted);

  const score =
    article.likes_count * SCORING_WEIGHTS.likes +
    article.stocks_count * SCORING_WEIGHTS.stocks +
    freshness_bonus * SCORING_WEIGHTS.freshness;

  return { score, freshness_bonus };
}

export function rankArticles(
  articles: Article[],
  now: Date = new Date(),
): RankingData {
  const filtered = articles.filter(
    (a) => a.likes_count > 0 || a.stocks_count > 0,
  );

  const scored: RankedArticle[] = filtered.map((article) => {
    const { score, freshness_bonus } = calculateScore(article, now);
    return { ...article, score, freshness_bonus, rank: 0 };
  });

  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, RANKING_SIZE);
  top.forEach((article, index) => {
    article.rank = index + 1;
  });

  return {
    metadata: {
      generated_at: now.toISOString(),
      total_articles_fetched: articles.length,
      ranked_count: top.length,
      target_tags: [...TARGET_TAGS],
      period_days: PERIOD_DAYS,
    },
    articles: top,
  };
}
