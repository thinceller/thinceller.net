import type {
  BlogPosting,
  BreadcrumbList,
  CollectionPage,
  Graph,
  ListItem,
  Person,
  ProfilePage,
  Thing,
  WebPage,
  WebSite,
} from 'schema-dts';

import {
  AUTHOR_GITHUB,
  AUTHOR_TWITTER,
  AVATAR_URL,
  BLOG_AUTHOR,
  BLOG_AUTHOR_FULL_NAME,
  BLOG_URL,
  SITE_NAME,
} from './constants';

export function createWebSiteEntity(): WebSite {
  return {
    '@type': 'WebSite',
    '@id': `${BLOG_URL}/#website`,
    name: SITE_NAME,
    url: BLOG_URL,
    description: 'ソフトウェアエンジニアthincellerの個人サイトです',
    inLanguage: 'ja',
    publisher: { '@id': `${BLOG_URL}/#person` },
  };
}

export function createPersonEntity(): Person {
  return {
    '@type': 'Person',
    '@id': `${BLOG_URL}/#person`,
    name: BLOG_AUTHOR,
    alternateName: BLOG_AUTHOR_FULL_NAME,
    url: `${BLOG_URL}/about`,
    image: AVATAR_URL,
    sameAs: [AUTHOR_TWITTER, AUTHOR_GITHUB],
    description: 'ソフトウェアエンジニア',
  };
}

type WebPageOptions = {
  path: string;
  name: string;
  description: string;
  hasBreadcrumb?: boolean;
};

export function createWebPageEntity(options: WebPageOptions): WebPage {
  const url = `${BLOG_URL}${options.path}`;
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    name: options.name,
    description: options.description,
    url,
    isPartOf: { '@id': `${BLOG_URL}/#website` },
    inLanguage: 'ja',
    ...(options.hasBreadcrumb !== false
      ? { breadcrumb: { '@id': `${url}#breadcrumb` } }
      : {}),
  };
}

export function createCollectionPageEntity(
  options: WebPageOptions,
): CollectionPage {
  const url = `${BLOG_URL}${options.path}`;
  return {
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    name: options.name,
    description: options.description,
    url,
    isPartOf: { '@id': `${BLOG_URL}/#website` },
    inLanguage: 'ja',
    ...(options.hasBreadcrumb !== false
      ? { breadcrumb: { '@id': `${url}#breadcrumb` } }
      : {}),
  };
}

export function createProfilePageEntity(options: WebPageOptions): ProfilePage {
  const url = `${BLOG_URL}${options.path}`;
  return {
    '@type': 'ProfilePage',
    '@id': `${url}#webpage`,
    name: options.name,
    description: options.description,
    url,
    isPartOf: { '@id': `${BLOG_URL}/#website` },
    inLanguage: 'ja',
    mainEntity: { '@id': `${BLOG_URL}/#person` },
    ...(options.hasBreadcrumb !== false
      ? { breadcrumb: { '@id': `${url}#breadcrumb` } }
      : {}),
  };
}

type BreadcrumbItem = {
  name: string;
  url: string;
};

export function createBreadcrumbList(
  path: string,
  items: BreadcrumbItem[],
): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${BLOG_URL}${path}#breadcrumb`,
    itemListElement: items.map(
      (item, index): ListItem => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      }),
    ),
  };
}

type BlogPostingOptions = {
  slug: string;
  title: string;
  description: string;
  publishedTime: string;
  modifiedTime?: string;
  tags?: string[] | null;
  imageUrl: string;
};

export function createBlogPostingEntity(
  options: BlogPostingOptions,
): BlogPosting {
  const url = `${BLOG_URL}/blog/${options.slug}`;
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#blogposting`,
    headline: options.title,
    description: options.description,
    datePublished: options.publishedTime,
    dateModified: options.modifiedTime ?? options.publishedTime,
    author: { '@id': `${BLOG_URL}/#person` },
    publisher: { '@id': `${BLOG_URL}/#person` },
    image: options.imageUrl,
    url,
    keywords: options.tags?.length ? options.tags.join(', ') : undefined,
    mainEntityOfPage: { '@id': `${url}#webpage` },
    isPartOf: { '@id': `${BLOG_URL}/#website` },
    inLanguage: 'ja',
  };
}

export function createGraphJsonLd(entities: Thing[]): Graph {
  return {
    '@context': 'https://schema.org',
    '@graph': entities,
  };
}
