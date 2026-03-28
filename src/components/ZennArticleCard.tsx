import { ExternalLink, Heart } from 'lucide-react';
import { DateFormatter } from '@/components/DateFormatter';

type Props = {
  title: string;
  emoji: string;
  publishedAt: string;
  path: string;
  likedCount: number;
};

export function ZennArticleCard({
  title,
  emoji,
  publishedAt,
  path,
  likedCount,
}: Props) {
  const href = path.startsWith('/') ? `https://zenn.dev${path}` : undefined;

  return (
    <article className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0" aria-hidden="true">
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold mb-1">
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm"
              >
                {title}
                <span className="absolute inset-0" aria-hidden="true" />
              </a>
            ) : (
              <span className="text-gray-900 dark:text-gray-100">{title}</span>
            )}
          </h3>
          <div className="flex items-center gap-3 text-custom-sm text-gray-500 dark:text-gray-400">
            <DateFormatter date={publishedAt} />
            <span className="inline-flex items-center gap-1">
              <Heart size={14} />
              {likedCount}
            </span>
            <ExternalLink size={14} className="ml-auto" aria-hidden="true" />
          </div>
        </div>
      </div>
    </article>
  );
}
