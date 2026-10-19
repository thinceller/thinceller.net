# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Next.js (App Router) + MDX の個人ブログサイト。Vercelにデプロイ。

## 開発環境

- Nix Flakes + direnv で Node.js / pnpm を管理（`flake.nix`）
- パッケージマネージャー: pnpm

## コマンド

```bash
pnpm dev          # 開発サーバー（Turbopack）
pnpm build        # プロダクションビルド
pnpm lint         # Biome lint
pnpm format       # Biome format
pnpm typecheck    # 型チェック ※事前にpnpm buildが必要
pnpm lint:post    # 日本語記事のtextlint
pnpm test:e2e     # Playwright E2Eテスト（ビルド→起動→テスト）
pnpm test:e2e:ui  # Playwright UIモードでE2Eテスト
```

コード変更後は必ず実行: `pnpm lint && pnpm format && pnpm typecheck`
バンドルサイズ確認: `pnpm build:analyze`

## コードスタイル

Biome使用（ESLint/Prettier不使用）:
- JS引用符: シングルクォート / JSX引用符: ダブルクォート
- 行幅80文字、インデント2スペース、末尾カンマ・セミコロン常時
- img要素禁止 → `next/image` の `<Image>` を使用

新規UI要素追加時は既存の色・余白・ボーダー・装飾を流用し、独自値を避けて統一感を保つ。

## Next.js (Cache Components)

`cacheComponents: true` 有効。`dynamic` / `dynamicParams` のRoute Segment Configは使えない。
- 未知のslug・タグは `notFound()` で404を返す
- `new Date()` やMDXコンパイル等 prerender 中に不安定な処理、外部fetchのキャッシュは `'use cache'` + `cacheLife` を使う（`next.revalidate` は使わない）
- `'use cache'` 内で throw すると prerender が失敗する。外部取得の失敗時はフォールバックを返し `cacheLife('minutes')` で短命にする

## ブログ記事

- 配置: `_posts/YYYY-MM-DD-title.mdx`
- 必須フロントマター: `title`, `description`, `publishedTime`（ISO8601）
- オプション: `modifiedTime`, `tags`
- 画像は `public/images/` に配置
- Mermaid.js対応（`mermaid` コードブロック）

## Git規約

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- スコープ付き: `feat(blog):`, `fix(deps):`
