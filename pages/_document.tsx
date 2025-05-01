import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon/favicon-96x96.png" sizes="96x96" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" sizes="180x180" />
        <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#da291c" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#da291c" />
        <meta name="theme-color" content="#ffffff" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.georgia-news-japan.online/" />
        <meta property="og:title" content="🇬🇪 ジョージア ニュース" />
        <meta property="og:description" content="🇬🇪 ジョージア（旧グルジア）の最新ニュース・政治・経済・社会情報を日本語で毎日お届け。信頼性の高いジョージアメディアから厳選した記事を日本語に翻訳してお届けする唯一の日本語ニュースサイト。" />
        <meta property="og:image" content="https://www.georgia-news-japan.online/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.georgia-news-japan.online/" />
        <meta name="twitter:title" content="🇬🇪 ジョージア ニュース" />
        <meta name="twitter:description" content="🇬🇪 ジョージア（旧グルジア）の最新ニュース・政治・経済・社会情報を日本語で毎日お届け。信頼性の高いジョージアメディアから厳選した記事を日本語に翻訳してお届けする唯一の日本語ニュースサイト。" />
        <meta name="twitter:image" content="https://www.georgia-news-japan.online/og-image.jpg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
