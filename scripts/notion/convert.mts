// MDX 本文と Notion ブロックの相互変換
import {
  fenceLangToNotion,
  inlineMdToRichText,
  notionLangToFence,
  richTextToInlineMd,
  richTextToPlain,
} from './lib.mts';

export interface NotionBlock {
  type: string;
  // biome-ignore lint/suspicious/noExplicitAny: ブロック型ごとのペイロードに動的アクセスするため
  [key: string]: any;
}

const LIST_ITEM = /^(\s*)(-|\d+\.) (.*)$/;

export function mdToBlocks(body: string): NotionBlock[] {
  const blocks: NotionBlock[] = [];
  const lines = body.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i++;
      continue;
    }
    const fence = line.match(/^```(\S+)?$/);
    if (fence) {
      // caption にフェンス情報文字列（例: tsx:_app.tsx）を無損失で保持し、
      // language はシンタックスハイライト表示用の近似とする
      const info = fence[1] ?? '';
      const lang = info.split(':')[0];
      const code: string[] = [];
      i++;
      while (i < lines.length && lines[i] !== '```') {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({
        type: 'code',
        code: {
          language: fenceLangToNotion(lang || 'plain text'),
          rich_text: [{ type: 'text', text: { content: code.join('\n') } }],
          caption: info ? [{ type: 'text', text: { content: info } }] : [],
        },
      });
      continue;
    }
    const heading = line.match(/^(#{1,3}) (.*)$/);
    if (heading) {
      const key = `heading_${heading[1].length}`;
      blocks.push({
        type: key,
        [key]: { rich_text: inlineMdToRichText(heading[2]) },
      });
      i++;
      continue;
    }
    const ogp = line.match(/^<OgpCard url="([^"]+)" \/>$/);
    if (ogp) {
      blocks.push({ type: 'bookmark', bookmark: { url: ogp[1] } });
      i++;
      continue;
    }
    if (LIST_ITEM.test(line)) {
      const items: { indent: number; ordered: boolean; text: string }[] = [];
      while (i < lines.length) {
        const item = lines[i].match(LIST_ITEM);
        if (!item) {
          break;
        }
        items.push({
          indent: Math.floor(item[1].length / 2),
          ordered: item[2] !== '-',
          text: item[3],
        });
        i++;
      }
      blocks.push(...buildListTree(items));
      continue;
    }
    if (/^>( |$)/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>( |$)/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^> ?/, ''));
        i++;
      }
      blocks.push({
        type: 'quote',
        quote: { rich_text: inlineMdToRichText(quoteLines.join('\n')) },
      });
      continue;
    }
    const paragraph = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,3} |```|- |\d+\. |> |<OgpCard )/.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i++;
    }
    blocks.push({
      type: 'paragraph',
      paragraph: { rich_text: inlineMdToRichText(paragraph.join('\n')) },
    });
  }
  return blocks;
}

function buildListTree(
  items: { indent: number; ordered: boolean; text: string }[],
): NotionBlock[] {
  const root: NotionBlock[] = [];
  // containers[d] = 深さ d でアイテムを追加する先の配列
  let containers: NotionBlock[][] = [root];
  for (const item of items) {
    const depth = Math.min(item.indent, containers.length - 1);
    const type = item.ordered ? 'numbered_list_item' : 'bulleted_list_item';
    const children: NotionBlock[] = [];
    const block: NotionBlock = {
      type,
      [type]: { rich_text: inlineMdToRichText(item.text), children },
    };
    containers[depth].push(block);
    containers = containers.slice(0, depth + 1);
    containers.push(children);
  }
  pruneEmptyChildren(root);
  return root;
}

function pruneEmptyChildren(blocks: NotionBlock[]): void {
  for (const block of blocks) {
    const children = block[block.type]?.children as NotionBlock[] | undefined;
    if (!children) {
      continue;
    }
    if (children.length === 0) {
      delete block[block.type].children;
    } else {
      pruneEmptyChildren(children);
    }
  }
}

const BARE_URL = /^https?:\/\/\S+$/;
// 連続時に空行を挟まず連結するブロック種別
const CONTINUED_TYPES = new Set([
  'bulleted_list_item',
  'numbered_list_item',
  'bookmark',
]);

function blockToMd(block: NotionBlock, numberedIndex: number): string | null {
  switch (block.type) {
    case 'heading_1':
    case 'heading_2':
    case 'heading_3': {
      const level = '#'.repeat(Number(block.type.slice(-1)));
      return `${level} ${richTextToInlineMd(block[block.type].rich_text)}`;
    }
    case 'paragraph':
      return richTextToInlineMd(block.paragraph.rich_text);
    case 'bookmark':
      return `<OgpCard url="${block.bookmark.url}" />`;
    case 'bulleted_list_item':
    case 'numbered_list_item': {
      const payload = block[block.type];
      const marker =
        block.type === 'numbered_list_item' ? `${numberedIndex}.` : '-';
      let md = `${marker} ${richTextToInlineMd(payload.rich_text)}`;
      const children = payload.children as NotionBlock[] | undefined;
      if (children && children.length > 0) {
        const childMd = blocksToMd(children)
          .split('\n')
          .map((childLine) => `  ${childLine}`)
          .join('\n');
        md += `\n${childMd}`;
      }
      return md;
    }
    case 'code': {
      const caption = richTextToPlain(block.code.caption);
      const info = caption || notionLangToFence(block.code.language);
      return `\`\`\`${info}\n${richTextToPlain(block.code.rich_text)}\n\`\`\``;
    }
    case 'quote':
      return richTextToInlineMd(block.quote.rich_text)
        .split('\n')
        .map((quoteLine) => (quoteLine === '' ? '>' : `> ${quoteLine}`))
        .join('\n');
    case 'divider':
      return '---';
    default:
      console.warn(`skipping unsupported block type: ${block.type}`);
      return null;
  }
}

