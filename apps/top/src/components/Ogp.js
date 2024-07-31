import Head from 'next/head'

import {
  blogTitle,
  blogRootUrl,
  blogDescription,
  twitterCard,
  twitterAccount,
  facebookAppID
} from '../config/blog'

export const Ogp = () => {
  return (
    <Head>
      <meta property="og:title" content={blogTitle} />
      <meta property="og:description" content={blogDescription} />
      <meta property="og:url" content={blogRootUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={blogTitle} />
      <meta property="fb:app_id" content={facebookAppID} />
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={`@${twitterAccount}`} />
    </Head>
  )
}
