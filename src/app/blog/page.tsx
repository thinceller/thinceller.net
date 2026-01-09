import type { Metadata } from 'next';
import type { CollectionPage, WithContext } from 'schema-dts';

import { JsonLd } from '@/components/JsonLd';
import { PostCard } from '@/components/PostCard';
import { BLOG_NAME, BLOG_URL } from '@/lib/constants';
import { getAllPosts } from '@/lib/post';

export const metadata: Metadata = {
  title: {
    absolute: BLOG_NAME,
  },
  description: 'ソフトウェアエンジニアthincellerのブログ記事一覧です',
};

const jsonLd: WithContext<CollectionPage> = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: BLOG_NAME,
  description: 'ソフトウェアエンジニアthincellerのブログ記事一覧です',
  url: `${BLOG_URL}/blog`,
};

export default function Page() {
  const allPosts = getAllPosts();

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="flex flex-col space-y-4">
        <h1 className="text-custom-3xl font-bold mt-2">Blog</h1>
        <div className="grid gap-3">
          {allPosts.map((post) => (
            <PostCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              publishedTime={post.publishedTime}
            />
          ))}
        </div>
      </div>
    </>
  );
}
