import { execSync } from 'child_process';

function run(command: string, description: string) {
  console.log(`\n=== ${description} ===`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`Done: ${description}`);
  } catch (err) {
    console.error(`Failed: ${description}`);
    throw err;
  }
}

async function main() {
  if (!process.env.QIITA_API_TOKEN) {
    console.error('Error: QIITA_API_TOKEN environment variable is not set.');
    process.exit(1);
  }

  const start = Date.now();
  console.log('Starting full update pipeline...');

  run('npx tsx scripts/fetch-articles.ts', 'Fetching articles from Qiita API');
  run('npx tsx scripts/generate-ranking.ts', 'Generating ranking');
  run('npm run build', 'Building static site');

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nUpdate complete in ${elapsed}s`);
}

main().catch((err) => {
  console.error('Update pipeline failed:', err);
  process.exit(1);
});
