import type { MDXComponents } from 'mdx/types';
import Image, { type ImageProps } from 'next/image';
import Link from 'next/link';
import type { JSX } from 'react';
import { Tweet, type TweetProps } from 'react-twitter-widgets';
import { Callout } from '@/components/Callout';
import { FaviconLink } from '@/components/FaviconLink';
import { MermaidDiagram } from '@/components/MermaidDiagram';
import { OgpCard } from '@/components/OgpCard';

function resolveImageHref(src: ImageProps['src']): string {
  if (typeof src === 'string') return src;
  if ('src' in src) return src.src;
  if (src.default) return src.default.src;
  throw new Error('Can not access to href');
}

export const CustomMDXComponents: MDXComponents = {
  a: (props: JSX.IntrinsicElements['a']) => <FaviconLink {...props} />,
  pre: (props: JSX.IntrinsicElements['pre']) => (
    <pre className="overflow-x-auto max-w-full p-4 rounded-md" {...props} />
  ),
  blockquote: (props: JSX.IntrinsicElements['blockquote']) => (
    <blockquote
      className="bg-gray-100 dark:bg-gray-800 border-l-8 border-l-gray-300 dark:border-l-gray-600 border-solid p-4 mb-6 [&>p]:mb-0"
      {...props}
    />
  ),
  hr: () => <hr className="my-10" aria-orientation="horizontal" />,
  h1: (props: JSX.IntrinsicElements['h1']) => (
    <h1 className="relative mt-12 mb-4 font-bold text-custom-2xl" {...props} />
  ),
  h2: (props: JSX.IntrinsicElements['h2']) => (
    <h2
      className="relative mt-12 mb-4 font-bold text-custom-xl border-b border-gray-200 dark:border-gray-700 pb-2"
      {...props}
    />
  ),
  h3: (props: JSX.IntrinsicElements['h3']) => (
    <h3 className="relative mt-8 mb-4 font-bold text-custom-lg" {...props} />
  ),
  h4: (props: JSX.IntrinsicElements['h4']) => (
    <h4 className="relative mb-4 font-bold text-custom-base" {...props} />
  ),
  h5: (props: JSX.IntrinsicElements['h5']) => (
    <h5 className="relative mb-4 font-bold text-custom-sm" {...props} />
  ),
  h6: (props: JSX.IntrinsicElements['h6']) => (
    <h6 className="relative mb-4 font-bold text-custom-xs" {...props} />
  ),
  li: (props: JSX.IntrinsicElements['li']) => (
    <li className="text-custom-base" {...props} />
  ),
  ol: (props: JSX.IntrinsicElements['ol']) => (
    <ol className="mb-6 ml-8" {...props} />
  ),
  p: (props: JSX.IntrinsicElements['p']) => (
    <p className="mb-6 text-custom-base" {...props} />
  ),
  ul: (props: JSX.IntrinsicElements['ul']) => (
    <ul className="mb-6 ml-8 list-disc" {...props} />
  ),
  Tweet: (props: TweetProps) => <Tweet {...props} />,
  Image: (props: ImageProps) => {
    const href = resolveImageHref(props.src);
    return (
      <p className="m-6">
        <Link href={href} title={props.alt}>
          <Image {...props} />
        </Link>
      </p>
    );
  },
  OgpCard,
  Callout,
  MermaidDiagram,
};
