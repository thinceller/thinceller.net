'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type JSX, type ReactNode, useState } from 'react';

type Props = JSX.IntrinsicElements['a'] & {
  children?: ReactNode;
};

/**
 * Determines if a URL is external (different domain).
 */
function isExternalUrl(href: string): boolean {
  if (!href || href.startsWith('#') || href.startsWith('/')) {
    return false;
  }

  try {
    const url = new URL(href);
    return (
      url.protocol === 'http:' ||
      (url.protocol === 'https:' && url.hostname !== 'thinceller.net')
    );
  } catch {
    return false;
  }
}

/**
 * Extracts the hostname from a URL for favicon fetching.
 */
function getHostname(href: string): string | null {
  try {
    const url = new URL(href);
    return url.hostname;
  } catch {
    return null;
  }
}

/**
 * A link component that displays the target site's favicon for external links.
 * Internal links are rendered without favicon.
 */
export function FaviconLink({ href, children, ...rest }: Props) {
  const [faviconError, setFaviconError] = useState(false);

  const isExternal = href ? isExternalUrl(href) : false;
  const hostname = href && isExternal ? getHostname(href) : null;
  const faviconUrl = hostname
    ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
    : null;

  const linkProps = isExternal
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  return (
    <Link
      className="inline-flex items-baseline gap-1 text-blue-500 dark:text-blue-400 hover:underline"
      href={href ?? '#'}
      {...linkProps}
      {...rest}
    >
      {isExternal && faviconUrl && !faviconError && (
        <Image
          src={faviconUrl}
          alt=""
          width={16}
          height={16}
          className="inline-block shrink-0 align-text-bottom"
          loading="lazy"
          unoptimized
          onError={() => setFaviconError(true)}
        />
      )}
      {children}
    </Link>
  );
}
