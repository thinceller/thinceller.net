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
  try {
    const res = await fetch(
      `https://zenn.dev/api/articles?username=${ZENN_USERNAME}&order=latest`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) {
      return [];
    }
    const data: ZennApiResponse = await res.json();
    return data.articles?.slice(0, limit) ?? [];
  } catch {
    return [];
  }
}
