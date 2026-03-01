# Use schema-dts for JSON-LD Structured Data

## Status

accepted

## Context

SEO対策としてJSON-LD形式の構造化データを各ページに追加する必要があった。構造化データにより、検索エンジンがコンテンツをより正確に理解でき、リッチリザルトの表示可能性が向上する。

JSON-LD実装には複数のライブラリ選択肢があり、TypeScript型安全性、依存関係サイズ、保守性などを考慮する必要があった。

参考: 実装計画ドキュメント `docs/json-ld-implementation-plan.md`

## Decision

JSON-LD構造化データの実装に **schema-dts** (Google公式) を使用する。

### Considered Options

| ライブラリ | 特徴 | 評価 |
|------------|------|------|
| **schema-dts** | TypeScript型定義のみ提供、依存関係なし、型安全 | ★★★ |
| **next-seo** | Next.js専用、JSON-LDコンポーネント内蔵、設定が豊富 | ★★ |
| **react-schemaorg** | Reactコンポーネントベース | ★ |
| **ライブラリなし** | Next.js標準機能のみ使用、依存関係増加なし | ★★ |

### 選択理由

1. **型安全性**: TypeScriptの型補完・バリデーションを活用可能
2. **軽量**: 型定義のみで実行時依存関係なし
3. **Google公式**: schema.org仕様への準拠が保証されている
4. **柔軟性**: Next.js App Routerと組み合わせて自由に実装可能
5. **保守性**: シンプルな型定義ファイルのため長期的な保守が容易

### 実装アプローチ

- 汎用的な `JsonLd` コンポーネントを作成 (`src/components/JsonLd.tsx`)
- 各ページで適切なスキーマタイプを使用:
  - トップページ: `WebSite`
  - Aboutページ: `ProfilePage` + `Person`
  - ブログ記事: `BlogPosting`
  - ブログ一覧/タグ一覧: `CollectionPage`
- Server Componentで実装し、静的生成時にJSON-LDが含まれるようにする

## Consequences

### より容易になること

- **型安全なJSON-LD記述**: TypeScriptの補完でプロパティ名の間違いを防止
- **軽量な実装**: devDependenciesのみで実行時のバンドルサイズへの影響なし
- **Google準拠**: 公式ツールによるschema.org仕様への完全準拠
- **SEO改善**: 検索エンジンによるコンテンツ理解の向上
- **リッチリザルト対応**: Google検索結果での拡張表示の可能性

### より困難になること

<!-- TODO: 以下の項目を確認・追記してください -->
- 型定義のみのため、JSON-LD生成の実装は自前で行う必要がある
  - ただし、Next.jsの標準機能で十分対応可能
<!-- - その他、実装時に発生した課題があれば記載 -->

### 検証方法

- Google Rich Results Test
- Schema Markup Validator
- Google Search Console での構造化データ確認

<!-- TODO: 以下の情報を追記してください -->
<!-- - 実際のSEO効果（Search Console データ） -->
<!-- - リッチリザルトの表示状況 -->
<!-- - 検出されたエラー・警告への対応履歴 -->
