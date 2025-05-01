'use client';

export default function Head() {
  // Generate a cache-busting version parameter
  const version = new Date().getTime();

  return (
    <>
      {/* Direct favicon links with cache busting */}
      <link rel="icon" href={`/favicon.ico?v=${version}`} />
      <link rel="shortcut icon" href={`/favicon.ico?v=${version}`} />
      <link rel="icon" type="image/png" sizes="32x32" href={`/favicon-32x32.png?v=${version}`} />
      <link rel="icon" type="image/png" sizes="16x16" href={`/favicon-16x16.png?v=${version}`} />
      <link rel="apple-touch-icon" sizes="180x180" href={`/apple-touch-icon.png?v=${version}`} />

      {/* Force browsers to reload favicon */}
      <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
      <meta http-equiv="Pragma" content="no-cache" />
      <meta http-equiv="Expires" content="0" />
      <meta name="favicon-version" content={version.toString()} />

      {/* Direct meta tags for OG image */}
      <meta property="og:image" content="https://www.georgia-news-japan.online/og-image.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="🇬🇪 ジョージア ニュース" />

      {/* Direct meta tags for Twitter image */}
      <meta name="twitter:image" content="https://www.georgia-news-japan.online/og-image.jpg" />
      <meta name="twitter:card" content="summary_large_image" />
    </>
  );
}
