# Migrate to Biome for Code Quality Tooling

## Status

accepted

## Context

リンター（ESLint）とフォーマッター（Prettier）が別々のツールで、それぞれにプラグインを個別に導入・管理する必要があった。JS製のツールであるため速度面でも改善の余地があった。

## Decision

コード品質管理ツールを **Biome** に統一する。

### Considered Options

- **Biome**: Rust製の統合ツール。リンティング・フォーマット・インポート整理を1つで実現
- **ESLint + Prettier**: 従来の組み合わせを維持

## Consequences

- ツールが統一され、設定ファイルが `biome.json` 1つに集約された
- アップデートも1パッケージで完結するため保守が楽になった
- Rust製で高速に動作し、フィードバックループが速くなった
- ESLint固有のプラグインエコシステムには依存できなくなった
