// Sitemap generator for WordPress.com site
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

// WordPress.com API URL
const WP_API_URL = process.env.WORDPRESS_API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.georgia-news-japan.online';

async function generateSitemap() {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return;
  }

  console.log('Generating sitemaps...');
  try {
    // Get all published posts
    const posts = await getAllPosts();

    if (!posts || posts.length === 0) {
      console.error('No posts found');
      return;
    }

    console.log(`Found ${posts.length} posts`);

    // Generate main sitemap XML
    const sitemap = generateSitemapXML(posts);

    // Generate news sitemap XML (only posts from last 2 days)
    const newsSitemap = generateNewsSitemapXML(posts);

    // Generate sitemap index XML
    const sitemapIndex = generateSitemapIndexXML();

    // Save sitemaps to files in the public directory for Next.js to serve them
    fs.writeFileSync('public/sitemap.xml', sitemap);
    fs.writeFileSync('public/sitemap-news.xml', newsSitemap);
    fs.writeFileSync('public/sitemap-index.xml', sitemapIndex);
    
    console.log('Sitemaps generated successfully:');
    console.log('- public/sitemap.xml (Main sitemap)');
    console.log('- public/sitemap-news.xml (Google News sitemap)');
    console.log('- public/sitemap-index.xml (Sitemap index)');

    // Output instructions for submitting to Google
    console.log('\nTo submit your sitemaps to Google:');
    console.log('1. Go to Google Search Console (https://search.google.com/search-console)');
    console.log('2. Add your site if you haven\'t already (https://www.georgia-news-japan.online)');
    console.log('3. Go to Sitemaps section and submit your sitemap index URL');
    console.log(`   (e.g., ${SITE_URL}/sitemap-index.xml)`);
  } catch (error) {
    console.error('Error generating sitemaps:', error);
  }
}

async function getAllPosts(page = 1, allPosts = []) {
  try {
    const response = await fetch(`${WP_API_URL}/posts?per_page=100&page=${page}&status=publish`);

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.statusText}`);
    }

    const posts = await response.json();

    if (posts.length === 0) {
      return allPosts;
    }

    allPosts = [...allPosts, ...posts];

    // Check if there are more pages
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages'), 10);

    if (page < totalPages) {
      return getAllPosts(page + 1, allPosts);
    }

    return allPosts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return allPosts;
  }
}

function generateSitemapXML(posts) {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n' +
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n' +
    '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';

  const footer = '</urlset>';

  let urls = '';

  // Add homepage
  // Ensure we don't have trailing slash issues
  const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  urls += '  <url>\n' +
    `    <loc>${baseUrl}/</loc>\n` +
    '    <changefreq>daily</changefreq>\n' +
    '    <priority>1.0</priority>\n' +
    '  </url>\n';

  // Add each post
  posts.forEach(post => {
    // Convert WordPress.com URL to georgia-news-japan.online URL
    const wpUrl = new URL(post.link);
    const slug = wpUrl.pathname.split('/').filter(Boolean).pop();
    // Ensure we don't have double slashes in the URL
    const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
    const postUrl = `${baseUrl}/post/${slug}`;
    const lastMod = new Date(post.modified).toISOString();

    urls += '  <url>\n' +
      `    <loc>${postUrl}</loc>\n` +
      `    <lastmod>${lastMod}</lastmod>\n` +
      '    <changefreq>monthly</changefreq>\n' +
      '    <priority>0.8</priority>\n' +
      '  </url>\n';
  });

  return header + urls + footer;
}

function generateNewsSitemapXML(posts) {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n' +
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n' +
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n' +
    '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';

  const footer = '</urlset>';

  let urls = '';

  // Filter posts to only include those published within the last 2 days
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const recentPosts = posts.filter(post => {
    const pubDate = new Date(post.date);
    return pubDate > twoDaysAgo;
  });

  console.log(`Found ${recentPosts.length} posts published in the last 2 days for news sitemap`);

  // Add each recent post with news tags
  recentPosts.forEach(post => {
    // Convert WordPress.com URL to georgia-news-japan.online URL
    const wpUrl = new URL(post.link);
    const slug = wpUrl.pathname.split('/').filter(Boolean).pop();
    // Ensure we don't have double slashes in the URL
    const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
    const postUrl = `${baseUrl}/post/${slug}`;
    const pubDate = new Date(post.date);

    urls += '  <url>\n' +
      `    <loc>${postUrl}</loc>\n` +
      '    <news:news>\n' +
      '      <news:publication>\n' +
      '        <news:name>ジョージアニュース</news:name>\n' +
      '        <news:language>ja</news:language>\n' +
      '      </news:publication>\n' +
      `      <news:publication_date>${pubDate.toISOString()}</news:publication_date>\n` +
      `      <news:title>${escapeXML(post.title.rendered)}</news:title>\n` +
      '    </news:news>\n' +
      '  </url>\n';
  });

  return header + urls + footer;
}

function generateSitemapIndexXML() {
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const footer = '</sitemapindex>';

  const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  const now = new Date().toISOString();
  
  let sitemaps = '';
  
  // Add main sitemap
  sitemaps += '  <sitemap>\n' +
    `    <loc>${baseUrl}/sitemap.xml</loc>\n` +
    `    <lastmod>${now}</lastmod>\n` +
    '  </sitemap>\n';
  
  // Add news sitemap
  sitemaps += '  <sitemap>\n' +
    `    <loc>${baseUrl}/sitemap-news.xml</loc>\n` +
    `    <lastmod>${now}</lastmod>\n` +
    '  </sitemap>\n';

  return header + sitemaps + footer;
}

function escapeXML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Run the sitemap generator
generateSitemap();
