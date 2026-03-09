import { describe, it, expect } from 'vitest';
import { calculateScore, rankArticles } from '@/lib/scorer';
import type { Article } from '@/types';

const mockArticle = (overrides: Partial<Article> = {}): Article => ({
  id: 'test-id',
  title: 'Test Article',
  url: 'https://qiita.com/user/items/test-id',
  likes_count: 10,
  stocks_count: 5,
  tags: [{ name: 'AI' }],
  created_at: new Date().toISOString(),
  user: { id: 'user1', name: 'Test User', profile_image_url: 'https://example.com/img.png' },
  ...overrides,
});

describe('calculateScore', () => {
  it('should apply correct weights: likes*3 + stocks*2 + freshness', () => {
    const now = new Date();
    const article = mockArticle({
      likes_count: 100,
      stocks_count: 50,
      created_at: now.toISOString(),
    });
    const result = calculateScore(article, now);
    // likes: 100*3=300, stocks: 50*2=100, freshness: max(0, 30-0)=30
    expect(result.score).toBe(430);
    expect(result.freshness_bonus).toBe(30);
  });

  it('should decrease freshness bonus as article ages', () => {
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const article = mockArticle({
      likes_count: 0,
      stocks_count: 0,
      created_at: tenDaysAgo.toISOString(),
    });
    const result = calculateScore(article, now);
    expect(result.freshness_bonus).toBe(20);
  });

  it('should give 0 freshness bonus for articles older than 30 days', () => {
    const now = new Date();
    const oldDate = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
    const article = mockArticle({
      likes_count: 10,
      stocks_count: 5,
      created_at: oldDate.toISOString(),
    });
    const result = calculateScore(article, now);
    expect(result.freshness_bonus).toBe(0);
    // likes: 10*3=30, stocks: 5*2=10, freshness: 0
    expect(result.score).toBe(40);
  });
});

describe('rankArticles', () => {
  it('should sort articles by score descending', () => {
    const now = new Date();
    const articles = [
      mockArticle({ id: 'low', likes_count: 1, stocks_count: 0 }),
      mockArticle({ id: 'high', likes_count: 100, stocks_count: 50 }),
      mockArticle({ id: 'mid', likes_count: 10, stocks_count: 5 }),
    ];

    const result = rankArticles(articles, now);
    expect(result.articles[0].id).toBe('high');
    expect(result.articles[1].id).toBe('mid');
    expect(result.articles[2].id).toBe('low');
  });

  it('should assign correct rank numbers starting from 1', () => {
    const now = new Date();
    const articles = [
      mockArticle({ id: 'a', likes_count: 50, stocks_count: 10 }),
      mockArticle({ id: 'b', likes_count: 30, stocks_count: 5 }),
    ];

    const result = rankArticles(articles, now);
    expect(result.articles[0].rank).toBe(1);
    expect(result.articles[1].rank).toBe(2);
  });

  it('should limit to RANKING_SIZE items', () => {
    const now = new Date();
    const articles = Array.from({ length: 60 }, (_, i) =>
      mockArticle({ id: `a${i}`, likes_count: i + 1, stocks_count: 0 }),
    );

    const result = rankArticles(articles, now);
    expect(result.articles.length).toBe(50);
  });

  it('should exclude articles with likes=0 AND stocks=0', () => {
    const now = new Date();
    const articles = [
      mockArticle({ id: 'zero', likes_count: 0, stocks_count: 0 }),
      mockArticle({ id: 'has-likes', likes_count: 5, stocks_count: 0 }),
      mockArticle({ id: 'has-stocks', likes_count: 0, stocks_count: 3 }),
    ];

    const result = rankArticles(articles, now);
    expect(result.articles.find((a) => a.id === 'zero')).toBeUndefined();
    expect(result.articles).toHaveLength(2);
  });

  it('should favor newer articles when likes and stocks are equal', () => {
    const now = new Date();
    const oldDate = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
    const newDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const articles = [
      mockArticle({ id: 'old', likes_count: 10, stocks_count: 5, created_at: oldDate.toISOString() }),
      mockArticle({ id: 'new', likes_count: 10, stocks_count: 5, created_at: newDate.toISOString() }),
    ];

    const result = rankArticles(articles, now);
    expect(result.articles[0].id).toBe('new');
  });

  it('should include correct metadata', () => {
    const now = new Date();
    const articles = [
      mockArticle({ id: 'a1', likes_count: 10, stocks_count: 5 }),
    ];

    const result = rankArticles(articles, now);
    expect(result.metadata.ranked_count).toBe(1);
    expect(result.metadata.period_days).toBe(30);
    expect(result.metadata.target_tags).toContain('AI');
  });
});
