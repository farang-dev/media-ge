export default function Head() {
  return (
    <>
      {/* 直接ファビコンリンクを追加 */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />

      {/* OG画像のメタタグ */}
      <meta property="og:image" content="https://www.georgia-news-japan.online/og-image.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="🇬🇪 ジョージア ニュース" />

      {/* Twitter画像のメタタグ */}
      <meta name="twitter:image" content="https://www.georgia-news-japan.online/og-image.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}
