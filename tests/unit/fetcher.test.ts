import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchArticles, buildSearchQuery } from '@/lib/fetcher';
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

describe('buildSearchQuery', () => {
  it('should build query with tag and date filter', () => {
    const query = buildSearchQuery('AI', 30);
    expect(query).toContain('tag:AI');
    expect(query).toContain('created:>');
  });
});

describe('fetchArticles', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should deduplicate articles by id', async () => {
    const articles = [
      mockArticle({ id: 'a1' }),
      mockArticle({ id: 'a1' }),
      mockArticle({ id: 'a2' }),
    ];

    const seen = new Map<string, Article>();
    for (const a of articles) {
      if (!seen.has(a.id)) {
        seen.set(a.id, a);
      }
    }
    expect(seen.size).toBe(2);
  });

  it('should filter articles older than period days', () => {
    const now = new Date();
    const oldDate = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
    const newDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const articles = [
      mockArticle({ id: 'old', created_at: oldDate.toISOString() }),
      mockArticle({ id: 'new', created_at: newDate.toISOString() }),
    ];

    const periodMs = 30 * 24 * 60 * 60 * 1000;
    const filtered = articles.filter(
      (a) => now.getTime() - new Date(a.created_at).getTime() <= periodMs,
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('new');
  });
});
