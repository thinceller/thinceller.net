# Introduce Playwright for E2E Testing

## Status

accepted

## Context

ライブラリアップデートの安全性やデプロイ前の動作確認が手動に依存しており、リグレッションの検出が困難だった。

## Decision

**Playwright** をE2Eテストフレームワークとして導入する。

- 対象ブラウザ: Chromium
- スモークテスト: 主要ページの表示確認、RSSフィード検証、ナビゲーション遷移テスト
- GitHub Actions CIで自動実行

### Considered Options

- **Playwright** (採用): 高速、TypeScript統合、CI公式サポート
- **Cypress**: 豊富なエコシステムだがパフォーマンスで劣る
- **テストなし**: 手動確認に依存し続ける

## Consequences

- CIでE2Eテストが走ることで、手動の動作確認の手間が削減された
- 安心してライブラリの更新などを行えるようになった
- CI実行時間が増加した（ビルド + テスト実行）
