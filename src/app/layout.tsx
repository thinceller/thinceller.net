import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Layout } from '@/components/Layout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { BLOG_NAME, BLOG_URL, SITE_NAME } from '@/lib/constants';

import '@/styles/globals.css';
import '@/styles/styles.css';

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: 'ソフトウェアエンジニアthincellerの個人サイトです',
  metadataBase: new URL(BLOG_URL),
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: BLOG_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
  },
  twitter: {
    site: '@thinceller_dev',
    creator: '@thinceller_dev',
    card: 'summary_large_image',
  },
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/blog/rss.xml', title: `${BLOG_NAME} RSS Feed` },
      ],
      'application/atom+xml': [
        { url: '/blog/atom.xml', title: `${BLOG_NAME} Atom Feed` },
      ],
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="scroll-smooth" suppressHydrationWarning>
      <body>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: SSRフラッシュ対策のため、ページロード前にテーマを適用する必要がある
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const appliedTheme = theme === 'system' || !theme
                    ? systemTheme
                    : theme;

                  document.documentElement.setAttribute('data-theme', appliedTheme);
                  document.documentElement.style.colorScheme = appliedTheme;
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>
          <Layout>{children}</Layout>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
