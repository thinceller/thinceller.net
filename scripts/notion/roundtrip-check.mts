// Notion API を使わないオフライン検証: MDX → blocks → MDX が元と一致するか
// usage: node scripts/notion/roundtrip-check.mts [_posts/<file>.mdx ...]
import fs from 'node:fs';
import matter from 'gray-matter';
import { blocksToMd, buildFrontmatter, mdToBlocks } from './convert.mts';

const files =
  process.argv.length > 2
    ? process.argv.slice(2)
    : fs.readdirSync('_posts').map((name) => `_posts/${name}`);

let failed = false;
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const body = blocksToMd(mdToBlocks(content.trim()));
  const frontmatter = buildFrontmatter({
    title: data.title,
    description: String(data.description).trim(),
    publishedTime: data.publishedTime,
    modifiedTime: data.modifiedTime,
    tags: (data.tags ?? []) as string[],
  });
  const rebuilt = `${frontmatter}\n\n${body}\n`;
  if (rebuilt === raw) {
    console.log(`OK   ${file}`);
  } else {
    failed = true;
    console.log(`DIFF ${file}`);
    const rawLines = raw.split('\n');
    const rebuiltLines = rebuilt.split('\n');
    const max = Math.max(rawLines.length, rebuiltLines.length);
    for (let i = 0; i < max; i++) {
      if (rawLines[i] !== rebuiltLines[i]) {
        console.log(`  L${i + 1}`);
        console.log(`  - ${rawLines[i] ?? '(none)'}`);
        console.log(`  + ${rebuiltLines[i] ?? '(none)'}`);
      }
    }
  }
}
process.exit(failed ? 1 : 0);
