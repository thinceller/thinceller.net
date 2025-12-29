import { Github, Rss, Twitter } from 'lucide-react';
import type { FC } from 'react';

export const Footer: FC = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="flex flex-row justify-between mx-auto max-w-(--breakpoint-lg) p-6">
        <p className="text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} thinceller
        </p>
        <div className="flex flex-row gap-2">
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://twitter.com/thinceller_dev"
            aria-label="Twitter link"
          >
            <Twitter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </a>
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://github.com/thinceller"
            aria-label="GitHub link"
          >
            <Github className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </a>
          <a href="/blog/rss.xml" aria-label="RSS Feed">
            <Rss className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </a>
        </div>
      </div>
    </footer>
  );
};
