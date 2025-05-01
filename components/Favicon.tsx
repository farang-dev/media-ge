'use client';

import Head from 'next/head';

// Using Next.js Head component instead of direct DOM manipulation
export default function Favicon() {
  return (
    <Head>
      <link rel="icon" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />
    </Head>
  );
}
