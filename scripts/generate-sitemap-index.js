// Generate a sitemap index file
require('dotenv').config();
const fs = require('fs');

// Site URL
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.georgia-news-japan.online';

function generateSitemapIndex() {
  console.log('Generating sitemap index...');
  
  // Ensure we don't have trailing slash issues
  const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  const currentDate = new Date().toISOString();
  
  // Create sitemap index XML
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-news.xml</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>
</sitemapindex>`;

  // Save sitemap index to file
  fs.writeFileSync('public/sitemap-index.xml', sitemapIndex);
  console.log('Sitemap index generated successfully: public/sitemap-index.xml');
  
  // Create a news-specific sitemap (this will help with Google News indexing)
  generateNewsSitemap();
}

async function generateNewsSitemap() {
  console.log('Generating news sitemap...');
  
  // Ensure we don't have trailing slash issues
  const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  
  // Get the main sitemap content
  const mainSitemap = fs.readFileSync('public/sitemap.xml', 'utf8');
  
  // Extract all news entries
  const newsEntries = mainSitemap.match(/<news:news>[\s\S]*?<\/news:news>/g) || [];
  
  // Create news sitemap XML
  let newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;
  
  // Extract URLs with news tags
  const urlRegex = /<url>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<news:news>[\s\S]*?<\/news:news>[\s\S]*?<\/url>/g;
  let match;
  
  while ((match = urlRegex.exec(mainSitemap)) !== null) {
    const url = match[1];
    const fullUrlEntry = match[0];
    newsSitemap += '\n' + fullUrlEntry;
  }
  
  newsSitemap += '\n</urlset>';
  
  // Save news sitemap to file
  fs.writeFileSync('public/sitemap-news.xml', newsSitemap);
  console.log('News sitemap generated successfully: public/sitemap-news.xml');
}

// Run the generator
generateSitemapIndex();
