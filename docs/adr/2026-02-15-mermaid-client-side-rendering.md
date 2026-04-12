# Use Client-Side Rendering for Mermaid.js Diagrams

## Status

accepted

## Context

MDX記事内でMermaid.jsダイアグラムを表示する機能が必要だった。ライト/ダークモード両対応とVercelデプロイ環境での安定性を考慮する必要があった。

参考: `docs/mermaid-implementation-plan.md`

## Decision

Mermaid.jsダイアグラムは **クライアントサイドレンダリング** で実装する。

- カスタムrehypeプラグインで `language-mermaid` コードブロックを `<MermaidDiagram>` コンポーネントに変換
- クライアントコンポーネントで `mermaid` を動的importし、`useTheme()` でテーマ変更時に自動再描画

### Considered Options

- **クライアントサイドレンダリング** (採用): 動的import + useEffect でブラウザ描画
- **ビルドタイムレンダリング** (`rehype-mermaid` + Playwright): ビルド時にSVG生成

### 選択理由

- Vercelデプロイにビルド依存（Playwright/Chromium）を追加しなくて済む
- 既存の `data-theme` ベースのダークモードとシームレスに統合できる
- バンドルサイズは動的importで初期バンドルに含めないことで緩和

## Consequences

- テーマ切り替え時にダイアグラムが自動的に再描画される
- 初回表示時のCLS対策として、固定高さプレースホルダとSVG差し替え最適化を実装した
- mermaid（~2MB+）は動的importのため、初期バンドルには含まれない
