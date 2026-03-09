import type { Article } from '@/types';
import {
  QIITA_API_BASE_URL,
  QIITA_PER_PAGE,
  QIITA_MAX_PAGES_PER_TAG,
  TARGET_TAGS,
  PERIOD_DAYS,
  RATE_LIMIT_MIN_REMAINING,
  RATE_LIMIT_DELAY_MS,
} from './config';

export function buildSearchQuery(tag: string, periodDays: number): string {
  const since = new Date();
  since.setDate(since.getDate() - periodDays);
  const dateStr = since.toISOString().split('T')[0];
  return `tag:${tag} created:>${dateStr}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface QiitaApiItem {
  id: string;
  title: string;
  url: string;
  likes_count: number;
  stocks_count: number;
  tags: Array<{ name: string; versions: string[] }>;
  created_at: string;
  user: {
    id: string;
    name: string;
    profile_image_url: string;
  };
}

function toArticle(item: QiitaApiItem): Article {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    likes_count: item.likes_count,
    stocks_count: item.stocks_count,
    tags: item.tags.map((t) => ({ name: t.name })),
    created_at: item.created_at,
    user: {
      id: item.user.id,
      name: item.user.name,
      profile_image_url: item.user.profile_image_url,
    },
  };
}

async function fetchPage(
  query: string,
  page: number,
  token: string,
): Promise<{ items: QiitaApiItem[]; rateLimitRemaining: number }> {
  const url = new URL(`${QIITA_API_BASE_URL}/items`);
  url.searchParams.set('query', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(QIITA_PER_PAGE));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 429) {
    const resetTime = response.headers.get('Rate-Reset');
    if (resetTime) {
      const waitMs = (Number(resetTime) - Math.floor(Date.now() / 1000)) * 1000;
      if (waitMs > 0) {
        console.log(`Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s...`);
        await sleep(waitMs + 1000);
      }
    } else {
      await sleep(60_000);
    }
    return fetchPage(query, page, token);
  }

  if (!response.ok) {
    throw new Error(
      `Qiita API error: ${response.status} ${response.statusText}`,
    );
  }

  const items: QiitaApiItem[] = await response.json();
  const remaining = Number(response.headers.get('Rate-Remaining') ?? 1000);

  return { items, rateLimitRemaining: remaining };
}

export async function fetchArticles(
  token: string,
  tags: readonly string[] = TARGET_TAGS,
  periodDays: number = PERIOD_DAYS,
): Promise<Article[]> {
  const seen = new Map<string, Article>();

  for (const tag of tags) {
    const query = buildSearchQuery(tag, periodDays);
    console.log(`Fetching articles for tag: ${tag}`);

    for (let page = 1; page <= QIITA_MAX_PAGES_PER_TAG; page++) {
      const { items, rateLimitRemaining } = await fetchPage(
        query,
        page,
        token,
      );

      for (const item of items) {
        if (!seen.has(item.id)) {
          seen.set(item.id, toArticle(item));
        }
      }

      if (items.length < QIITA_PER_PAGE) {
        break;
      }

      if (rateLimitRemaining < RATE_LIMIT_MIN_REMAINING) {
        console.log(
          `Rate limit low (${rateLimitRemaining} remaining). Pausing...`,
        );
        await sleep(60_000);
      } else {
        await sleep(RATE_LIMIT_DELAY_MS);
      }
    }
  }

  console.log(`Total unique articles fetched: ${seen.size}`);
  return Array.from(seen.values());
}
