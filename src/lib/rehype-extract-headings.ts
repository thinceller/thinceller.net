import type { Element, Root, Text } from 'hast';
import { visit } from 'unist-util-visit';
import type { Heading } from './heading';

type VFileData = {
  data: Record<string, unknown>;
};

function extractTextContent(node: Element): string {
  let text = '';
  for (const child of node.children) {
    if (child.type === 'text') {
      text += (child as Text).value;
    } else if (child.type === 'element') {
      text += extractTextContent(child as Element);
    }
  }
  return text;
}

export function rehypeExtractHeadings() {
  return (tree: Root, file: VFileData) => {
    const headings: Heading[] = [];

    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'h2' || node.tagName === 'h3') {
        const id = node.properties?.id as string | undefined;
        const text = extractTextContent(node);
        const level = node.tagName === 'h2' ? 2 : 3;

        if (id && text) {
          headings.push({ id, text, level });
        }
      }
    });

    file.data.headings = headings;
  };
}
