import { Client } from '@notionhq/client';

export const DATA_SOURCE_ID =
  process.env.NOTION_DATA_SOURCE_ID ?? 'b8808b96-1d54-42ca-a631-06d7f64bcd2a';

export function createNotionClient(): Client {
  const auth = process.env.NOTION_TOKEN;
  if (!auth) {
    throw new Error('NOTION_TOKEN is not set');
  }
  return new Client({ auth });
}

export interface RichTextItem {
  type: 'text';
  text: { content: string; link?: { url: string } | null };
  annotations?: { bold?: boolean; italic?: boolean; code?: boolean };
  plain_text?: string;
  href?: string | null;
}

// コードフェンスの言語名から Notion の language 値への表示用マッピング。
// 元のフェンス情報文字列は caption に保持されるため、ここは近似で良い。
const FENCE_TO_NOTION: Record<string, string> = {
  txt: 'plain text',
  text: 'plain text',
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  sh: 'shell',
};
const NOTION_LANGUAGES = new Set([
  'bash',
  'css',
  'diff',
  'go',
  'graphql',
  'html',
  'java',
  'javascript',
  'json',
  'markdown',
  'mermaid',
  'nix',
  'plain text',
  'python',
  'ruby',
  'rust',
  'shell',
  'sql',
  'swift',
  'typescript',
  'yaml',
]);

export function fenceLangToNotion(lang: string): string {
  const mapped = FENCE_TO_NOTION[lang] ?? lang;
  return NOTION_LANGUAGES.has(mapped) ? mapped : 'plain text';
}

export function notionLangToFence(lang: string): string {
  return lang === 'plain text' ? 'txt' : lang;
}

// 記事間の相対リンク（例: 2022-01-30-learning-rust）と絶対 URL の相互変換。
// Notion のリンクは絶対 URL 必須のため、投入時に展開し書き出し時に戻す。
const BLOG_URL_PREFIX = 'https://thinceller.net/blog/';
const POST_SLUG = /^\d{4}-\d{2}-\d{2}-[\w-]+$/;

function linkUrlToNotion(url: string): string {
  return POST_SLUG.test(url) ? `${BLOG_URL_PREFIX}${url}` : url;
}

function linkUrlFromNotion(url: string): string {
  const slug = url.startsWith(BLOG_URL_PREFIX)
    ? url.slice(BLOG_URL_PREFIX.length)
    : url;
  return POST_SLUG.test(slug) ? slug : url;
}

const INLINE_PATTERN = /`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

export function inlineMdToRichText(md: string): RichTextItem[] {
  const items: RichTextItem[] = [];
  let lastIndex = 0;
  for (const match of md.matchAll(INLINE_PATTERN)) {
    if (match.index > lastIndex) {
      items.push({
        type: 'text',
        text: { content: md.slice(lastIndex, match.index) },
      });
    }
    const [, code, linkText, linkUrl, bold] = match;
    if (code !== undefined) {
      items.push({
        type: 'text',
        text: { content: code },
        annotations: { code: true },
      });
    } else if (linkText !== undefined) {
      items.push({
        type: 'text',
        text: { content: linkText, link: { url: linkUrlToNotion(linkUrl) } },
      });
    } else {
      items.push({
        type: 'text',
        text: { content: bold },
        annotations: { bold: true },
      });
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < md.length) {
    items.push({ type: 'text', text: { content: md.slice(lastIndex) } });
  }
  return items;
}

export function richTextToInlineMd(richText: RichTextItem[]): string {
  return richText
    .map((item) => {
      let text = item.plain_text ?? item.text.content;
      if (item.annotations?.code) {
        text = `\`${text}\``;
      }
      if (item.annotations?.bold) {
        text = `**${text}**`;
      }
      const url = item.href ?? item.text?.link?.url;
      if (url) {
        text = `[${text}](${linkUrlFromNotion(url)})`;
      }
      return text;
    })
    .join('');
}

export function richTextToPlain(richText: RichTextItem[]): string {
  return richText.map((item) => item.plain_text ?? item.text.content).join('');
}
