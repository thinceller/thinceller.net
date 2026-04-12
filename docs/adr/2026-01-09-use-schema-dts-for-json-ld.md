# Use schema-dts for JSON-LD Structured Data

## Status

accepted

## Context

SEO対策として、各ページにJSON-LD形式の構造化データを追加する必要があった。

構造化データにより：
- 検索エンジンがコンテンツをより正確に理解できる
- Googleリッチリザルトの表示可能性が向上する
- ナレッジグラフへの掲載機会が増える

ライブラリ選定では、TypeScript型安全性、実行時バンドルサイズ、保守性を考慮する必要があった。

参考: [JSON-LD実装計画](../json-ld-implementation-plan.md)

## Decision

JSON-LD構造化データの実装に **schema-dts** (Google公式) を使用する。

### Considered Options

**1. schema-dts（採用）**
- Google公式のTypeScript型定義ライブラリ
- 型定義のみ提供（実行時依存なし）
- devDependenciesとして導入

**2. next-seo**
- Next.js専用のSEOライブラリ
- JSON-LDコンポーネントを内蔵
- 設定が豊富だが、やや重い

**3. react-schemaorg**
- Reactコンポーネントベース
- 実行時依存がある

**4. ライブラリなし**
- Next.jsの標準機能のみで実装
- 型安全性がない

### 選択理由

- **ゼロランタイムコスト**: 型定義のみで、実行時バンドルサイズに影響しない
- **型安全性**: TypeScriptの型補完でschema.orgプロパティの間違いをコンパイル時に検出
- **Google公式**: schema.org仕様への準拠が保証されている
- **柔軟性**: Next.js App Routerと自由に組み合わせて実装可能
- **保守性**: シンプルな型定義ファイルのため長期的な保守が容易

## Consequences

**より容易になったこと:**
- 型安全にJSON-LDを記述でき、プロパティ名の間違いをコンパイル時に検出できる
- 実行時バンドルサイズへの影響がゼロ（devDependenciesのみ）
- 汎用 `JsonLd` コンポーネントで各ページに適切なスキーマを配置できた
- Google公式ツールによる標準準拠の保証

**より困難になったこと:**
- JSON-LD生成ロジック自体は自前で実装する必要がある（ただしNext.js標準機能で十分対応可能）
- 各ページで適切なスキーマタイプを選択・実装する必要がある
