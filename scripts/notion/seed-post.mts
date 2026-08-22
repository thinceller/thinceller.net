// MDX 記事を Notion の Blog Posts データベースに投入する。
// usage: node --env-file=.env.local scripts/notion/seed-post.mts _posts/<file>.mdx
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { mdToBlocks } from './convert.mts';
import {
  createNotionClient,
  DATA_SOURCE_ID,
  postMetaToProperties,
} from './lib.mts';

const file = process.argv[2];
if (!file) {
  console.error(
    'usage: node --env-file=.env.local scripts/notion/seed-post.mts _posts/<file>.mdx',
  );
  process.exit(1);
}

// サイトの URL スラッグは日付込みのファイル名 stem（例: 2022-05-09-git-cc）
const slug = path.basename(file, '.mdx');
if (!/^\d{4}-\d{2}-\d{2}-/.test(slug)) {
  throw new Error(`unexpected filename: ${file}`);
}

const { data, content } = matter(fs.readFileSync(file, 'utf8'));
const client = createNotionClient();

const page = await client.pages.create({
  parent: { type: 'data_source_id', data_source_id: DATA_SOURCE_ID },
  properties: postMetaToProperties(
    {
      title: data.title,
      slug,
      description: String(data.description).trim(),
      tags: (data.tags ?? []) as string[],
      publishedTime: data.publishedTime,
      modifiedTime: data.modifiedTime,
    },
    'Published',
    // biome-ignore lint/suspicious/noExplicitAny: SDK のプロパティ型との突き合わせを省略
  ) as any,
  children: mdToBlocks(content.trim()) as never[],
});

console.log(`Created: ${'url' in page ? page.url : page.id}`);
