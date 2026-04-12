import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * _posts/ディレクトリを走査し、publishedTimeが最新の記事slugを返す。
 * 新記事追加時もテストが自動的に最新記事を対象とする。
 */
function getLatestPostSlug(): string {
  const postsDir = path.join(process.cwd(), '_posts');
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.mdx'));

  const posts = files.map((file) => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const match = content.match(/publishedTime:\s*["']?([^"'\n]+)["']?/);
    return {
      slug: file.replace(/\.mdx$/, ''),
      publishedTime: match?.[1] ?? '',
    };
  });

  posts.sort((a, b) => (a.publishedTime > b.publishedTime ? -1 : 1));
  const slug = posts[0]?.slug;
  if (!slug) throw new Error('No posts found in _posts directory');
  return slug;
}

const latestPostSlug = getLatestPostSlug();

test.describe('ページ表示確認', () => {
  test('トップページ（/）が正常に表示される', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Aboutページ（/about）が正常に表示される', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('ブログ一覧ページ（/blog）が記事一覧を表示する', async ({ page }) => {
    const response = await page.goto('/blog');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // PostCardコンポーネントはarticle要素を使用する
    await expect(page.getByRole('article').first()).toBeVisible();
  });

  test('記事詳細ページが本文を表示する', async ({ page }) => {
    const response = await page.goto(`/blog/${latestPostSlug}`);
    expect(response?.status()).toBe(200);
    // 記事本文のarticle要素（最初の要素がメインコンテンツ）
    await expect(page.getByRole('article').first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('RSSフィード検証', () => {
  test('/blog/rss.xml が有効なXMLを返す', async ({ request }) => {
    const response = await request.get('/blog/rss.xml');
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/xml/);
    const body = await response.text();
    expect(body).toContain('<?xml');
    expect(body).toContain('<rss');
  });

  test('/blog/atom.xml が有効なXMLを返す', async ({ request }) => {
    const response = await request.get('/blog/atom.xml');
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    expect(contentType).toMatch(/xml/);
    const body = await response.text();
    expect(body).toContain('<?xml');
    expect(body).toContain('<feed');
  });
});

// biome-ignore lint/suspicious/noExplicitAny: JSON-LD parsing in tests
type JsonLdGraph = { '@context': string; '@graph': any[] };

function parseJsonLd(text: string | null): JsonLdGraph {
  if (text === null) {
    throw new Error('JSON-LD script not found');
  }
  return JSON.parse(text) as JsonLdGraph;
}

test.describe('構造化データ（JSON-LD）', () => {
  test('トップページに WebSite, Person, WebPage が含まれる', async ({
    page,
  }) => {
    await page.goto('/');
    const text = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    const data = parseJsonLd(text);

    expect(data['@context']).toBe('https://schema.org');
    expect(data['@graph']).toBeDefined();

    const types = data['@graph'].map((e: { '@type': string }) => e['@type']);
    expect(types).toContain('WebSite');
    expect(types).toContain('Person');
    expect(types).toContain('WebPage');

    // @id が設定されていること
    const website = data['@graph'].find(
      (e: { '@type': string }) => e['@type'] === 'WebSite',
    );
    expect(website).toBeDefined();
    expect(website['@id']).toContain('#website');

    const person = data['@graph'].find(
      (e: { '@type': string }) => e['@type'] === 'Person',
    );
    expect(person).toBeDefined();
    expect(person['@id']).toContain('#person');
  });

  test('トップページに BreadcrumbList が含まれない', async ({ page }) => {
    await page.goto('/');
    const text = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    const data = parseJsonLd(text);

    const types = data['@graph'].map((e: { '@type': string }) => e['@type']);
    expect(types).not.toContain('BreadcrumbList');
  });

  test('記事ページに BlogPosting, BreadcrumbList, WebPage が含まれる', async ({
    page,
  }) => {
    await page.goto(`/blog/${latestPostSlug}`);
    const text = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    const data = parseJsonLd(text);

    const types = data['@graph'].map((e: { '@type': string }) => e['@type']);
    expect(types).toContain('BlogPosting');
    expect(types).toContain('BreadcrumbList');
    expect(types).toContain('WebPage');
    expect(types).toContain('WebSite');
    expect(types).toContain('Person');

    // BlogPosting の author が Person の @id を参照していること
    const blogPosting = data['@graph'].find(
      (e: { '@type': string }) => e['@type'] === 'BlogPosting',
    );
    const person = data['@graph'].find(
      (e: { '@type': string }) => e['@type'] === 'Person',
    );
    expect(blogPosting).toBeDefined();
    expect(person).toBeDefined();
    expect(blogPosting.author['@id']).toBe(person['@id']);

    // BreadcrumbList に3つのアイテムがあること (Home > Blog > Post)
    const breadcrumb = data['@graph'].find(
      (e: { '@type': string }) => e['@type'] === 'BreadcrumbList',
    );
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb.itemListElement).toHaveLength(3);
  });

  test('Aboutページに ProfilePage と BreadcrumbList が含まれる', async ({
    page,
  }) => {
    await page.goto('/about');
    const text = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    const data = parseJsonLd(text);

    const types = data['@graph'].map((e: { '@type': string }) => e['@type']);
    expect(types).toContain('ProfilePage');
    expect(types).toContain('BreadcrumbList');
    expect(types).toContain('Person');

    // ProfilePage の mainEntity が Person を参照していること
    const profilePage = data['@graph'].find(
      (e: { '@type': string }) => e['@type'] === 'ProfilePage',
    );
    const person = data['@graph'].find(
      (e: { '@type': string }) => e['@type'] === 'Person',
    );
    expect(profilePage).toBeDefined();
    expect(person).toBeDefined();
    expect(profilePage.mainEntity['@id']).toBe(person['@id']);
  });

  test('ブログ一覧ページに CollectionPage と BreadcrumbList が含まれる', async ({
    page,
  }) => {
    await page.goto('/blog');
    const text = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    const data = parseJsonLd(text);

    const types = data['@graph'].map((e: { '@type': string }) => e['@type']);
    expect(types).toContain('CollectionPage');
    expect(types).toContain('BreadcrumbList');

    // BreadcrumbList に2つのアイテムがあること (Home > Blog)
    const breadcrumb = data['@graph'].find(
      (e: { '@type': string }) => e['@type'] === 'BreadcrumbList',
    );
    expect(breadcrumb).toBeDefined();
    expect(breadcrumb.itemListElement).toHaveLength(2);
  });
});

test.describe('ナビゲーション', () => {
  test('トップ → ブログ一覧 → 記事詳細 の遷移が正常に動作する', async ({
    page,
  }) => {
    // トップページを開く
    await page.goto('/');
    await expect(page.getByRole('main')).toBeVisible();

    // Blogリンクをクリックしてブログ一覧へ遷移
    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'Blog' })
      .click();
    await expect(page).toHaveURL('/blog');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // 記事カード内の見出しリンクをクリックして記事詳細へ遷移
    // PostCardは article > h2 > a の構造を持つ
    await page
      .getByRole('article')
      .first()
      .getByRole('heading')
      .getByRole('link')
      .click();
    await expect(page).toHaveURL(/\/blog\/.+/);
    await expect(page.getByRole('article').first()).toBeVisible();
  });
});
