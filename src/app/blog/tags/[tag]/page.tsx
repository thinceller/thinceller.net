import type { Metadata } from 'next';

import { JsonLd } from '@/components/JsonLd';
import { PostCard } from '@/components/PostCard';
import { BLOG_NAME, BLOG_URL } from '@/lib/constants';
import { getAllTags, getPostsByTag } from '@/lib/post';
import {
  createBreadcrumbList,
  createCollectionPageEntity,
  createGraphJsonLd,
  createPersonEntity,
  createWebSiteEntity,
} from '@/lib/structured-data';

export const dynamicParams = false;

export function generateStaticParams() {
  const allTags = getAllTags();

  return Array.from(allTags.keys()).map((tag) => ({
    tag: tag,
  }));
}

type Props = {
  params: Promise<{
    tag: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const tag = decodeURIComponent(params.tag);

  return {
    title: tag,
    description: `${tag}に関する記事一覧`,
    openGraph: {
      type: 'website',
      url: `/blog/tags/${params.tag}`,
      title: `${tag} | ${BLOG_NAME}`,
      description: `${tag}に関する記事一覧`,
      siteName: BLOG_NAME,
    },
    twitter: {
      title: `${tag} | ${BLOG_NAME}`,
      description: `${tag}に関する記事一覧`,
    },
  };
}

export default async function Page(props: Props) {
  const params = await props.params;
  const tag = decodeURIComponent(params.tag);
  const posts = getPostsByTag(tag);

  const tagPath = `/blog/tags/${params.tag}`;
  const jsonLd = createGraphJsonLd([
    createWebSiteEntity(),
    createPersonEntity(),
    {
      ...createCollectionPageEntity({
        path: tagPath,
        name: `${tag} | ${BLOG_NAME}`,
        description: `${tag}に関する記事一覧`,
      }),
      about: {
        '@type': 'Thing' as const,
        name: tag,
      },
    },
    createBreadcrumbList(tagPath, [
      { name: 'Home', url: BLOG_URL },
      { name: 'Blog', url: `${BLOG_URL}/blog` },
      {
        name: 'タグ一覧',
        url: `${BLOG_URL}/blog/tags`,
      },
      { name: tag, url: `${BLOG_URL}${tagPath}` },
    ]),
  ]);

  return (
    <>
      <JsonLd data={jsonLd} />
      <div>
        <h1 className="text-3xl font-bold mb-8">
          <span className="text-gray-600">#</span>
          {tag}
        </h1>
        <div className="grid gap-3">
          {posts.map((post) => (
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
