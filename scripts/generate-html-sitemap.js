// Generate an HTML sitemap for users and search engines
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

// WordPress.com API URL
const WP_API_URL = process.env.WORDPRESS_API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.georgia-news-japan.online';

async function generateHtmlSitemap() {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return;
  }

  console.log('Generating HTML sitemap...');
  try {
    // Get all published posts
    const posts = await getAllPosts();

    if (!posts || posts.length === 0) {
      console.error('No posts found');
      return;
    }

    console.log(`Found ${posts.length} posts`);

    // Generate HTML sitemap
    const htmlSitemap = generateHtmlSitemapContent(posts);

    // Save HTML sitemap to file in the public directory
    fs.writeFileSync('public/sitemap.html', htmlSitemap);
    console.log('HTML sitemap generated successfully: public/sitemap.html');
  } catch (error) {
    console.error('Error generating HTML sitemap:', error);
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

function generateHtmlSitemapContent(posts) {
  // Ensure we don't have trailing slash issues
  const baseUrl = SITE_URL.endsWith('/') ? SITE_URL.slice(0, -1) : SITE_URL;
  
  // Group posts by year and month
  const postsByDate = {};
  
  posts.forEach(post => {
    const date = new Date(post.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    if (!postsByDate[year]) {
      postsByDate[year] = {};
    }
    
    if (!postsByDate[year][month]) {
      postsByDate[year][month] = [];
    }
    
    // Convert WordPress.com URL to georgia-news-japan.online URL
    const wpUrl = new URL(post.link);
    const slug = wpUrl.pathname.split('/').filter(Boolean).pop();
    const postUrl = `${baseUrl}/post/${slug}`;
    
    postsByDate[year][month].push({
      title: post.title.rendered,
      url: postUrl,
      date: date
    });
  });
  
  // Sort years and months in descending order
  const years = Object.keys(postsByDate).sort((a, b) => b - a);
  
  // Generate HTML content
  let html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>サイトマップ - ジョージア🇬🇪ニュース</title>
  <meta name="description" content="ジョージア🇬🇪ニュースのサイトマップ。すべての記事を年月別に整理しています。">
  <link rel="icon" href="/favicon.ico">
  <style>
    body {
      font-family: sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #da291c;
      border-bottom: 2px solid #da291c;
      padding-bottom: 10px;
    }
    h2 {
      margin-top: 30px;
      color: #da291c;
    }
    h3 {
      margin-top: 20px;
      color: #333;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .date {
      color: #666;
      font-size: 0.9em;
    }
    .back-link {
      margin-top: 40px;
      display: block;
    }
  </style>
</head>
<body>
  <h1>サイトマップ - ジョージア🇬🇪ニュース</h1>
  <p>このページでは、ジョージア🇬🇪ニュースのすべての記事を年月別に整理しています。</p>
  
  <h2>メインページ</h2>
  <ul>
    <li><a href="${baseUrl}/">ホームページ</a></li>
  </ul>
  
  <h2>記事一覧</h2>`;
  
  // Add posts by year and month
  years.forEach(year => {
    html += `\n  <h3>${year}年</h3>`;
    
    const months = Object.keys(postsByDate[year]).sort((a, b) => b - a);
    
    months.forEach(month => {
      const monthName = getMonthName(month);
      html += `\n  <h4>${monthName}</h4>\n  <ul>`;
      
      // Sort posts by date (newest first)
      const sortedPosts = postsByDate[year][month].sort((a, b) => b.date - a.date);
      
      sortedPosts.forEach(post => {
        const dateStr = formatDate(post.date);
        html += `\n    <li><a href="${post.url}">${post.title}</a> <span class="date">(${dateStr})</span></li>`;
      });
      
      html += '\n  </ul>';
    });
  });
  
  html += `\n  <a href="${baseUrl}/" class="back-link">← ホームページに戻る</a>
</body>
</html>`;
  
  return html;
}

function getMonthName(month) {
  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  return months[month - 1];
}

function formatDate(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// Run the generator
generateHtmlSitemap();
