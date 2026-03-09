import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { fetchArticles } from '../lib/fetcher';

async function main() {
  const token = process.env.QIITA_API_TOKEN;
  if (!token) {
    console.error(
      'Error: QIITA_API_TOKEN environment variable is not set.',
    );
    console.error('Set it in .env.local or export it before running.');
    process.exit(1);
  }

  console.log('Starting article fetch...');
  const articles = await fetchArticles(token);

  const dataDir = resolve(process.cwd(), 'data');
  mkdirSync(dataDir, { recursive: true });

  const outputPath = resolve(dataDir, 'articles.json');
  writeFileSync(outputPath, JSON.stringify(articles, null, 2), 'utf-8');
  console.log(`Saved ${articles.length} articles to ${outputPath}`);
}

main().catch((err) => {
  console.error('Fetch failed:', err);
  process.exit(1);
});