// Notion 上で URL をそのまま貼った段落は bookmark ブロックと同義として扱う
function normalizeBlock(block: NotionBlock): NotionBlock {
  if (block.type !== 'paragraph') {
    return block;
  }
  const plain = richTextToPlain(block.paragraph.rich_text);
  return BARE_URL.test(plain)
    ? { type: 'bookmark', bookmark: { url: plain } }
    : block;
}

export function blocksToMd(blocks: NotionBlock[]): string {
  const parts: string[] = [];
  let prevType: string | null = null;
  let numberedIndex = 0;
  for (const block of blocks.map(normalizeBlock)) {
    numberedIndex = block.type === 'numbered_list_item' ? numberedIndex + 1 : 0;
    const md = blockToMd(block, numberedIndex);
    if (md === null) {
      continue;
    }
    if (parts.length > 0) {
      const isContinued =
        CONTINUED_TYPES.has(block.type) && block.type === prevType;
      parts.push(isContinued ? '\n' : '\n\n');
    }
    parts.push(md);
    prevType = block.type;
  }
  return parts.join('');
}

// YAML のプレーンスカラーとして安全でない場合のみシングルクォートで囲む
function yamlScalar(value: string): string {
  return /^[\p{L}\p{N}]/u.test(value) && !value.includes(': ')
    ? value
    : `'${value.replaceAll("'", "''")}'`;
}

export function buildFrontmatter(props: {
  title: string;
  description: string;
  publishedTime: string;
  modifiedTime?: string;
  tags: string[];
}): string {
  const lines = ['---', `title: ${yamlScalar(props.title)}`];
  if (props.description) {
    lines.push('description: |');
    for (const descLine of props.description.split('\n')) {
      lines.push(descLine === '' ? '' : `  ${descLine}`);
    }
  }
  lines.push(`publishedTime: '${props.publishedTime}'`);
  if (props.modifiedTime) {
    lines.push(`modifiedTime: '${props.modifiedTime}'`);
  }
  if (props.tags.length > 0) {
    lines.push('tags:');
    for (const tag of props.tags) {
      lines.push(`  - ${tag}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}
