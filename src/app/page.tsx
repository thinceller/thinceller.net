import type { Metadata } from 'next';
import Link from 'next/link';
import type { WebSite, WithContext } from 'schema-dts';

import { JsonLd } from '@/components/JsonLd';
import { BLOG_AUTHOR, BLOG_URL, SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: SITE_NAME,
  description: 'thinceller の個人サイト',
};

export default function Page() {
  const jsonLd: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BLOG_URL,
    description: 'ソフトウェアエンジニアthincellerの個人サイトです',
    author: {
      '@type': 'Person',
      name: BLOG_AUTHOR,
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-custom-3xl font-bold">Welcome to {SITE_NAME}</h1>
          <p className="text-custom-lg text-gray-600 dark:text-gray-400">
            ソフトウェアエンジニアthincellerの個人サイトです
          </p>
        </div>

        <div className="flex gap-6">
          <Link
            href="/about"
            className="min-w-32 px-6 py-3 text-custom-base font-medium text-center text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            About
          </Link>
          <Link
            href="/blog"
            className="min-w-32 px-6 py-3 text-custom-base font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Blog
          </Link>
        </div>
      </div>
    </>
  );
}
