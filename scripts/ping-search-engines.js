// Script to ping search engines about sitemap updates
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Site URL
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.georgia-news-japan.online';

async function pingSearchEngines() {
  console.log('Pinging search engines to notify about sitemap update...');
  
  // Ensure we don't have trailing slash issues
  const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  
  try {
    // Ping Google
    console.log('Pinging Google...');
    const googleResponse = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    console.log(`Google response: ${googleResponse.status} ${googleResponse.statusText}`);
    
    // Ping Bing
    console.log('Pinging Bing...');
    const bingResponse = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    console.log(`Bing response: ${bingResponse.status} ${bingResponse.statusText}`);
    
    // Ping Yandex (optional)
    console.log('Pinging Yandex...');
    const yandexResponse = await fetch(`https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    console.log(`Yandex response: ${yandexResponse.status} ${yandexResponse.statusText}`);
    
    console.log('Search engines notified about sitemap update.');
  } catch (error) {
    console.error('Error pinging search engines:', error);
  }
}

// Run the ping function
pingSearchEngines();
