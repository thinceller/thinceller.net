# JSON-LD 構造化データ実装計画

## 概要

SEO対策としてJSON-LD形式の構造化データを各ページに配置し、検索エンジンがコンテンツをより正確に理解できるようにする。

## 調査結果

### 1. ライブラリの選択肢

| ライブラリ | 特徴 | 推奨度 |
|------------|------|--------|
| **schema-dts** (Google公式) | TypeScript型定義のみ提供、依存関係なし、型安全 | ★★★ |
| next-seo | Next.js専用、JSON-LDコンポーネント内蔵、設定が豊富 | ★★ |
| react-schemaorg | Reactコンポーネントベース | ★ |
| ライブラリなし | Next.js標準機能のみ使用、依存関係増加なし | ★★★ |

**推奨**: `schema-dts` を使用（TypeScriptの型補完・バリデーションを活用しつつ、軽量で依存関係が少ない）

### 2. Next.js App Router での実装方法

Next.js公式ドキュメント ([JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld)) に従い、以下の方法で実装する：

```tsx
// Server Component での実装例
export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: '記事タイトル',
    // ...
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ページコンテンツ */}
    </>
  );
}
```

**重要ポイント**:
- Server Component で実装し、静的生成時にJSON-LDが含まれるようにする
- `<head>` ではなくページコンポーネント内に配置（Next.js App Routerの仕様）
- クライアントサイドJavaScriptに依存しない

### 3. Google推奨事項

[Google構造化データガイドライン](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data) に基づく：

- **フォーマット**: JSON-LDを推奨（Microdata、RDFaより優先）
- **スキーマタイプ**: Article, NewsArticle, BlogPosting から選択
- **必須プロパティ**: 厳密な必須項目はないが、推奨プロパティを可能な限り含める
- **配置位置**: `<head>` 内、できるだけ上部に配置が理想的
- **生成タイミング**: 静的HTML（SSR/SSG）で生成、クライアントサイドJSに依存しない

## 各ページに適用するスキーマタイプ

| ページ | スキーマタイプ | 主要プロパティ |
|--------|---------------|----------------|
| トップページ (`/`) | WebSite | name, url, description, author |
| Aboutページ (`/about`) | ProfilePage + Person | name, description, image, sameAs |
| ブログ一覧 (`/blog`) | CollectionPage | name, description, hasPart |
| ブログ記事 (`/blog/[slug]`) | BlogPosting | headline, description, datePublished, dateModified, author, image |
| タグ一覧 (`/blog/tags`) | CollectionPage | name, description |
| タグ別記事一覧 (`/blog/tags/[tag]`) | CollectionPage | name, description, about |

## 実装手順

### Step 1: schema-dts のインストール

```bash
pnpm add -D schema-dts
```

### Step 2: JSON-LDコンポーネントの作成

`src/components/JsonLd.tsx` を作成：

```tsx
import type { Thing, WithContext } from 'schema-dts';

type JsonLdProps<T extends Thing> = {
  data: WithContext<T>;
};

export function JsonLd<T extends Thing>({ data }: JsonLdProps<T>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

### Step 3: 各ページへの実装

#### 3.1 トップページ (`src/app/page.tsx`)

```tsx
import type { WebSite, WithContext } from 'schema-dts';
import { JsonLd } from '@/components/JsonLd';
import { BLOG_URL, SITE_NAME } from '@/lib/constants';

export default function Page() {
  const jsonLd: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: BLOG_URL,
    description: 'ソフトウェアエンジニアthincellerの個人サイトです',
    author: {
      '@type': 'Person',
      name: 'thinceller',
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* 既存のコンテンツ */}
    </>
  );
}
```

#### 3.2 Aboutページ (`src/app/about/page.tsx`)

```tsx
import type { ProfilePage, WithContext } from 'schema-dts';

const jsonLd: WithContext<ProfilePage> = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: {
    '@type': 'Person',
    name: 'thinceller',
    alternateName: 'Kohei Kawakami',
    description: 'ソフトウェアエンジニア',
    image: 'https://thinceller.net/images/avatar.jpg',
    sameAs: [
      'https://twitter.com/thinceller_dev',
      'https://github.com/thinceller',
    ],
  },
};
```

#### 3.3 ブログ記事ページ (`src/app/blog/[slug]/page.tsx`)

```tsx
import type { BlogPosting, WithContext } from 'schema-dts';

