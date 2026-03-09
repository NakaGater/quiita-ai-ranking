interface HeaderProps {
  generatedAt: string;
  articleCount: number;
}

export default function Header({ generatedAt, articleCount }: HeaderProps) {
  const formattedDate = new Date(generatedAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="bg-gradient-to-r from-green-600 to-green-800 text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Qiita AI Ranking
        </h1>
        <p className="text-green-100 text-sm">
          AI / 機械学習 関連記事のトレンドランキング
        </p>
        <div className="mt-4 text-green-200 text-xs flex gap-4">
          <span>最終更新: {formattedDate}</span>
          <span>{articleCount} 件</span>
        </div>
      </div>
    </header>
  );
}
