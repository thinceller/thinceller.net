// MDX 記事を Notion の Blog Posts データベースに投入する。
// usage: node --env-file=.env.local scripts/notion/seed-post.mts _posts/<file>.mdx
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { mdToBlocks } from './convert.mts';
import { createNotionClient, DATA_SOURCE_ID } from './lib.mts';

const file = process.argv[2];
if (!file) {
  console.error(
    'usage: node --env-file=.env.local scripts/notion/seed-post.mts _posts/<file>.mdx',
  );
  process.exit(1);
}

const slugMatch = path.basename(file).match(/^\d{4}-\d{2}-\d{2}-(.+)\.mdx$/);
if (!slugMatch) {
  throw new Error(`unexpected filename: ${file}`);
}
const slug = slugMatch[1];

const { data, content } = matter(fs.readFileSync(file, 'utf8'));
const client = createNotionClient();

const page = await client.pages.create({
  parent: { type: 'data_source_id', data_source_id: DATA_SOURCE_ID },
  properties: {
    Title: { title: [{ type: 'text', text: { content: data.title } }] },
    Slug: { rich_text: [{ type: 'text', text: { content: slug } }] },
    Description: {
      rich_text: [
        { type: 'text', text: { content: String(data.description).trim() } },
      ],
    },
    Tags: {
      multi_select: ((data.tags ?? []) as string[]).map((name) => ({ name })),
    },
    PublishedTime: { date: { start: data.publishedTime } },
    ...(data.modifiedTime
      ? { ModifiedTime: { date: { start: data.modifiedTime } } }
      : {}),
    Status: { select: { name: 'Published' } },
    // biome-ignore lint/suspicious/noExplicitAny: SDK のプロパティ型との突き合わせを省略
  } as any,
  children: mdToBlocks(content.trim()) as never[],
});

console.log(`Created: ${'url' in page ? page.url : page.id}`);
