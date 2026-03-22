import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { BLOG_NAME } from '@/lib/constants';
import { getPostBySlug } from '@/lib/post';

export const alt = 'thinceller blog';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const getAvatar = async () => {
  const res = await readFile(
    join(process.cwd(), 'public', 'images', 'avatar.jpg'),
  );
  return Uint8Array.from(res).buffer;
};

/**
 * @see {@link https://github.com/yuru7/NOTONOTO}
 */
const getFontBold = async () => {
  const res = await readFile(
    join(process.cwd(), 'public', 'fonts', 'NOTONOTO35HS-Bold.ttf'),
  );
  return Uint8Array.from(res).buffer;
};

const getFontRegular = async () => {
  const res = await readFile(
    join(process.cwd(), 'public', 'fonts', 'NOTONOTO35HS-Regular.ttf'),
  );
  return Uint8Array.from(res).buffer;
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const logoSrc = await getAvatar();

  /* biome-ignore format: ignoring ts error and lint error */
  return new ImageResponse(
    <div
      style={{
        padding: '80px',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 80,
        alignItems: 'center',
        textAlign: 'center',
        color: '#000',
        backgroundColor: '#fff',
        backgroundImage:
          'radial-gradient(circle at 25px 25px, lightgray 2%, transparent 0%), radial-gradient(circle at 75px 75px, lightgray 2%, transparent 0%)',
        backgroundSize: '100px 100px',
      }}
    >
      <div
        style={{
          width: '100%',
          fontSize: 60,
          fontWeight: 700,
          lineHeight: 1.5,
          textAlign: 'left',
        }}
      >
        {post.title}
      </div>

      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        {/* @ts-expect-error */}
        <img src={logoSrc} height={140} style={{ borderRadius: '50%' }} />

        <div style={{ fontSize: 32, fontWeight: 400 }}>{BLOG_NAME}</div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'NOTONOTO',
          data: await getFontRegular(),
          weight: 400,
          style: 'normal',
        },
        {
          name: 'NOTONOTO',
          data: await getFontBold(),
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );
}
