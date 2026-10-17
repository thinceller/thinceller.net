import { cacheLife } from 'next/cache';
import { ZENN_USERNAME } from '@/lib/constants';

export type ZennArticle = {
  id: number;
  title: string;
  slug: string;
  published_at: string;
  path: string;
  emoji: string;
  liked_count: number;
};

type ZennApiResponse = {
  articles: ZennArticle[];
};

export async function getLatestZennArticles(limit = 5): Promise<ZennArticle[]> {
  'use cache';

  // 失敗時に throw すると prerender が失敗するため、フォールバックを短期間だけキャッシュして再取得させる
  try {
    const res = await fetch(
      `https://zenn.dev/api/articles?username=${ZENN_USERNAME}&order=latest`,
    );
    if (!res.ok) {
      cacheLife('minutes');
      return [];
    }
    const data: ZennApiResponse = await res.json();
    cacheLife('hours');
    return data.articles?.slice(0, limit) ?? [];
  } catch {
    cacheLife('minutes');
    return [];
  }
}
