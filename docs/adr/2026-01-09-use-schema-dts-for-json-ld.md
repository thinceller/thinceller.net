# Use schema-dts for JSON-LD Structured Data

## Status

accepted

## Context

SEO対策としてJSON-LD形式の構造化データを各ページに追加する必要があった。TypeScript型安全性と依存関係サイズを考慮してライブラリを選定した。

参考: `docs/json-ld-implementation-plan.md`

## Decision

JSON-LD実装に **schema-dts** (Google公式) を使用する。

### Considered Options

- **schema-dts**: TypeScript型定義のみ提供、実行時依存なし、Google公式
- **next-seo**: Next.js専用、JSON-LDコンポーネント内蔵だが設定が多い
- **react-schemaorg**: Reactコンポーネントベース
- **ライブラリなし**: Next.js標準機能のみ

### 選択理由

- 型定義のみで実行時バンドルサイズに影響しない（devDependencies）
- TypeScriptの型補完でschema.orgプロパティの間違いを防止できる
- Google公式でschema.org仕様への準拠が保証されている

## Consequences

- 型安全にJSON-LDを記述でき、プロパティ名の間違いをコンパイル時に検出できる
- 汎用 `JsonLd` コンポーネントで各ページに適切なスキーマを配置できた
- JSON-LD生成ロジック自体は自前実装だが、Next.js標準機能で十分対応可能
