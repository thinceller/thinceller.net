'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type JSX, type ReactNode, useState } from 'react';

type Props = JSX.IntrinsicElements['a'] & {
  children?: ReactNode;
};

type ExternalLinkInfo = {
  isExternal: true;
  hostname: string;
};

type InternalLinkInfo = {
  isExternal: false;
  hostname: null;
};

/**
 * Analyzes a URL and returns external link information.
 * Returns hostname for external links, null for internal links.
 */
function analyzeUrl(
  href: string | undefined,
): ExternalLinkInfo | InternalLinkInfo {
  if (!href || href.startsWith('#') || href.startsWith('/')) {
    return { isExternal: false, hostname: null };
  }

  try {
    const url = new URL(href);
    const isExternal =
      url.protocol === 'http:' ||
      (url.protocol === 'https:' && url.hostname !== 'thinceller.net');

    if (isExternal) {
      return { isExternal: true, hostname: url.hostname };
    }
    return { isExternal: false, hostname: null };
  } catch {
    return { isExternal: false, hostname: null };
  }
}

/**
 * A link component that displays the target site's favicon for external links.
 * Internal links are rendered without favicon.
 */
export function FaviconLink({ href, children, ...rest }: Props) {
  const [faviconError, setFaviconError] = useState(false);

  const { isExternal, hostname } = analyzeUrl(href);
  const faviconUrl = hostname
    ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`
    : null;

  const linkProps = isExternal
    ? { target: '_blank' as const, rel: 'noopener noreferrer' }
    : {};

  return (
    <Link
      className="inline text-blue-500 dark:text-blue-400 hover:underline"
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
          className="inline align-baseline mr-1"
          loading="lazy"
          unoptimized
          onError={() => setFaviconError(true)}
        />
      )}
      {children}
    </Link>
  );
}
