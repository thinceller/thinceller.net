import fs from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';
import * as v from 'valibot';
import { type FrontMatter, frontMatterSchema } from './frontmatter';

const postsDir = join(process.cwd(), '_posts');

function getPostSlugs(): string[] {
  return fs.readdirSync(postsDir);
}

export function hasPost(slug: string): boolean {
  return getPostSlugs().includes(`${slug}.mdx`);
}

// 投稿データの型
type PostData = {
  slug: string;
  content: string;
} & FrontMatter;

/**
 * post のデータを取得する
 *
 * @param slug - slug of the target post
 * @param includeContent - contentを含めるかどうか
 * @returns Object of the post data
 */
export function getPostBySlug(slug: string, includeContent = false): PostData {
  const realSlug = slug.replace(/\.mdx$/, '');
  const fullPath = join(postsDir, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // frontmatterをバリデーション
  const validatedFrontmatter = v.parse(frontMatterSchema, data);

  return {
    slug: realSlug,
    content: includeContent ? content : '',
    ...validatedFrontmatter,
  };
}

export function getAllPosts(includeContent = false): PostData[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug, includeContent))
    // sort posts by publishedTime in descending order
    .sort((post1, post2) =>
      post1.publishedTime > post2.publishedTime ? -1 : 1,
    );
  return posts;
}

/**
 * 指定されたタグを持つ関連記事を取得する
 * @param tags - 検索対象のタグ
 * @param currentSlug - 現在の記事のslug（除外するため）
 * @param limit - 取得する記事数の上限
 * @returns 関連記事の配列
 */
export function getRelatedPosts(
  tags: string[],
  currentSlug: string,
  limit = 3,
): Pick<PostData, 'slug' | 'title' | 'publishedTime'>[] {
  if (!tags || tags.length === 0) {
    return [];
  }

  const allPosts = getAllPosts();

  // 現在の記事を除外し、タグが一致する記事をフィルタリング
  const relatedPosts = allPosts
    .filter((post) => post.slug !== currentSlug)
    .filter((post) => {
      const postTags = post.tags;
      if (!postTags || postTags.length === 0) return false;
      return postTags.some((tag) => tags.includes(tag));
    })
    .slice(0, limit)
    .map(({ slug, title, publishedTime }) => ({ slug, title, publishedTime }));

  return relatedPosts;
}

/**
 * すべての投稿から一意なタグとその投稿数を取得する
 * @returns タグとその投稿数のマップ
 */
export function getAllTags(): Map<string, number> {
  const allPosts = getAllPosts();
  const tagCounts = new Map<string, number>();

  for (const post of allPosts) {
    if (post.tags && post.tags.length > 0) {
      for (const tag of post.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  }

  return tagCounts;
}

/**
 * 指定されたタグを持つ投稿を取得する
 * @param tag - 検索対象のタグ
 * @returns タグを持つ投稿の配列
 */
export function getPostsByTag(tag: string): PostData[] {
  const allPosts = getAllPosts();

  return allPosts.filter((post) => {
    if (!post.tags || post.tags.length === 0) return false;
    return post.tags.includes(tag);
  });
}
