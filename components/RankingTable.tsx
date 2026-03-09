import type { RankedArticle } from '@/types';
import ArticleRow from './ArticleRow';

interface RankingTableProps {
  articles: RankedArticle[];
}

export default function RankingTable({ articles }: RankingTableProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">ランキングデータがありません</p>
        <p className="text-sm mt-2">データの取得・更新をお待ちください</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-300 text-sm text-gray-600">
            <th className="py-2 px-2 text-center w-12">#</th>
            <th className="py-2 px-2 text-left">記事</th>
            <th className="py-2 px-2 text-center w-20">スコア</th>
            <th className="py-2 px-2 text-left w-48 hidden sm:table-cell">タグ</th>
            <th className="py-2 px-2 text-center w-28 hidden md:table-cell">投稿日</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
