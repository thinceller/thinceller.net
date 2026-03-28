import type { Metadata } from 'next';
import Image from 'next/image';
import type { WebSite, WithContext } from 'schema-dts';

import { JsonLd } from '@/components/JsonLd';
import { PostCard } from '@/components/PostCard';
import { SectionHeading } from '@/components/SectionHeading';
import { ZennArticleCard } from '@/components/ZennArticleCard';
import {
  BLOG_AUTHOR,
  BLOG_URL,
  SITE_NAME,
  ZENN_PROFILE_URL,
} from '@/lib/constants';
import { getAllPosts } from '@/lib/post';
import { getLatestZennArticles } from '@/lib/zenn';
import AvatarImage from '../../public/images/avatar.jpg';

export const metadata: Metadata = {
  title: SITE_NAME,
  description: 'thinceller の個人サイト',
};

export default async function Page() {
  const recentPosts = getAllPosts().slice(0, 5);
  const zennArticles = await getLatestZennArticles(5);

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
      <div className="flex flex-col space-y-12">
        {/* Hero */}
        <section className="flex items-center gap-5 pt-4">
          <Image
            src={AvatarImage}
            alt="thinceller's avatar"
            width={80}
            height={80}
            className="rounded-full shrink-0"
            priority
          />
          <div>
            <h1 className="text-custom-2xl font-bold">thinceller</h1>
            <p className="text-custom-base text-gray-600 dark:text-gray-400 mt-1">
              ソフトウェアエンジニア
            </p>
          </div>
        </section>

        {/* Recent Blog Posts */}
        <section>
          <SectionHeading
            title="Recent Posts"
            linkHref="/blog"
            linkText="すべての記事を見る →"
          />
          <div className="grid gap-3">
            {recentPosts.map((post) => (
              <PostCard
                key={post.slug}
                slug={post.slug}
                title={post.title}
                publishedTime={post.publishedTime}
                titleLevel="h3"
              />
            ))}
          </div>
        </section>

        {/* Zenn Articles */}
        {zennArticles.length > 0 && (
          <section>
            <SectionHeading
              title="Zenn Articles"
              linkHref={ZENN_PROFILE_URL}
              linkText="Zennで全記事を見る →"
              external
            />
            <div className="grid gap-3">
              {zennArticles.map((article) => (
                <ZennArticleCard
                  key={article.id}
                  title={article.title}
                  emoji={article.emoji}
                  publishedAt={article.published_at}
                  path={article.path}
                  likedCount={article.liked_count}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
