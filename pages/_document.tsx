import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head>
          {/* Basic favicon - multiple formats for maximum compatibility */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="shortcut icon" href="/favicon.ico" />

          {/* Explicit MIME types */}
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />

          {/* Absolute URL for favicon */}
          <link rel="icon" href="https://www.georgia-news-japan.online/favicon.ico" />

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
}

export default MyDocument;
