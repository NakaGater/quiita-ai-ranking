import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { rankArticles } from '../lib/scorer';
import type { Article } from '../types';

function main() {
  const dataDir = resolve(process.cwd(), 'data');
  const articlesPath = resolve(dataDir, 'articles.json');

  if (!existsSync(articlesPath)) {
    console.error(`Error: ${articlesPath} not found.`);
    console.error('Run "npm run fetch" first to fetch articles.');
    process.exit(1);
  }

  console.log('Reading articles...');
  const raw = readFileSync(articlesPath, 'utf-8');
  const articles: Article[] = JSON.parse(raw);
  console.log(`Loaded ${articles.length} articles`);

  console.log('Calculating scores and ranking...');
  const rankingData = rankArticles(articles);

  mkdirSync(dataDir, { recursive: true });
  const outputPath = resolve(dataDir, 'ranked.json');
  writeFileSync(outputPath, JSON.stringify(rankingData, null, 2), 'utf-8');
  console.log(
    `Saved ranking (${rankingData.articles.length} articles) to ${outputPath}`,
  );
}

main();
