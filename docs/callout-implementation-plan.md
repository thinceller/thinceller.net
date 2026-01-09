# 記事コールアウト（Alerts/Messages）実装計画

## 概要

zenn.devのメッセージ機能やGitHub Alertsのような、ユーザーに補足事項や注意事項を表示するコールアウト要素を記事中に挿入できるようにする。

## 参考仕様

### Zennのメッセージ記法

```markdown
:::message
通常のメッセージ（黄色背景）
:::

:::message alert
警告メッセージ（赤色背景）
:::
```

- 参考: https://zenn.dev/zenn/articles/markdown-guide

### GitHub Alerts記法

```markdown
> [!NOTE]
> ユーザーが知っておくべき有用な情報（青）

> [!TIP]
> より良い方法や近道のヒント（緑）

> [!IMPORTANT]
> 目標達成に必要な重要情報（紫）

> [!WARNING]
> 問題回避のための注意喚起（黄/オレンジ）

> [!CAUTION]
> 否定的な結果のリスク警告（赤）
```

- 参考: https://docs.github.com/ja/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts

## 現状のMDX処理パイプライン

```
MDXファイル → gray-matter → @mdx-js/mdx compile() → rehypeプラグイン → run() → React要素
```

- 使用中のプラグイン: `rehype-code-titles`, `@shikijs/rehype`, `rehype-slug`, `rehype-autolink-headings`
- カスタムコンポーネント: `Tweet`, `Image`, `OgpCard`
- remarkプラグインは現在未使用

## 実装アプローチの比較

| アプローチ | 記法例 | メリット | デメリット |
|------------|--------|----------|------------|
| **A: MDXコンポーネント** | `<Callout type="note">内容</Callout>` | シンプル、型安全、依存関係なし | MDX特有の記法 |
| **B: remarkプラグイン (GitHub記法)** | `> [!NOTE]\n> 内容` | 標準的、エディタ互換性良好 | 依存関係追加、複雑 |
| **C: remarkプラグイン (Zenn記法)** | `:::message\n内容\n:::` | Zennユーザーに馴染み深い | 依存関係追加、独自記法 |

### 推奨: アプローチA（MDXコンポーネント）

**理由:**

1. **既存アーキテクチャとの整合性**: `Tweet`, `Image`, `OgpCard` と同様にカスタムコンポーネントとして実装
2. **依存関係の増加なし**: 新しいライブラリ不要
3. **型安全性**: TypeScriptで型定義可能
4. **柔軟性**: 将来的に記法を変更したい場合もコンポーネント側で対応可能
5. **シンプルな実装**: rehype/remarkプラグインの追加不要

**トレードオフ:**

- 純粋なMarkdown記法ではなくJSX記法になる
- 他のMarkdownエディタでのプレビュー互換性がない

このプロジェクトはMDXを採用しており、すでに `<OgpCard>` などのカスタムコンポーネントを記事内で使用しているため、アプローチAが最も自然。

## コールアウトの種類

GitHub Alertsをベースに5種類を実装:

| 種類 | 用途 | アイコン | 色テーマ |
|------|------|----------|----------|
| `note` | 補足情報 | Info | 青 |
| `tip` | ヒント・アドバイス | Lightbulb | 緑 |
| `important` | 重要な情報 | AlertCircle | 紫 |
| `warning` | 注意喚起 | AlertTriangle | 黄/オレンジ |
| `caution` | 危険・リスク警告 | Ban | 赤 |

## 実装手順

### Step 1: Calloutコンポーネントの作成

`src/components/Callout.tsx` を作成:

