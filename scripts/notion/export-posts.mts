// Notion の Blog Posts データベースから Published の記事を MDX として書き出す。
// usage: node --env-file=.env.local scripts/notion/export-posts.mts
import fs from 'node:fs';
import path from 'node:path';
import { blocksToMd, buildFrontmatter, type NotionBlock } from './convert.mts';
import {
  createNotionClient,
  DATA_SOURCE_ID,
  propertiesToPostMeta,
} from './lib.mts';

const client = createNotionClient();

async function collectPaginated(
  fetchPage: (cursor?: string) => Promise<{
    results: unknown[];
    has_more: boolean;
    next_cursor: string | null;
  }>,
): Promise<NotionBlock[]> {
  const all: NotionBlock[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetchPage(cursor);
    all.push(...(res.results as NotionBlock[]));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return all;
}

async function listBlocks(blockId: string): Promise<NotionBlock[]> {
  const blocks = await collectPaginated((cursor) =>
    client.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    }),
  );
  // ネストされたリストなどの子ブロックを convert.mts が扱う形に取り込む
  for (const block of blocks) {
    if (block.has_children) {
      block[block.type].children = await listBlocks(block.id);
    }
  }
  return blocks;
}

const pages = await collectPaginated((cursor) =>
  client.dataSources.query({
    data_source_id: DATA_SOURCE_ID,
    filter: { property: 'Status', select: { equals: 'Published' } },
    start_cursor: cursor,
  }),
);
console.log(`found ${pages.length} published page(s)`);

for (const page of pages) {
  const meta = propertiesToPostMeta(page.properties);
  if (!meta.slug || !meta.publishedTime) {
    console.warn(`skipping "${meta.title}": Slug or PublishedTime is missing`);
    continue;
  }

  const blocks = await listBlocks(page.id);
  const body = blocksToMd(blocks);
  const frontmatter = buildFrontmatter(meta);

  const outPath = path.join('_posts', `${meta.slug}.mdx`);
  fs.writeFileSync(outPath, `${frontmatter}\n\n${body}\n`);
  console.log(`wrote ${outPath}`);
}
