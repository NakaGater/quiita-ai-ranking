import Header from '@/components/Header';
import RankingTable from '@/components/RankingTable';
import type { RankingData } from '@/types';

function loadRankingData(): RankingData | null {
  try {
    return require('@/data/ranked.json') as RankingData;
  } catch {
    return null;
  }
}

export default function Home() {
  const data = loadRankingData();

  if (!data) {
    return (
      <main>
        <Header
          generatedAt={new Date().toISOString()}
          articleCount={0}
        />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">ランキングデータがまだありません</p>
            <p className="text-sm mt-2">
              <code className="bg-gray-100 px-2 py-1 rounded">npm run update</code>{' '}
              を実行してデータを生成してください
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header
        generatedAt={data.metadata.generated_at}
        articleCount={data.metadata.ranked_count}
      />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <RankingTable articles={data.articles} />
      </div>
      <footer className="text-center py-6 text-xs text-gray-400">
        Powered by Qiita API v2 | 対象期間: 直近{data.metadata.period_days}日
      </footer>
    </main>
  );
}
