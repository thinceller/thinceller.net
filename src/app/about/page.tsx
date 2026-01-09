import type { Metadata } from 'next';
import Image from 'next/image';
import type { ProfilePage, WithContext } from 'schema-dts';

import { JsonLd } from '@/components/JsonLd';
import {
  AUTHOR_GITHUB,
  AUTHOR_TWITTER,
  AVATAR_URL,
  BLOG_AUTHOR,
  BLOG_AUTHOR_FULL_NAME,
} from '@/lib/constants';
import AvatarImage from '../../../public/images/avatar.jpg';

export const metadata: Metadata = {
  title: 'About',
};

const jsonLd: WithContext<ProfilePage> = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: {
    '@type': 'Person',
    name: BLOG_AUTHOR,
    alternateName: BLOG_AUTHOR_FULL_NAME,
    description: 'ソフトウェアエンジニア',
    image: AVATAR_URL,
    sameAs: [AUTHOR_TWITTER, AUTHOR_GITHUB],
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="flex flex-col items-stretch space-y-4">
        <h1 className="text-custom-3xl font-bold mt-2">About</h1>
        <div className="flex items-center justify-center">
          <Image
            src={AvatarImage}
            alt="thinceller's avatar"
            width={120}
            height={120}
            className="rounded-[50%]"
            loading="eager"
          />
        </div>
        <p className="text-custom-base">thinceller / Kohei Kawakami</p>
        <p className="text-custom-base">しがないソフトウェアエンジニアです。</p>
      </div>
    </>
  );
}
