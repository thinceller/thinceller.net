# Use Client-Side Rendering for Mermaid.js Diagrams

## Status

accepted

## Context

技術記事でフローチャート、シーケンス図などのダイアグラムを表示する機能が必要だった。Mermaid.jsは宣言的な記法でダイアグラムを作成できる人気のライブラリ。

要件：
- MDX記事内で ` ```mermaid ` コードブロックで記述
- ライト/ダークモード両対応
- サイトのパフォーマンスへの影響を最小化
- Vercelデプロイ環境での安定性

参考: [Mermaid実装計画](../mermaid-implementation-plan.md)

## Decision

Mermaid.jsダイアグラムは **クライアントサイドレンダリング** で実装する。

### 実装アプローチ

1. **カスタムrehypeプラグイン**: `language-mermaid` コードブロックを `<MermaidDiagram>` コンポーネント呼び出しに変換
2. **動的import**: クライアントコンポーネントで `mermaid` ライブラリを動的にimport
3. **テーマ連動**: `useTheme()` フックでテーマ変更時に自動再描画

### Considered Options

**1. クライアントサイドレンダリング（採用）**
- mermaidをブラウザで動的にimport
- `useEffect` でSVGを描画
- テーマ切り替え時に再描画

メリット：
- Vercelデプロイにビルド依存（Playwright/Chromium）を追加しなくて済む
- 既存の `data-theme` ベースのダークモードとシームレスに統合
- Next.js App Router / RSCとの互換性が高い

デメリット：
- mermaidライブラリが大きい（minified後で約3MB）
- 初回表示時にローディング状態が発生
- 動的importでも、ダイアグラム含むページへの初回訪問時には全チャンクが読み込まれる

**2. ビルドタイムレンダリング（不採用）**
- `rehype-mermaid` + Playwrightでビルド時にSVG生成

メリット：
- クライアントにmermaidを配信しない（バンドルサイズゼロ）
- 初期HTMLにSVGが含まれる

デメリット：
- Playwright（+Chromium ~200MB+）のビルド環境依存
- Vercelビルド環境でのPlaywright設定が必要
- ダークモード対応が `prefers-color-scheme` に限定され、`data-theme` ベースの切り替えと不整合

### 選択理由

- **デプロイの安定性**: Vercelで追加のビルド依存なしで動作
- **テーマシステムとの統合**: 既存の `data-theme` ベースのダークモードと完全に統合
- **実装のシンプルさ**: 既存のMDXパイプラインへの変更が最小限
- **バンドルサイズの緩和**: 動的importで初期バンドルには含まれない

## Consequences

**より容易になったこと:**
- テーマ切り替え時にダイアグラムが自動的に再描画される
- Vercelでの安定したデプロイ（追加のビルド依存なし）
- 既存のThemeContext/ThemeToggleとシームレスに統合
- セキュリティ: ブログ記事は著者のみが編集するため、Mermaid記法の信頼性は担保されている

**より困難になったこと:**
- 初回表示時のCLS（Cumulative Layout Shift）対策が必要
  - 対策: 固定高さ（min-height: 200px）のプレースホルダ表示
  - 対策: テーマ切り替え時は既存SVGを維持したまま再描画
- バンドルサイズへの影響
  - 緩和策: 動的importにより初期バンドルには含まれない
  - 緩和策: mermaidを含む記事ページでのみロード
