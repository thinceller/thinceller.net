import type { Metadata } from 'next';
import { PostFooter } from '@/components/PostFooter';
import { PostTitle } from '@/components/PostTitle';
import { RelatedPosts } from '@/components/RelatedPosts';
import { TableOfContents } from '@/components/TableOfContents';
import { BLOG_AUTHOR, BLOG_NAME, SITE_NAME } from '@/lib/constants';
import { getPostBySlug } from '@/lib/mdx';
import { getAllPosts, getRelatedPosts } from '@/lib/post';

export const dynamicParams = false;

export function generateStaticParams() {
  const posts = getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { frontmatter } = await getPostBySlug(params.slug);

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    openGraph: {
      type: 'article',
      url: `/blog/${params.slug}`,
      title: frontmatter.title,
      description: frontmatter.description,
      siteName: SITE_NAME,
      images: [
        {
          url: `/blog/${params.slug}/opengraph-image.png`,
          alt: BLOG_NAME,
          width: 1200,
          height: 630,
        },
      ],
      publishedTime: frontmatter.publishedTime,
      modifiedTime: frontmatter.modifiedTime,
      authors: [BLOG_AUTHOR],
      tags: frontmatter.tags ?? undefined,
    },
    twitter: {
      title: frontmatter.title,
      description: frontmatter.description,
      images: [
        {
          url: `/blog/${params.slug}/opengraph-image.png`,
          alt: BLOG_NAME,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function Page(props: Props) {
  const params = await props.params;
  const { content, frontmatter, headings } = await getPostBySlug(params.slug);

  // 関連記事を取得
  const relatedPosts = getRelatedPosts(frontmatter.tags || [], params.slug);

  return (
    <>
      {/* PostTitleは2カラムの外（全幅） */}
      <div className="my-10 pb-8">
        <PostTitle
          title={frontmatter.title}
          date={frontmatter.publishedTime}
          tags={frontmatter.tags}
        />
      </div>

      {/* 2カラムレイアウト（左: コンテンツ、右: 目次） */}
      <div className="lg:flex lg:gap-8">
        <article className="flex-1 min-w-0">
          {content}

          {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}

          <div className="my-10">
            <PostFooter />
          </div>
        </article>

        <aside className="hidden lg:block lg:w-64 lg:shrink-0 self-start sticky top-24">
          <TableOfContents headings={headings} />
        </aside>
      </div>
    </>
  );
}
