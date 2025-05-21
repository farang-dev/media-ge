// Script to submit sitemap to search engines
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Site URL
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.georgia-news-japan.online';

async function submitToSearchEngines() {
  console.log('Submitting sitemap to search engines...');
  
  // Ensure we don't have trailing slash issues
  const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  
  try {
    // Submit to Google
    console.log('Submitting to Google...');
    const googleResponse = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    console.log(`Google response: ${googleResponse.status} ${googleResponse.statusText}`);
    
    // Submit to Bing
    console.log('Submitting to Bing...');
    const bingResponse = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    console.log(`Bing response: ${bingResponse.status} ${bingResponse.statusText}`);
    
    // Submit to Yandex
    console.log('Submitting to Yandex...');
    const yandexResponse = await fetch(`https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    console.log(`Yandex response: ${yandexResponse.status} ${yandexResponse.statusText}`);
    
    console.log('Sitemap submitted to all search engines.');
  } catch (error) {
    console.error('Error submitting sitemap:', error);
  }
}

// Run the submission
submitToSearchEngines();