```tsx
import {
  Info,
  Lightbulb,
  AlertCircle,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import type { ReactNode } from 'react';

type CalloutType = 'note' | 'tip' | 'important' | 'warning' | 'caution';

type CalloutProps = {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
};

const calloutConfig = {
  note: {
    icon: Info,
    label: 'Note',
    containerClass:
      'bg-blue-50 dark:bg-blue-950 border-blue-500 dark:border-blue-400',
    iconClass: 'text-blue-500 dark:text-blue-400',
    titleClass: 'text-blue-700 dark:text-blue-300',
  },
  tip: {
    icon: Lightbulb,
    label: 'Tip',
    containerClass:
      'bg-green-50 dark:bg-green-950 border-green-500 dark:border-green-400',
    iconClass: 'text-green-500 dark:text-green-400',
    titleClass: 'text-green-700 dark:text-green-300',
  },
  important: {
    icon: AlertCircle,
    label: 'Important',
    containerClass:
      'bg-purple-50 dark:bg-purple-950 border-purple-500 dark:border-purple-400',
    iconClass: 'text-purple-500 dark:text-purple-400',
    titleClass: 'text-purple-700 dark:text-purple-300',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    containerClass:
      'bg-amber-50 dark:bg-amber-950 border-amber-500 dark:border-amber-400',
    iconClass: 'text-amber-500 dark:text-amber-400',
    titleClass: 'text-amber-700 dark:text-amber-300',
  },
  caution: {
    icon: Ban,
    label: 'Caution',
    containerClass:
      'bg-red-50 dark:bg-red-950 border-red-500 dark:border-red-400',
    iconClass: 'text-red-500 dark:text-red-400',
    titleClass: 'text-red-700 dark:text-red-300',
  },
} as const;

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;
  const displayTitle = title ?? config.label;

  return (
    <aside
      className={`mb-6 rounded-md border-l-4 p-4 ${config.containerClass}`}
      role="note"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${config.iconClass}`} aria-hidden="true" />
        <span className={`font-bold ${config.titleClass}`}>{displayTitle}</span>
      </div>
      <div className="[&>p]:mb-0 [&>p:last-child]:mb-0">{children}</div>
    </aside>
  );
}
```

### Step 2: MDXComponentsへの登録

`src/components/MDXComponent.tsx` に追加:

```tsx
import { Callout } from '@/components/Callout';

export const CustomMDXComponents: MDXComponents = {
  // 既存のコンポーネント...
  Callout,
};
```

### Step 3: 使用例

記事内での使用方法:

```mdx
## セットアップ

<Callout type="note">
  このセクションでは開発環境のセットアップ方法を説明します。
</Callout>

<Callout type="tip" title="おすすめ">
  pnpmを使用すると、インストールが高速になります。
</Callout>

<Callout type="important">
  Node.js 18以上が必要です。
</Callout>

<Callout type="warning">
  既存の設定ファイルがある場合は上書きされます。
</Callout>

<Callout type="caution">
  本番環境では絶対に実行しないでください。
</Callout>
```

## デザイン仕様

### スタイル

- 左ボーダー: 4px、種類ごとの色
- 背景色: 薄い色（ダークモード対応）
- 角丸: 4px（rounded-md）
- パディング: 16px
- マージン: 下に24px（mb-6）

### アクセシビリティ

- `role="note"` 属性でスクリーンリーダー対応
- アイコンは `aria-hidden="true"` で装飾として扱う
- 適切なコントラスト比を確保

### レスポンシブ対応

- モバイルでも読みやすいパディングとフォントサイズ
- 内容が長い場合も適切に折り返し

## 動作確認手順

### 1. ローカル環境での確認

```bash
pnpm dev
```

テスト用の記事を作成してコールアウトの表示を確認。

### 2. ビルド確認

```bash
pnpm build
```

型エラーやビルドエラーがないことを確認。

### 3. 確認項目

- [ ] 5種類すべてのコールアウトが正しく表示される
- [ ] ダークモードで適切な色が表示される
- [ ] カスタムタイトルが正しく表示される
- [ ] コールアウト内のマークダウン（リンク、コード等）が正しくレンダリングされる
- [ ] モバイル表示で問題がない
- [ ] アクセシビリティチェック（スクリーンリーダー）

## ファイル変更一覧

| ファイル | 変更内容 |
|----------|----------|
| `src/components/Callout.tsx` | 新規作成 |
| `src/components/MDXComponent.tsx` | Calloutコンポーネントを追加 |

## 将来の拡張可能性

### 1. 折りたたみ機能

```tsx
<Callout type="note" collapsible defaultOpen={false}>
  長い内容...
</Callout>
```

### 2. GitHub Alerts記法のサポート（オプション）

将来的に `remark-github-alerts` プラグインを追加し、標準的なMarkdown記法もサポート可能:

```markdown
> [!NOTE]
> この記法も使えるようになる
```

### 3. Zenn記法のサポート（オプション）

`remark-directive` や自作プラグインで対応可能:

```markdown
:::message
この記法も使えるようになる
:::
```

## 参考リンク

### 類似実装

- [GitHub Alerts](https://docs.github.com/ja/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)
- [Zenn Markdown Guide](https://zenn.dev/zenn/articles/markdown-guide)
- [Docusaurus Admonitions](https://docusaurus.io/docs/markdown-features/admonitions)
- [MDX Components](https://mdxjs.com/docs/using-mdx/#components)

### ライブラリ

- [lucide-react](https://lucide.dev/guide/packages/lucide-react) - アイコン
- [remark-github-alerts](https://github.com/antfu/markdown-it-github-alerts) - GitHub記法プラグイン（将来拡張用）

## 備考

- アイコンには既存で使用している `lucide-react` を活用
- Tailwind CSS v4の設定に合わせたクラス名を使用
- 既存の `blockquote` スタイルとの差別化を意識したデザイン
