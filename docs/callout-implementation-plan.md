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
    <div
      className={`mb-6 rounded-md border-l-4 p-4 ${config.containerClass}`}
      role="note"
      aria-label={displayTitle}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${config.iconClass}`} aria-hidden="true" />
        <span className={`font-bold ${config.titleClass}`}>{displayTitle}</span>
      </div>
      <div className="[&>p]:mb-0 [&>p:last-child]:mb-0">{children}</div>
    </div>
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

- `<div role="note">` でスクリーンリーダーに補足情報であることを伝える
- `aria-label` でコールアウトの種類を明示
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

## 技術的検討事項

### 1. HTML要素の選択: `<aside>` vs `<div>`

#### 検討結果

**結論: `<div role="note">` を使用する**

#### `<aside>` が不適切な理由

[MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/aside) および [WHATWG HTML仕様](https://html.spec.whatwg.org/multipage/sections.html) によると：

- `<aside>` は「文書のメインコンテンツに**間接的にしか関連しない**（tangentially related）部分」を表す
- サイドバー、広告、プルクォート、関連リンクなどに使用
- 仕様には「parentheticals（挿入句）には適切ではない」と明記されている

コールアウト（警告、ヒント、補足情報）は：

- 記事本文に**直接関連する**補足情報
- 読者が本文を読む流れの中で伝えるべき内容
- 本文から取り除くと意味が変わる可能性がある

したがって、`<aside>` は意味的に適切ではない。

#### 代替案の比較

| 要素 | 適切性 | 理由 |
|------|--------|------|
| `<div role="note">` | ★★★ | ARIAロールでスクリーンリーダーに適切に伝わる。Docusaurusも同様の実装 |
| `<section>` | ★★ | セクションとして意味を持つが、やや大げさ |
| `<aside>` | ★ | 「間接的に関連するコンテンツ」向けで、コールアウトには不適切 |

#### 参考: WHATWGでの `<callout>` 要素提案

[WHATWGでは `<callout>` 要素の提案](https://github.com/whatwg/html/issues/10100)がされているが、まだ標準化されていない。現時点では `<div role="note">` が最も適切。

#### 修正後のコード

```tsx
export function Callout({ type = 'note', title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;
  const displayTitle = title ?? config.label;

  return (
    <div
      className={`mb-6 rounded-md border-l-4 p-4 ${config.containerClass}`}
      role="note"
      aria-label={displayTitle}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${config.iconClass}`} aria-hidden="true" />
        <span className={`font-bold ${config.titleClass}`}>{displayTitle}</span>
      </div>
      <div className="[&>p]:mb-0 [&>p:last-child]:mb-0">{children}</div>
    </div>
  );
}
```

### 2. Tailwind CSS v4でのクラス名検出

#### 検討結果

**結論: 現在の実装方法（オブジェクト内の文字列リテラル）で問題なし**

#### Tailwind CSS v4の仕様

[Tailwind CSS公式ドキュメント](https://tailwindcss.com/docs/detecting-classes-in-source-files)によると：

- Tailwindはソースファイルを**プレーンテキスト**としてスキャンし、クラス名を検出
- コードとして解析するのではなく、文字列パターンとして検出
- **文字列リテラルとして記述されていれば検出される**

#### 問題になるケース

```tsx
// ❌ NG: テンプレートリテラルで動的生成
const color = 'blue';
const className = `bg-${color}-500`; // 検出されない

// ✅ OK: 完全な文字列リテラル
const config = {
  note: {
    containerClass: 'bg-blue-50 dark:bg-blue-950', // 検出される
  },
};
```

#### 現在の実装計画

`calloutConfig` オブジェクト内のクラス名は**完全な文字列リテラル**として記述されているため、Tailwindは正しく検出できる。

#### 注意事項

1. **テンプレートリテラルで動的にクラス名を生成しない**
2. **クラス名を分割して結合しない**（例: `'bg-' + 'blue-500'`）
3. 万が一検出されない場合は `@source inline()` を使用

```css
/* globals.css - 万が一の場合のフォールバック */
@source inline("bg-blue-50 dark:bg-blue-950 border-blue-500 ...");
```

#### Tailwind v4での safelist 廃止について

Tailwind CSS v4では `safelist` オプションが廃止された。代わりに：

- `@source inline()` ディレクティブを使用
- または safelist 用のテキストファイルを `@source` で読み込む

現在の実装では safelist は不要だが、将来的に動的なクラス名が必要になった場合は上記の方法で対応する。

## 備考

- アイコンには既存で使用している `lucide-react` を活用
- Tailwind CSS v4の設定に合わせたクラス名を使用
- 既存の `blockquote` スタイルとの差別化を意識したデザイン
- トップレベル要素は `<div role="note">` を使用（`<aside>` ではない）