// Page コンポーネント内で動的に生成
const jsonLd: WithContext<BlogPosting> = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: frontmatter.title,
  description: frontmatter.description,
  datePublished: frontmatter.publishedTime,
  dateModified: frontmatter.modifiedTime ?? frontmatter.publishedTime,
  author: {
    '@type': 'Person',
    name: 'thinceller',
    url: 'https://thinceller.net/about',
  },
  publisher: {
    '@type': 'Organization',
    name: 'thinceller.net',
    logo: {
      '@type': 'ImageObject',
      url: 'https://thinceller.net/images/avatar.jpg',
    },
  },
  image: `https://thinceller.net/blog/${slug}/opengraph-image.png`,
  url: `https://thinceller.net/blog/${slug}`,
  keywords: frontmatter.tags?.join(', '),
};
```

#### 3.4 ブログ一覧ページ (`src/app/blog/page.tsx`)

```tsx
import type { CollectionPage, WithContext } from 'schema-dts';

const jsonLd: WithContext<CollectionPage> = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'thinceller.net blog',
  description: 'ソフトウェアエンジニアthincellerのブログ記事一覧です',
  url: 'https://thinceller.net/blog',
};
```

### Step 4: 定数の追加

`src/lib/constants.ts` に追加：

```typescript
export const AUTHOR_TWITTER = 'https://twitter.com/thinceller_dev';
export const AUTHOR_GITHUB = 'https://github.com/thinceller';
export const AVATAR_URL = `${BLOG_URL}/images/avatar.jpg`;
```

## 動作確認手順

### 1. ローカル環境での確認

```bash
pnpm build
pnpm start
```

ブラウザの開発者ツールで、HTMLソース内に `<script type="application/ld+json">` が正しく出力されていることを確認。

### 2. Google Rich Results Test

[Rich Results Test](https://search.google.com/test/rich-results) を使用：

1. テスト対象のURLまたはコードスニペットを入力
2. 「テストを実行」をクリック
3. 検出されたスキーマタイプと、エラー・警告を確認
4. 「リッチリザルト」タブでプレビューを確認

### 3. Schema Markup Validator

[Schema Markup Validator](https://validator.schema.org/) を使用：

1. URLまたはコードスニペットを入力
2. schema.org仕様への準拠を確認
3. 構文エラーがないことを確認

### 4. Google Search Console での確認

デプロイ後、[Google Search Console](https://search.google.com/search-console) で：

1. 「URL検査」ツールで対象ページを検査
2. 「構造化データ」セクションで検出されたスキーマを確認
3. 「拡張」レポートでリッチリザルトの対象状況を確認
4. エラーがあれば修正してインデックス再登録をリクエスト

## ファイル変更一覧

| ファイル | 変更内容 |
|----------|----------|
| `package.json` | schema-dts 追加 |
| `src/components/JsonLd.tsx` | 新規作成 |
| `src/lib/constants.ts` | SNSリンク等の定数追加 |
| `src/app/page.tsx` | WebSite スキーマ追加 |
| `src/app/about/page.tsx` | ProfilePage スキーマ追加 |
| `src/app/blog/page.tsx` | CollectionPage スキーマ追加 |
| `src/app/blog/[slug]/page.tsx` | BlogPosting スキーマ追加 |
| `src/app/blog/tags/page.tsx` | CollectionPage スキーマ追加 |
| `src/app/blog/tags/[tag]/page.tsx` | CollectionPage スキーマ追加 |

## 参考リンク

### Next.js 公式
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld)
- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

### Google 公式
- [Google 構造化データ概要](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Article 構造化データ](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [構造化データガイドライン](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

### Schema.org
- [BlogPosting](https://schema.org/BlogPosting)
- [WebSite](https://schema.org/WebSite)
- [ProfilePage](https://schema.org/ProfilePage)

### ライブラリ
- [schema-dts (GitHub)](https://github.com/google/schema-dts)
- [schema-dts (npm)](https://www.npmjs.com/package/schema-dts)

## 備考

- JSON-LDはSEOに効果があるが、リッチリザルトの表示はGoogleのアルゴリズムに依存する
- すべてのページでリッチリザルトが表示されるとは限らない
- 定期的にSearch Consoleでエラーを監視し、スキーマを最新に保つことが重要
