import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cacheLife } from 'next/cache';
import { ImageResponse } from 'next/og';

import { SITE_NAME } from '@/lib/constants';

export const alt = SITE_NAME;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const getAvatar = async () => {
  'use cache';
  cacheLife('max');

  const res = await readFile(
    join(process.cwd(), 'public', 'images', 'avatar.jpg'),
  );
  return Uint8Array.from(res).buffer;
};

/**
 * @see {@link https://github.com/yuru7/NOTONOTO}
 */
const getFontBold = async () => {
  'use cache';
  cacheLife('max');

  const res = await readFile(
    join(process.cwd(), 'public', 'fonts', 'NOTONOTO35HS-Bold.ttf'),
  );
  return Uint8Array.from(res).buffer;
};

const getFontRegular = async () => {
  'use cache';
  cacheLife('max');

  const res = await readFile(
    join(process.cwd(), 'public', 'fonts', 'NOTONOTO35HS-Regular.ttf'),
  );
  return Uint8Array.from(res).buffer;
};

export default async function Image() {
  const logoSrc = await getAvatar();

  /* biome-ignore format: ignoring ts error and lint error */
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
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
      {/* @ts-expect-error */}
      <img src={logoSrc} height={140} style={{ borderRadius: '50%' }} />
      <div style={{ fontSize: 32, fontWeight: 400 }}>{SITE_NAME}</div>
    </div>,
    {
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
