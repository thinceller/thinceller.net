import { generateAtomFeed } from '@/lib/rss';

export async function GET() {
  try {
    const feed = await generateAtomFeed();

    return new Response(feed, {
      headers: {
        'Content-Type': 'application/atom+xml; charset=utf-8',
        'Cache-Control':
          'max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Failed to generate Atom feed:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
