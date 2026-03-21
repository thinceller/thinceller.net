import { expect, test } from '@playwright/test';

// 最新記事のslug（_posts/ディレクトリの中でpublishedTimeが最新のもの）
const LATEST_POST_SLUG = '2026-03-07-creating-claude-code-plugin';

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
    const response = await page.goto(`/blog/${LATEST_POST_SLUG}`);
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
