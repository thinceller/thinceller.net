// Notion の Blog Posts データベースから Published の記事を MDX として書き出す。
// usage: node --env-file=.env.local scripts/notion/export-posts.mts
import fs from 'node:fs';
import path from 'node:path';
import { blocksToMd, buildFrontmatter, type NotionBlock } from './convert.mts';
import {
  createNotionClient,
  DATA_SOURCE_ID,
  type RichTextItem,
  richTextToPlain,
} from './lib.mts';

const client = createNotionClient();

async function listBlocks(blockId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;
  do {
    const res = await client.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...(res.results as NotionBlock[]));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return blocks;
}

async function queryPublishedPages(): Promise<NotionBlock[]> {
  const pages: NotionBlock[] = [];
  let cursor: string | undefined;
  do {
    const res = await client.dataSources.query({
      data_source_id: DATA_SOURCE_ID,
      filter: { property: 'Status', select: { equals: 'Published' } },
      start_cursor: cursor,
    });
    pages.push(...(res.results as NotionBlock[]));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return pages;
}

function toIsoUtc(date: string): string {
  return new Date(date).toISOString().replace('.000Z', 'Z');
}

const pages = await queryPublishedPages();
console.log(`found ${pages.length} published page(s)`);

for (const page of pages) {
  const props = page.properties;
  const title = richTextToPlain(props.Title.title as RichTextItem[]);
  const slug = richTextToPlain(props.Slug.rich_text as RichTextItem[]);
  const description = richTextToPlain(
    props.Description.rich_text as RichTextItem[],
  );
  const tags = (props.Tags.multi_select as { name: string }[]).map(
    (tag) => tag.name,
  );
  const start = props.PublishedTime.date?.start;
  if (!slug || !start) {
    console.warn(`skipping "${title}": Slug or PublishedTime is missing`);
    continue;
  }
  const publishedTime = toIsoUtc(start);
  const modifiedStart = props.ModifiedTime?.date?.start;
  const modifiedTime = modifiedStart ? toIsoUtc(modifiedStart) : undefined;

  const blocks = await listBlocks(page.id);
  const body = blocksToMd(blocks);
  const frontmatter = buildFrontmatter({
    title,
    description,
    publishedTime,
    modifiedTime,
    tags,
  });

  const filename = `${publishedTime.slice(0, 10)}-${slug}.mdx`;
  const outPath = path.join('_posts', filename);
  fs.writeFileSync(outPath, `${frontmatter}\n\n${body}\n`);
  console.log(`wrote ${outPath}`);
}
