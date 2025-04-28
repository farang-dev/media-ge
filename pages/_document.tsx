import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.georgia-news-japan.online/" />
        <meta property="og:title" content="🇬🇪 ジョージア ニュース" />
        <meta property="og:description" content="ジョージアの最近のニュースを日本人の方向けて日本語でお届け" />
        <meta property="og:image" content="https://www.georgia-news-japan.online/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.georgia-news-japan.online/" />
        <meta name="twitter:title" content="🇬🇪 ジョージア ニュース" />
        <meta name="twitter:description" content="ジョージアの最近のニュースを日本人の方向けて日本語でお届け" />
        <meta name="twitter:image" content="https://www.georgia-news-japan.online/og-image.jpg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
