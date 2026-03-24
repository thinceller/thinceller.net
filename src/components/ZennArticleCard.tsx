import { ExternalLink, Heart } from 'lucide-react';
import { DateFormatter } from '@/components/DateFormatter';
import type { ZennArticle } from '@/lib/zenn';

type Props = Pick<
  ZennArticle,
  'title' | 'emoji' | 'published_at' | 'path' | 'liked_count'
>;

export function ZennArticleCard({
  title,
  emoji,
  published_at,
  path,
  liked_count,
}: Props) {
  return (
    <article className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0" aria-hidden="true">
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold mb-1">
            <a
              href={`https://zenn.dev${path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm"
            >
              {title}
              <span className="absolute inset-0" aria-hidden="true" />
            </a>
          </h3>
          <div className="flex items-center gap-3 text-custom-sm text-gray-500 dark:text-gray-400">
            <DateFormatter date={published_at} />
            <span className="inline-flex items-center gap-1">
              <Heart size={14} />
              {liked_count}
            </span>
            <ExternalLink size={14} className="ml-auto" />
          </div>
        </div>
      </div>
    </article>
  );
}
