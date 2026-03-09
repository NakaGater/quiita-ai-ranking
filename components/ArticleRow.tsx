import type { RankedArticle } from '@/types';

interface ArticleRowProps {
  article: RankedArticle;
}

export default function ArticleRow({ article }: ArticleRowProps) {
  const postedDate = new Date(article.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-2 text-center font-bold text-gray-500 w-12">
        {article.rank}
      </td>
      <td className="py-3 px-2">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-700 hover:text-green-900 hover:underline font-medium"
        >
          {article.title}
        </a>
        <div className="text-xs text-gray-500 mt-1">
          by {article.user.name}
        </div>
      </td>
      <td className="py-3 px-2 text-center font-semibold text-green-700 w-20">
        {article.score}
      </td>
      <td className="py-3 px-2 w-48 hidden sm:table-cell">
        <div className="flex flex-wrap gap-1">
          {article.tags.map((tag) => (
            <span
              key={tag.name}
              className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </td>
      <td className="py-3 px-2 text-center text-sm text-gray-500 w-28 hidden md:table-cell">
        {postedDate}
      </td>
    </tr>
  );
}
