import Link from 'next/link';
import type { FC } from 'react';

type Props = {
  tags: string[] | null | undefined;
};

export const PostTags: FC<Props> = ({ tags }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-2">
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/blog/tags/${encodeURIComponent(tag)}`}
          className="inline-block px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
};
