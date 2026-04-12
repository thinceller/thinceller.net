# Implement Scroll-Linked Table of Contents

## Status

accepted

## Context

技術記事が長くなると、読者が現在位置を把握したり目的のセクションにジャンプすることが困難になる。

## Decision

**スクロール連動型の目次機能**を実装する。

- rehypeプラグイン (`rehypeExtractHeadings`) で見出し情報を抽出
- `TableOfContents` クライアントコンポーネントでIntersection Observer APIを使用し、スクロール位置に応じてアクティブ項目をハイライト

### Considered Options

- **スクロール連動型** (採用): Intersection Observer APIでアクティブセクションをハイライト
- **静的な目次**: アンカーリンクのみ、スクロール連動なし

## Consequences

- 長い記事でも現在位置を把握しやすくなった
- 見出しを書くだけで目次が自動生成される
- クライアントサイドJavaScriptへの依存が増えた
