# Unify Article Frontmatter Date Field to publishedTime

## Status

accepted

## Context

MDX記事のフロントマターで日付フィールド名に一貫性がなかった。JSON-LD構造化データ実装にあたり、Schema.orgプロパティとの対応を明確にする必要があった。

## Decision

記事の日付フィールドを **`publishedTime`** / **`modifiedTime`** に統一する（ISO 8601形式）。

### Considered Options

- **`publishedTime`** (採用): Schema.org `datePublished` との対応が明確、時刻情報を含むことが名前から自明
- **`date`**: シンプルだが公開日か更新日か曖昧
- **`createdAt` / `updatedAt`**: DB的な命名、Web記事では「公開」の概念の方が適切

## Consequences

- JSON-LD実装が簡素化された（フィールド名がSchema.orgプロパティと直接対応）
- フロントマター処理のコードと型定義がシンプルになった
- 既存記事のフロントマターを一括更新する移行作業が発生した
