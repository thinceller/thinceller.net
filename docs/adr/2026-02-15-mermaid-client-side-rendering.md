# Use Client-Side Rendering for Mermaid.js Diagrams

## Status

accepted

## Context

MDX記事内で技術的なダイアグラム（フローチャート、シーケンス図等）を表示する機能が必要だった。Mermaid.jsは宣言的な記法でダイアグラムを作成できる人気のライブラリである。

課題:
- MDX記事内でMermaidダイアグラムをどのように描画するか
- ライト/ダークモード両対応が必要
- サイトのパフォーマンスへの影響を最小化したい
- Vercelデプロイ環境での安定性が重要

参考: 実装計画ドキュメント `docs/mermaid-implementation-plan.md`

## Decision

Mermaid.jsダイアグラムは **クライアントサイドレンダリング** で実装する。

具体的なアプローチ:
1. カスタムrehypeプラグインで ` ```mermaid ` コードブロックを `<MermaidDiagram>` コンポーネント呼び出しに変換
2. クライアントコンポーネントで `mermaid` ライブラリを動的import
3. `useTheme()` フックを使用してテーマ変更時に自動再描画

### Considered Options

#### A. クライアントサイドレンダリング（採用）

- mermaidパッケージをブラウザで動的にimport
- `useEffect`でSVGを描画

**メリット:**
- Playwright等のビルド時依存なし（Vercelデプロイに影響なし）
- テーマ切り替え時にダイアグラムを再描画できる（動的ダークモード対応）
- 既存のrehypeパイプラインへの変更が少ない
- Next.js App Router / RSCとの互換性が高い

**デメリット:**
- mermaidライブラリが大きい（~2MB+ minified）→ 動的importで緩和
- 初回表示時にローディング状態が発生する
- 図の内容が初期HTMLに含まれない（SEO的にはブログ図表なので影響は軽微）

#### B. ビルドタイムレンダリング（不採用）

- `rehype-mermaid` + Playwrightでビルド時にSVG生成

**メリット:**
- クライアントにmermaidを配信しない（バンドルサイズゼロ）
- 初期HTMLにSVGが含まれる

**デメリット:**
- Playwright（+Chromium ~200MB+）のビルド環境依存
- Vercelビルド環境でのPlaywright設定が必要
- ダークモード対応が `<picture>` + `prefers-color-scheme` に限定（`data-theme`ベースの切り替えと不整合）
- Next.jsバンドラーが `fs` モジュール解決エラーを起こす既知問題あり
- ビルド時間増加

### 選択理由

1. **Vercelデプロイの安定性**: 追加のビルド依存関係なし
2. **既存のテーマシステムとの統合**: `data-theme`ベースのダークモードとシームレスに連携
3. **実装の保守性**: シンプルで理解しやすい
4. **バンドルサイズの影響軽減**: `next/dynamic`の遅延読み込みで対応可能

## Consequences

### より容易になること

- テーマ切り替え時のダイアグラム自動更新
- Vercelでの安定したデプロイ
- 既存のThemeContext/ThemeToggleとの統合
- 将来的なMermaid.jsバージョンアップ対応

### より困難になること

- 初回ロード時のCLS（Cumulative Layout Shift）対策が必要
  - 対策: 固定高さ（min-height: 200px）のプレースホルダ表示
  - 対策: テーマ切り替え時は既存SVGを維持したまま再描画
- バンドルサイズへの影響
  - 対策: 動的import により初期バンドルには含めない
  - 対策: mermaidを含む記事ページでのみロード
- SEOへの軽微な影響
  - ダイアグラムの内容が初期HTMLに含まれない
  - ただし、ブログの技術図表なので影響は限定的

### 技術的詳細

- **rehypeプラグイン**: `src/lib/rehype-mermaid.ts` を作成
- **コンポーネント**: `src/components/MermaidDiagram.tsx` (クライアントコンポーネント)
- **テーママッピング**: `resolvedTheme === 'dark' ? 'dark' : 'default'`
- **CLS軽減**: プレースホルダ + SVG差し替え最適化

<!-- TODO: 以下の情報を追記してください -->
<!-- - 実際のバンドルサイズへの影響（pnpm build:analyze結果） -->
<!-- - パフォーマンス計測結果（CLS, LCP等） -->
<!-- - ユーザーフィードバック -->
