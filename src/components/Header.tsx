import NextLink from 'next/link';
import type { FC } from 'react';

import { SITE_NAME } from '@/lib/constants';
import { Navigation } from './Navigation';
import { ThemeToggle } from './ThemeToggle';

export const Header: FC = () => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-(--breakpoint-lg) mx-auto px-6 py-4 flex items-center justify-between">
        {/* Site Name */}
        <span className="text-2xl font-bold flex-shrink-0">
          <NextLink href="/" prefetch={false}>
            {SITE_NAME}
          </NextLink>
        </span>

        {/* Navigation and Theme Toggle */}
        <div className="flex items-center gap-4">
          <Navigation />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
