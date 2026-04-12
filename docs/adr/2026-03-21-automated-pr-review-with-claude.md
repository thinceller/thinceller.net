# Automated PR Review with Claude Code Actions

## Status

accepted

## Context

個人開発かつAIエージェント開発においてコードレビューが人間に属人化しており、レビュー観点の漏れや品質のばらつきがあった。

## Decision

**Claude Code Actions** を使用した自動PRレビューワークフローを導入する。

### 汎用PRレビュー

6つの観点（Code Quality, Bug Detection, Security, Performance, Consistency, Type Safety）で並列にサブエージェントを起動し、PRコメント・インラインコメントを自動投稿する。

### 依存関係更新PR向けレビュー

Renovateが作成したPRを自動レビューし、低リスクの更新は自動承認する。

### Considered Options

- **Claude Code Actions** (採用): AIによる多角的レビュー、プロジェクトコンテキストを理解
- **CodeRabbit**: AIレビューツール
- **手動レビューのみ**: 属人化が続く

## Consequences

- CIでレビューが走ることで、AIエージェントがレビューコメントを見て自動で修正できるようになった
- 6つの観点で漏れなくチェックされるようになった
- 依存関係更新PRのトリアージが自動化された
- Claude API使用料が発生する
