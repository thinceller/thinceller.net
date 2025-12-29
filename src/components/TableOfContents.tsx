'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Heading } from '@/lib/heading';

type Props = {
  headings: Heading[];
};

const HEADER_OFFSET = 100;

function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): T {
  let lastCall = 0;
  return ((...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}

export function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('');

  const updateActiveHeading = useCallback(() => {
    const scrollY = window.scrollY;

    // ページ最上部の場合は最初の見出しをactive
    if (scrollY < HEADER_OFFSET) {
      if (headings.length > 0) {
        setActiveId(headings[0].id);
      }
      return;
    }

    // 現在のスクロール位置より上にある最後の見出しを探す
    let currentHeading = headings[0]?.id || '';

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) {
        const top = element.offsetTop;
        if (top <= scrollY + HEADER_OFFSET) {
          currentHeading = heading.id;
        } else {
          break;
        }
      }
    }

    setActiveId(currentHeading);
  }, [headings]);

  useEffect(() => {
    const throttledUpdate = throttle(updateActiveHeading, 100);

    // 初期化
    updateActiveHeading();

    window.addEventListener('scroll', throttledUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledUpdate);
    };
  }, [updateActiveHeading]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav aria-label="目次">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
        目次
      </h2>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? 'ml-4' : ''}>
            <a
              href={`#${heading.id}`}
              className={`block py-1 transition-colors duration-200 ${
                activeId === heading.id
                  ? 'text-blue-500 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
