import { cacheLife } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';

type OgpData = {
  title: string;
  description?: string;
  image?: string;
  favicon?: string;
};

type Props = {
  url: string;
};

async function fetchOgpData(url: string): Promise<OgpData> {
  'use cache';

  // 失敗時に throw すると prerender が失敗するため、フォールバックを短期間だけキャッシュして再取得させる
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; OGPBot/1.0; +https://thinceller.net)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();

    // Decode HTML entities
    const decodeHtmlEntities = (text: string): string => {
      const entities: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
      };
      return text.replace(
        /&(?:amp|lt|gt|quot|#39|apos);/g,
        (match) => entities[match] || match,
      );
    };

    // Parse OGP meta tags
    const getMetaContent = (property: string): string | undefined => {
      const patterns = [
        new RegExp(
          `<meta\\s+property=["']${property}["']\\s+content=["']([^"']+)["']`,
          'i',
        ),
        new RegExp(
          `<meta\\s+content=["']([^"']+)["']\\s+property=["']${property}["']`,
          'i',
        ),
        new RegExp(
          `<meta\\s+name=["']${property}["']\\s+content=["']([^"']+)["']`,
          'i',
        ),
        new RegExp(
          `<meta\\s+content=["']([^"']+)["']\\s+name=["']${property}["']`,
          'i',
        ),
      ];

      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match?.[1]) {
          return decodeHtmlEntities(match[1]);
        }
      }
      return undefined;
    };

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    const title =
      getMetaContent('og:title') ||
      getMetaContent('twitter:title') ||
      (titleMatch ? decodeHtmlEntities(titleMatch) : undefined) ||
      url;

    const description =
      getMetaContent('og:description') ||
      getMetaContent('twitter:description') ||
      getMetaContent('description');

    const urlObj = new URL(url);

    let image = getMetaContent('og:image') || getMetaContent('twitter:image');
    // Convert relative image URLs to absolute URLs
    if (
      image &&
      !image.startsWith('http://') &&
      !image.startsWith('https://')
    ) {
      if (image.startsWith('/')) {
        image = `${urlObj.origin}${image}`;
      } else {
        image = `${urlObj.origin}/${image}`;
      }
    }

    const favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}`;

    cacheLife('days');
    return {
      title,
      description,
      image,
      favicon,
    };
  } catch (error) {
    console.error('Failed to fetch OGP data:', error);
    cacheLife('minutes');
    // Return minimal data on error
    return {
      title: url,
    };
  }
}

export async function OgpCard({ url }: Props) {
  const ogpData = await fetchOgpData(url);
  const urlObj = new URL(url);
  const domain = urlObj.hostname;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block my-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden hover:shadow-md transition-shadow focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className="flex flex-row h-32">
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
              {ogpData.title}
            </h3>
            {ogpData.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
                {ogpData.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {ogpData.favicon && (
              <Image
                src={ogpData.favicon}
                alt=""
                width={16}
                height={16}
                className="shrink-0"
                unoptimized
              />
            )}
            <span className="truncate">{domain}</span>
          </div>
        </div>
        {ogpData.image && (
          <div className="h-32 w-32 sm:w-auto sm:max-w-80 bg-gray-100 dark:bg-gray-700">
            <Image
              src={ogpData.image}
              alt={ogpData.title}
              width={244}
              height={128}
              className="object-cover h-full w-full"
              unoptimized // External images may require unoptimized mode
            />
          </div>
        )}
      </div>
    </Link>
  );
}
