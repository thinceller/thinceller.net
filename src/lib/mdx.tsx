import fs from 'node:fs';
import { join } from 'node:path';
import { compile, run } from '@mdx-js/mdx';
import rehypeShikiFromHighlighter, {
  type RehypeShikiCoreOptions,
} from '@shikijs/rehype/core';
import matter from 'gray-matter';
import * as runtime from 'react/jsx-runtime';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCodeTitles from 'rehype-code-titles';
import rehypeSlug from 'rehype-slug';
import * as v from 'valibot';
import { CustomMDXComponents } from '@/components/MDXComponent';
import { type FrontMatter, frontMatterSchema } from './frontmatter';
import type { Heading } from './heading';
import { rehypeExtractHeadings } from './rehype-extract-headings';
import { rehypeMermaid } from './rehype-mermaid';
import { getHighlighter } from './shiki';

type MDXPostData = {
  content: React.ReactElement;
  frontmatter: FrontMatter;
  headings: Heading[];
};

const ANCHOR_LINK_SVG_PATH =
  'M172.5 131.1C228.1 75.51 320.5 75.51 376.1 131.1C426.1 181.1 433.5 260.8 392.4 318.3L391.3 319.9C381 334.2 361 337.6 346.7 327.3C332.3 317 328.9 297 339.2 282.7L340.3 281.1C363.2 249 359.6 205.1 331.7 177.2C300.3 145.8 249.2 145.8 217.7 177.2L105.5 289.5C73.99 320.1 73.99 372 105.5 403.5C133.3 431.4 177.3 435 209.3 412.1L210.9 410.1C225.3 400.7 245.3 404 255.5 418.4C265.8 432.8 262.5 452.8 248.1 463.1L246.5 464.2C188.1 505.3 110.2 498.7 60.21 448.8C3.741 392.3 3.741 300.7 60.21 244.3L172.5 131.1zM467.5 380C411 436.5 319.5 436.5 263 380C213 330 206.5 251.2 247.6 193.7L248.7 192.1C258.1 177.8 278.1 174.4 293.3 184.7C307.7 194.1 311.1 214.1 300.8 229.3L299.7 230.9C276.8 262.1 280.4 306.9 308.3 334.8C339.7 366.2 390.8 366.2 422.3 334.8L534.5 222.5C566 191 566 139.1 534.5 108.5C506.7 80.63 462.7 76.99 430.7 99.9L429.1 101C414.7 111.3 394.7 107.1 384.5 93.58C374.2 79.2 377.5 59.21 391.9 48.94L393.5 47.82C451 6.731 529.8 13.25 579.8 63.24C636.3 119.7 636.3 211.3 579.8 267.7L467.5 380z';

export async function getPostBySlug(slug: string): Promise<MDXPostData> {
  const fileContent = fs.readFileSync(
    join(process.cwd(), '_posts', `${slug}.mdx`),
    'utf8',
  );

  const { content: mdxContent, data: rawFrontmatter } = matter(fileContent);

  const vfile = await compile(mdxContent, {
    outputFormat: 'function-body',
    development: process.env.NODE_ENV === 'development',
    rehypePlugins: [
      rehypeCodeTitles,
      rehypeMermaid,
      [
        rehypeShikiFromHighlighter,
        await getHighlighter(),
        {
          theme: 'night-owl',
          transformers: [
            {
              pre(node) {
                this.addClassToHast(node, [
                  'overflow-x-auto',
                  'rounded-md',
                  'p-4',
                  'mb-6',
                  'border',
                  'border-gray-700',
                  'dark:border-gray-600',
                ]);
              },
            },
          ],
        } satisfies RehypeShikiCoreOptions,
      ],
      rehypeSlug,
      rehypeExtractHeadings,
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: 'header-anchor-link',
          },
          content: {
            type: 'element',
            tagName: 'svg',
            properties: {
              xmlns: 'http://www.w3.org/2000/svg',
              viewBox: '0 0 640 512',
              width: '16',
              height: '16',
            },
            children: [
              {
                type: 'element',
                tagName: 'path',
                properties: { d: ANCHOR_LINK_SVG_PATH },
              },
            ],
          },
        },
      ],
    ],
  });

  const mdxModule = await run(vfile, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  const { default: MDXContent } = mdxModule;
  const content = <MDXContent components={CustomMDXComponents} />;
  const frontmatter = v.parse(frontMatterSchema, rawFrontmatter);
  const headings = Array.isArray(vfile.data.headings)
    ? (vfile.data.headings as Heading[])
    : [];

  return { content, frontmatter, headings };
}
