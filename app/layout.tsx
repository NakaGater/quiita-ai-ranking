import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Qiita AI Ranking',
  description:
    'Qiita の AI / 機械学習 関連記事のトレンドランキング',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
