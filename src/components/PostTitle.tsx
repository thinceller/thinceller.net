import type { FC } from 'react';
import { formatDate } from '../lib/date';
import { PostTags } from './PostTags';

type Props = {
  title: string;
  publishedTime: string;
  tags?: string[] | null;
};

export const PostTitle: FC<Props> = ({ title, publishedTime, tags }) => {
  return (
    <>
      <h1 className="my-4 text-custom-3xl font-bold text-center [word-break:auto-phrase]">
        {title}
      </h1>
      <p className="text-center">{formatDate(publishedTime)} 公開</p>
      <PostTags tags={tags} />
    </>
  );
};
