import { generateRSSFeed } from '@/lib/rss';

export async function GET() {
  try {
    const feed = await generateRSSFeed();

    return new Response(feed, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control':
          'max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to generate RSS feed:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
