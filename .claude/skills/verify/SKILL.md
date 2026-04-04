---
name: verify
description: プロジェクトの品質チェック（lint、format、typecheck、build）をまとめて実行する。コード変更後や完了確認時に使用。
---

# Verify

コード変更後の品質チェックを一括実行します。

## 手順

以下のコマンドを順番に実行してください：

```bash
pnpm lint
pnpm format
pnpm typecheck
pnpm build
```

## ブログ記事の変更検出

`git diff --name-only HEAD` で `_posts/*.mdx` の変更があるか確認し、変更がある場合は追加で実行:

```bash
pnpm lint:post
```

## 注意事項

- `pnpm typecheck` は `pnpm build` の後に実行する必要がある場合があります（Next.jsの型生成に依存）。エラーが出た場合は `pnpm build` を先に実行してから再試行してください。
- すべてのチェックが通るまで問題を修正してください。
