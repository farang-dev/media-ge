// Script to notify about sitemap updates
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Site URL
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.georgia-news-japan.online';

async function notifySearchEngines() {
  console.log('Notifying search engines about sitemap updates...');
  
  // Ensure we don't have trailing slash issues
  const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  
  // Define all sitemap URLs
  const sitemaps = [
    `${baseUrl}/sitemap-index.xml`,
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap-news.xml`
  ];
  
  console.log('\nIMPORTANT: Google and Bing have deprecated their sitemap ping endpoints.');
  console.log('To ensure proper indexing, please:');
  console.log('1. Verify that all sitemaps are correctly referenced in robots.txt');
  console.log('2. Submit your sitemaps directly through Google Search Console');
  console.log(`   (${baseUrl}/sitemap-index.xml)`);
  
  try {
    // Only ping Yandex as it still supports the ping endpoint
    for (const sitemapUrl of sitemaps) {
      console.log(`\nPinging Yandex for: ${sitemapUrl}`);
      const yandexResponse = await fetch(`https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
      console.log(`Yandex response: ${yandexResponse.status} ${yandexResponse.statusText}`);
    }
    
    console.log('\nYandex notified about sitemap updates.');
  } catch (error) {
    console.error('Error pinging search engines:', error);
  }
}

// Run the notification function
notifySearchEngines();
