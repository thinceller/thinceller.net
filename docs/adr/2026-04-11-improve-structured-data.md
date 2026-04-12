# Improve Structured Data (JSON-LD) with @graph Pattern and BreadcrumbList

## Status

accepted

## Context

サイト全体で JSON-LD 構造化データを実装済みだが、以下の課題がある:

1. **@id によるエンティティリンクがない**: 各ページが孤立した JSON-LD ブロックを持ち、エンティティ間の参照関係が表現されていない
2. **@graph パターン未使用**: ページごとに単一エンティティのみ出力しており、WebSite/Person/WebPage/BreadcrumbList などの関連エンティティをグラフとして表現できていない
3. **BreadcrumbList 未実装**: Google 検索結果でのパンくず表示に必要な構造化データが全ページで欠落
4. **WebPage ラッパー未使用**: Google が推奨するエンティティスタック（WebSite → WebPage → BlogPosting）の中間層がない
5. **Person エンティティの不整合**: ページごとに異なるプロパティセットで author/Person を定義しており、一貫性がない
6. **inLanguage 未指定**: コンテンツ言語がJSON-LDに明示されていない

これらの改善により、Google Rich Results への適格性向上（特にパンくず表示）、AI 検索（Google AI Overviews 等）での引用可能性の向上、エンティティグラフの一貫性確保が期待できる。

## Decision

### @graph + @id パターンの採用

各ページの JSON-LD を単一エンティティから `@graph` 配列に移行する。すべてのエンティティに `@id`（canonical URL + fragment）を付与し、ページ間で一貫した参照を可能にする。

#### @id 規約

| エンティティ | @id パターン |
|---|---|
| WebSite | `https://thinceller.net/#website` |
| Person | `https://thinceller.net/#person` |
| WebPage | `https://thinceller.net{path}#webpage` |
| BlogPosting | `https://thinceller.net/blog/{slug}#blogposting` |
| BreadcrumbList | `https://thinceller.net{path}#breadcrumb` |

#### ページごとのエンティティ構成

| ページ | エンティティ |
|---|---|
| `/` | WebSite, Person, WebPage |
| `/about` | WebSite, Person, ProfilePage, BreadcrumbList |
| `/blog` | WebSite, Person, CollectionPage, BreadcrumbList |
| `/blog/[slug]` | WebSite, Person, WebPage, BlogPosting, BreadcrumbList |
| `/blog/tags` | WebSite, Person, CollectionPage, BreadcrumbList |
| `/blog/tags/[tag]` | WebSite, Person, CollectionPage, BreadcrumbList |

### 実装方針

- `src/lib/structured-data.ts` に再利用可能なエンティティ生成ヘルパーを集約
- `src/components/JsonLd.tsx` を `schema-dts` の `Graph` 型に対応させる
- 既存の `schema-dts` ライブラリを継続使用し、TypeScript の型安全性を維持

### Considered Options

1. **複数 `<script>` ブロック**: エンティティごとに別々の `<script type="application/ld+json">` を出力する方法。@id による相互参照は可能だが、`@graph` の方がクリーンで、Google のドキュメントでも推奨されている。却下。

2. **`next-seo` 等の外部ライブラリ**: 構造化データ生成を外部ライブラリに委譲する方法。追加の依存関係が発生し、`schema-dts` で既に十分な型安全性が確保されている。却下。

## Consequences

### Positive

- Google Rich Results のパンくず表示が有効になる
- エンティティグラフの一貫性により、検索エンジンとLLMがサイト構造をより正確に理解できる
- ヘルパーモジュールにより、新しいページ追加時の構造化データ実装が容易になる
- `schema-dts` の型チェックにより、構造化データの正確性がコンパイル時に検証される

### Negative

- 各ページの JSON-LD 構築がやや複雑になる（ヘルパーで軽減）
- WebSite/Person エンティティが全ページで重複するが、Google は各ページを独立に処理するため必要
