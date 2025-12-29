'use client';

import { useEffect, useRef, useState } from 'react';
import type { Heading } from '@/lib/heading';

type Props = {
  headings: Heading[];
};

// ヘッダーの高さ (top-24 = 6rem = 96px)
const HEADER_HEIGHT = 96;

export function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('');
  const headingElementsRef = useRef<Map<string, IntersectionObserverEntry>>(
    new Map(),
  );

  useEffect(() => {
    if (headings.length === 0) return;

    // 初期値を設定
    setActiveId(headings[0].id);

    // 現在のスクロール位置に基づいてアクティブな見出しを計算
    const getActiveHeadingId = (): string => {
      const scrollY = window.scrollY;

      // ページ最上部の場合は最初の見出し
      if (scrollY < HEADER_HEIGHT) {
        return headings[0].id;
      }

      // ページ最下部かどうかをチェック
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const isAtBottom = scrollY + clientHeight >= scrollHeight - 10;

      // 現在のスクロール位置より上にある最後の見出しを探す
      let activeId = headings[0].id;

      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element) {
          const rect = element.getBoundingClientRect();

          // ページ最下部の場合: ビューポート内に表示されている見出しも考慮
          if (isAtBottom && rect.top >= 0 && rect.top < clientHeight) {
            activeId = heading.id;
            continue;
          }

          // 通常のロジック: スクロール位置より上にある見出しを探す
          const absoluteTop = rect.top + scrollY;
          if (absoluteTop <= scrollY + HEADER_HEIGHT) {
            activeId = heading.id;
          } else if (!isAtBottom) {
            break;
          }
        }
      }

      return activeId;
    };

    const callback: IntersectionObserverCallback = () => {
      setActiveId(getActiveHeadingId());
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: `-${HEADER_HEIGHT}px 0px -80% 0px`,
    });

    // 各見出し要素を監視
    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    }

    // ページ最下部のエッジケースに対応するためのスクロールハンドラ
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;

      // ページ最下部付近の場合、アクティブな見出しを再計算
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setActiveId(getActiveHeadingId());
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      headingElementsRef.current.clear();
    };
  }, [headings]);

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
