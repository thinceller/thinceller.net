# Unify Article Frontmatter Date Field to publishedTime

## Status

accepted

## Context

MDX記事のフロントマターで日付フィールド名に一貫性がなかった（`date`, `createdAt` 等が混在）。

JSON-LD構造化データ実装にあたり、以下の課題が顕在化：
- Schema.org `BlogPosting` の `datePublished` プロパティとのマッピングが不明確
- フロントマター処理のコードが複雑化
- 型定義が曖昧

## Decision

記事の日付フィールドを **`publishedTime`**（必須） / **`modifiedTime`**（オプション） に統一する。

両フィールドともISO 8601形式（`YYYY-MM-DDTHH:mm:ssZ`）で記述する。

### Considered Options

**1. publishedTime / modifiedTime（採用）**
- Schema.org `datePublished` / `dateModified` との対応が明確
- `Time` サフィックスで時刻情報を含むことが明示的
- 意味が明確（公開日時 / 更新日時）

**2. date / updatedAt**
- シンプルな命名
- ただし `date` は公開日か作成日か曖昧

**3. createdAt / updatedAt**
- データベース的な命名
- Web記事では「公開」の概念の方が適切

### 選択理由

- **Schema.org準拠**: `datePublished` / `dateModified` と命名が直接対応
- **意味の明確性**: 「公開日時」と「更新日時」の区別が明確
- **ISO 8601形式の明示**: `Time` サフィックスで時刻情報を含むことが分かりやすい
- **国際標準準拠**: Web標準であるSchema.orgの命名規則に従う

## Consequences

**より容易になったこと:**
- JSON-LD実装が簡素化された（フィールド名がSchema.orgプロパティと直接対応）
- フロントマター処理のコードと型定義がシンプルになった
- 新しい記事を作成する際の混乱が減少

**より困難になったこと:**
- 既存記事のフロントマターを一括更新する移行作業が発生した
- 過去の記事を参照する際、フィールド名が変更されていることに注意が必要
