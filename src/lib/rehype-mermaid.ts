import type { Element, Root, Text } from 'hast';
import { visit } from 'unist-util-visit';

function isMermaidCodeBlock(codeEl: Element): boolean {
  const className = codeEl.properties?.className;
  return Array.isArray(className) && className.includes('language-mermaid');
}

function extractTextContent(node: Element): string {
  return node.children
    .filter((child): child is Text => child.type === 'text')
    .map((child) => child.value)
    .join('');
}

export function rehypeMermaid() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'pre' || !parent || index === undefined) return;

      const codeEl = node.children.find(
        (child): child is Element =>
          child.type === 'element' && child.tagName === 'code',
      );
      if (!codeEl || !isMermaidCodeBlock(codeEl)) return;

      const chart = extractTextContent(codeEl);

      parent.children[index] = {
        type: 'element',
        tagName: 'MermaidDiagram',
        properties: { chart },
        children: [],
      };
    });
  };
}
