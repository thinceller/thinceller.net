import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="ja">
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href="/icon/apple-touch-icon-180x180.png" />
          <link rel="icon" type="image/png" sizes="192x192" href="/icon/icon-192x192.png" />
          <link rel="manifest" href="/manifest.json" />
          <style>{`body{margin:0;}`}</style>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
