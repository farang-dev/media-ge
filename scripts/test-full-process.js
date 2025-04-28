// Complete test script for crawling, rewriting, and posting to WordPress
require('dotenv').config(); // Load environment variables
const cheerio = require('cheerio');
// No longer using puppeteer
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
// We'll import the cleanupArticle function dynamically later
// const { cleanupArticle } = require('../lib/article-processor');

// Import custom modules
const updatedSystemPrompt = require('./updated-system-prompt');
const { cleanupContent } = require('./content-cleanup');

// WordPress credentials from environment variables
const WP_API_URL = process.env.WORDPRESS_API_URL;
const WP_CLIENT_ID = process.env.WORDPRESS_CLIENT_ID;
const WP_CLIENT_SECRET = process.env.WORDPRESS_CLIENT_SECRET;
const WP_USERNAME = process.env.WORDPRESS_USERNAME;
const WP_PASSWORD = process.env.WORDPRESS_PASSWORD;
// Parse comma-separated list of target websites
const TARGET_WEBSITES = (process.env.TARGET_WEBSITE || 'https://civil.ge/ka/archives/category/news-ka').split(',').map(url => url.trim());
const DEFAULT_TARGET_WEBSITE = TARGET_WEBSITES[0];

// Function to check if an article was published within the last 12 hours
function isPublishedWithin12Hours(dateString) {
  if (!dateString) return false;

  // Try to parse the date string
  let publishDate;
  try {
    // Handle ISO date format
    publishDate = new Date(dateString);

    // If invalid date, try other formats
    if (isNaN(publishDate.getTime())) {
      // Try to handle text formats like "5 hours ago", "today", etc.
      const lowerCaseDate = dateString.toLowerCase();

      if (lowerCaseDate.includes('today') ||
          lowerCaseDate.includes('hour ago') ||
          lowerCaseDate.includes('hours ago') ||
          lowerCaseDate.includes('minute ago') ||
          lowerCaseDate.includes('minutes ago')) {
        // For "hours ago", check if it's within 12 hours
        if (lowerCaseDate.includes('hours ago')) {
          const hoursMatch = lowerCaseDate.match(/(\d+)\s+hours\s+ago/);
          if (hoursMatch && hoursMatch[1]) {
            const hours = parseInt(hoursMatch[1], 10);
            return hours <= 12;
          }
        }
        return true; // For "today", "minute(s) ago", and "hour ago" (singular)
      }

      // If we can't determine, default to false
      return false;
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    return false;
  }

  // Check if the date is within the last 12 hours
  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - (12 * 60 * 60 * 1000));
  return publishDate >= twelveHoursAgo;
}

// Add this diagnostic function
async function testWordPressConnection() {
  console.log('Testing WordPress connection...');
  console.log(`API URL: ${WP_API_URL}`);
  console.log(`Username: ${WP_USERNAME}`);

  // Test 1: Try to fetch posts (doesn't require auth)
  try {
    const response = await fetch(`${WP_API_URL}/posts?per_page=1`);
    console.log(`Public API Test: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error('WordPress API not accessible. Check URL and if REST API is enabled.');
      return false;
    }
  } catch (error) {
    console.error('Cannot connect to WordPress API:', error.message);
    return false;
  }

  // Test 2: Try authenticated request
  try {
    const apiKey = process.env.WORDPRESS_API_KEY;
    // Try both with and without spaces
    const apiKeyNoSpaces = apiKey.replace(/\s+/g, '');

    console.log('Testing with spaces in API key...');
    const basicAuth = Buffer.from(`${WP_USERNAME}:${apiKey}`).toString('base64');

    const authResponse = await fetch(`${WP_API_URL}/users/me`, {
      headers: {
        'Authorization': `Basic ${basicAuth}`
      }
    });

    console.log(`Auth Test (with spaces): ${authResponse.status} ${authResponse.statusText}`);

    if (authResponse.ok) {
      const userData = await authResponse.json();
      console.log(`Authenticated as: ${userData.name}`);
      return true;
    }

    // Try without spaces if first attempt failed
    console.log('Testing without spaces in API key...');
    const basicAuthNoSpaces = Buffer.from(`${WP_USERNAME}:${apiKeyNoSpaces}`).toString('base64');

    const authResponseNoSpaces = await fetch(`${WP_API_URL}/users/me`, {
      headers: {
        'Authorization': `Basic ${basicAuthNoSpaces}`
      }
    });

    console.log(`Auth Test (no spaces): ${authResponseNoSpaces.status} ${authResponseNoSpaces.statusText}`);

    if (authResponseNoSpaces.ok) {
      const userData = await authResponseNoSpaces.json();
      console.log(`Authenticated as: ${userData.name}`);
      return true;
    }

    console.error('Authentication failed with both formats. Check credentials.');
    return false;
  } catch (error) {
    console.error('Error testing authentication:', error.message);
    return false;
  }
}

// 1. Crawl website to find articles
async function crawlWebsite(url) {
  console.log(`Crawling website: ${url}`);
  try {
    // Extract the source domain from the URL
    let source = '';
    try {
      const urlObj = new URL(url);
      source = urlObj.hostname.replace('www.', '');
    } catch (error) {
      console.error(`Error extracting source from URL ${url}:`, error);
      source = 'civil.ge'; // Default source
    }

    // Use a direct HTTP request with appropriate headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    fs.writeFileSync('raw-html.txt', html);
    console.log('Raw HTML saved to raw-html.txt');

    // Parse HTML with cheerio
    const $ = cheerio.load(html);
    const articleUrls = [];

    // Determine which website we're crawling and use appropriate selectors
    if (url.includes('civil.ge')) {
      // Look for article links with the specific pattern for civil.ge
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.includes('civil.ge/ka/archives/') && !href.includes('/category/') && !href.includes('/author/')) {
          articleUrls.push(href);
        }
      });
    } else if (url.includes('interpressnews.ge')) {
      // Look for article links with the specific pattern for interpressnews.ge
      // The article links are in a specific format with titles as text content
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        const title = $(element).text().trim();

        // Check if this is an article link (contains /ka/article/ in the path)
        if (href &&
            (href.includes('/ka/article/') ||
             href.startsWith('/ka/article/')) &&
            title &&
            title.length > 10 &&
            !href.includes('/category/')) {

          // Make sure the URL is absolute
          const fullUrl = href.startsWith('http') ? href : `https://www.interpressnews.ge${href.startsWith('/') ? '' : '/'}${href}`;

          // Store both the URL and title
          articleUrls.push(fullUrl);

          // Log for debugging
          console.log(`Found interpressnews.ge article: ${title} - ${fullUrl}`);
        }
      });
    } else {
      // Generic approach for other websites
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.includes(source) && !href.includes('/category/') && !href.includes('/author/')) {
          // Make sure the URL is absolute
          const fullUrl = href.startsWith('http') ? href : `https://${source}${href.startsWith('/') ? '' : '/'}${href}`;
          articleUrls.push(fullUrl);
        }
      });
    }

    // Remove duplicates
    const uniqueUrls = [...new Set(articleUrls)];
    console.log(`Found ${uniqueUrls.length} unique article URLs`);

    if (uniqueUrls.length === 0) {
      console.log('No articles found, returning test article for pipeline testing');
      return [{
        title: "Test Article from " + url,
        url: url,
        publishedDate: new Date().toISOString(),
        source: source
      }];
    }

    // Process the first 5 articles
    const articles = [];
    for (let i = 0; i < Math.min(5, uniqueUrls.length); i++) {
      const articleUrl = uniqueUrls[i];
      console.log(`Getting title for article: ${articleUrl}`);

      try {
        const articleResponse = await fetch(articleUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Cache-Control': 'no-cache'
          }
        });

        if (!articleResponse.ok) {
          console.log(`Failed to fetch article: ${articleResponse.status} ${articleResponse.statusText}`);
          continue;
        }

        const articleHtml = await articleResponse.text();
        const $article = cheerio.load(articleHtml);

        // Extract title - different websites might have different selectors
        let title = '';

        // Try different approaches for title extraction based on the website
        if (articleUrl.includes('interpressnews.ge')) {
          // For interpressnews.ge, the title is in a specific format

          // First try to get the title from the page's h1
          const h1Title = $article('h1').first().text().trim();
          if (h1Title && h1Title.length > 10) {
            title = h1Title;
          } else {
            // Try to get it from the meta title
            const metaTitle = $article('meta[property="og:title"]').attr('content') ||
                             $article('title').text().trim();
            if (metaTitle && metaTitle.length > 10) {
              title = metaTitle;
            } else {
              // Try to find the link that matches the current URL pattern
              $article('a').each((_, element) => {
                const href = $article(element).attr('href');
                if (href &&
                    (href.includes('/ka/article/') || articleUrl.includes(href)) &&
                    !href.includes('/category/')) {
                  const linkText = $article(element).text().trim();
                  if (linkText && linkText.length > 10) {
                    title = linkText;
                    return false; // Break the loop
                  }
                }
              });
            }
          }
        } else {
          // Default title extraction for other websites
          const titleSelectors = ['h1', '.article-title', '.entry-title', '.post-title', '.title'];
          for (const selector of titleSelectors) {
            const titleElement = $article(selector).first();
            if (titleElement.length > 0) {
              title = titleElement.text().trim();
              break;
            }
          }
        }

        console.log(`Title: ${title}`);

        if (title) {
          // Extract the source from the article URL, not the website URL
          let articleSource = '';
          try {
            const articleUrlObj = new URL(articleUrl);
            articleSource = articleUrlObj.hostname.replace('www.', '');
          } catch (error) {
            console.error(`Error extracting source from article URL ${articleUrl}:`, error);
            articleSource = source; // Fallback to the website source
          }

          articles.push({
            title,
            url: articleUrl,
            publishedDate: new Date().toISOString(),
            source: articleSource
          });
          console.log(`Added article: ${title} (Source: ${articleSource})`);
        }
      } catch (error) {
        console.error(`Error getting title for ${articleUrl}:`, error);
      }

      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (articles.length > 0) {
      return articles;
    }

    // Last resort fallback
    return [{
      title: "Test Article from " + url,
      url: url,
      publishedDate: new Date().toISOString(),
      source: source
    }];
  } catch (error) {
    console.error('Error crawling website:', error);

    // Extract the source domain from the URL
    let source = '';
    try {
      const urlObj = new URL(url);
      source = urlObj.hostname.replace('www.', '');
    } catch (error) {
      console.error(`Error extracting source from URL ${url}:`, error);
      source = 'civil.ge'; // Default source
    }

    return [{
      title: "Test Article from " + url,
      url: url,
      publishedDate: new Date().toISOString(),
      source: source
    }];
  }
}

// Alternative crawling approach
async function crawlAlternative(url) {
  try {
    console.log('Using alternative crawling approach...');

    // Extract the source domain from the URL
    let source = '';
    try {
      const urlObj = new URL(url);
      source = urlObj.hostname.replace('www.', '');
    } catch (error) {
      console.error(`Error extracting source from URL ${url}:`, error);
      source = 'civil.ge'; // Default source
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const articles = [];

    // Determine which website we're crawling and use appropriate selectors
    if (url.includes('civil.ge')) {
      // Look for all links with civil.ge pattern
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        const title = $(element).text().trim();

        if (href &&
            href.includes('civil.ge/ka/archives/') &&
            title &&
            title.length > 5 &&
            !href.includes('/category/') &&
            !href.includes('/author/') &&
            !articles.some(a => a.url === href)) {

          // Extract the source from the article URL
          let articleSource = '';
          try {
            const articleUrlObj = new URL(href);
            articleSource = articleUrlObj.hostname.replace('www.', '');
          } catch (error) {
            console.error(`Error extracting source from article URL ${href}:`, error);
            articleSource = source; // Fallback to the website source
          }

          articles.push({
            title,
            url: href,
            publishedDate: new Date().toISOString(),
            source: articleSource
          });
        }
      });
    } else if (url.includes('interpressnews.ge')) {
      // Look for all links with interpressnews.ge pattern
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        const title = $(element).text().trim();

        if (href &&
            (href.includes('interpressnews.ge/ka/article/') || href.startsWith('/ka/article/')) &&
            title &&
            title.length > 5 &&
            !href.includes('/category/') &&
            !href.includes('/author/') &&
            !articles.some(a => a.url === href)) {

          // Make sure the URL is absolute
          const fullUrl = href.startsWith('http') ? href : `https://www.interpressnews.ge${href.startsWith('/') ? '' : '/'}${href}`;

          // Extract the source from the article URL
          let articleSource = '';
          try {
            const articleUrlObj = new URL(fullUrl);
            articleSource = articleUrlObj.hostname.replace('www.', '');
          } catch (error) {
            console.error(`Error extracting source from article URL ${fullUrl}:`, error);
            articleSource = source; // Fallback to the website source
          }

          articles.push({
            title,
            url: fullUrl,
            publishedDate: new Date().toISOString(),
            source: articleSource
          });
        }
      });
    } else {
      // Generic approach for other websites
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        const title = $(element).text().trim();

        if (href &&
            title &&
            title.length > 5 &&
            !href.includes('/category/') &&
            !href.includes('/author/') &&
            !articles.some(a => a.url === href)) {

          // Make sure the URL is absolute
          let fullUrl = href;
          if (!href.startsWith('http')) {
            fullUrl = href.startsWith('/')
              ? `https://${source}${href}`
              : `https://${source}/${href}`;
          }

          // Extract the source from the article URL
          let articleSource = '';
          try {
            const articleUrlObj = new URL(fullUrl);
            articleSource = articleUrlObj.hostname.replace('www.', '');
          } catch (error) {
            console.error(`Error extracting source from article URL ${fullUrl}:`, error);
            articleSource = source; // Fallback to the website source
          }

          articles.push({
            title,
            url: fullUrl,
            publishedDate: new Date().toISOString(),
            source: articleSource
          });
        }
      });
    }

    console.log(`Found ${articles.length} articles with alternative approach`);
    return articles.slice(0, 5);
  } catch (error) {
    console.error('Error in alternative crawling:', error);
    return [];
  }
}

// 2. Crawl article content
async function crawlArticleContent(url) {
  console.log(`Crawling article content: ${url}`);
  try {
    // Determine which website we're crawling
    const isInterpressnews = url.includes('interpressnews.ge');
    const isCivilGe = url.includes('civil.ge');

    // Extract the source from the URL
    let source = '';
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('interpressnews.ge')) {
        source = 'interpressnews.ge';
      } else if (urlObj.hostname.includes('civil.ge')) {
        source = 'civil.ge';
      } else if (urlObj.hostname.includes('police.ge')) {
        source = 'police.ge';
      } else if (urlObj.hostname.includes('facebook.com')) {
        source = 'facebook.com';
      } else {
        source = urlObj.hostname.replace('www.', '');
      }
    } catch (error) {
      console.error(`Error extracting source from URL ${url}:`, error);
      source = 'civil.ge'; // Default source
    }

    console.log(`Source determined from URL: ${source}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch article: ${response.status} ${response.statusText}`);

      // Add retry logic for Gateway Timeout errors
      if (response.status === 504) {
        console.log('Gateway Timeout error. Retrying after 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Try again with a longer timeout
        try {
          const retryResponse = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Cache-Control': 'no-cache'
            },
            timeout: 10000 // Longer timeout
          });

          if (retryResponse.ok) {
            console.log('Retry successful!');
            const html = await retryResponse.text();
            const $ = cheerio.load(html);
            // Continue with the original logic...
            // But we need to duplicate the content extraction code here

            // Extract content with site-specific selectors
            let content = '';

            // Use different selectors based on the website
            let selectors = [];

            if (isInterpressnews) {
              selectors = [
                // Try to get the main content area
                'body > div > div > div',
                // Fallback selectors
                'body > div',
                '.article-text',
                '.article-body',
                '.news-text',
                '.news-body',
                '.content-text',
                '.article-content',
                '#article-body'
              ];
            } else if (isCivilGe) {
              selectors = [
                '.entry-content',
                '.post-content',
                '.content',
                'article .content'
              ];
            } else {
              // Generic selectors for other websites
              selectors = [
                '.entry-content',
                '.post-content',
                '.content',
                'article .content',
                '.article-body',
                '.article-text',
                'article',
                '.news-text',
                '.news-body',
                '.content-text',
                '.article-content',
                '#article-body'
              ];
            }

            for (const selector of selectors) {
              if ($(selector).length > 0) {
                content = $(selector).html();
                break;
              }
            }

            // Extract the publication date
            let publishDate = null;

            // Use different date selectors based on the website
            let dateSelectors = [];

            if (isInterpressnews) {
              dateSelectors = [
                '.article-date',
                '.news-date',
                '.date',
                'time',
                '.article-info time',
                '.article-time'
              ];
            } else if (isCivilGe) {
              dateSelectors = [
                'time',
                '.article__date',
                '.article-date',
                '.post-date',
                '[datetime]'
              ];
            } else {
              // Generic date selectors for other websites
              dateSelectors = [
                'time',
                '.article__date',
                '.article-date',
                '.post-date',
                '[datetime]',
                '.byline time',
                '.date',
                '.news-date',
                '.article-info time',
                '.article-time'
              ];
            }

            for (const selector of dateSelectors) {
              if ($(selector).length > 0) {
                const dateElement = $(selector).first();
                publishDate = dateElement.attr('datetime') || dateElement.text().trim();
                break;
              }
            }

            if (!content) {
              console.log('No content found on the page after retry');
              return { content: null, publishDate: null, source: null };
            }

            return { content, publishDate, source };
          }
        } catch (retryError) {
          console.error('Error during retry:', retryError);
        }
      }

      return { content: null, publishDate: null, source: null };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract content with site-specific selectors
    let content = '';

    // Use different selectors based on the website
    let selectors = [];

    if (isInterpressnews) {
      // For interpressnews.ge, the article content is directly in the body after the title and date
      // The content is not wrapped in a specific container, so we need to be more specific
      selectors = [
        // Try to get the main content area
        'body > div > div > div',
        // Fallback selectors
        'body > div',
        '.article-text',
        '.article-body',
        '.news-text',
        '.news-body',
        '.content-text',
        '.article-content',
        '#article-body'
      ];
    } else if (isCivilGe) {
      selectors = [
        '.entry-content',
        '.post-content',
        '.content',
        'article .content'
      ];
    } else {
      // Generic selectors for other websites
      selectors = [
        '.entry-content',
        '.post-content',
        '.content',
        'article .content',
        '.article-body',
        '.article-text',
        'article',
        '.news-text',
        '.news-body',
        '.content-text',
        '.article-content',
        '#article-body'
      ];
    }

    for (const selector of selectors) {
      if ($(selector).length > 0) {
        content = $(selector).html();
        break;
      }
    }

    // Fallback: try to find paragraphs within the main content area
    if (!content) {
      if (isInterpressnews) {
        // For interpressnews.ge, try to extract paragraphs directly after the title
        // The content is usually in the first few paragraphs after the date
        const paragraphs = [];

        // Look for text nodes that might be the article content
        $('body').find('*').contents().each((_, node) => {
          if (node.type === 'text' && node.data.trim().length > 20) {
            // This might be a paragraph of content
            paragraphs.push(`<p>${node.data.trim()}</p>`);
          }
        });

        // Also try to find actual paragraph elements
        $('p').each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > 20) {
            paragraphs.push($.html(el));
          }
        });

        if (paragraphs.length > 0) {
          content = paragraphs.join('');
        }
      } else {
        // Generic approach for other websites
        const paragraphs = $('article p, main p, .content p, .article-text p, .news-text p');
        if (paragraphs.length > 0) {
          content = paragraphs.map((_, el) => $.html(el)).get().join('');
        }
      }
    }

    // Extract the publication date
    let publishDate = null;

    // Use different date selectors based on the website
    let dateSelectors = [];

    if (isInterpressnews) {
      dateSelectors = [
        '.article-date',
        '.news-date',
        '.date',
        'time',
        '.article-info time',
        '.article-time'
      ];
    } else if (isCivilGe) {
      dateSelectors = [
        'time',
        '.article__date',
        '.article-date',
        '.post-date',
        '[datetime]'
      ];
    } else {
      // Generic date selectors for other websites
      dateSelectors = [
        'time',
        '.article__date',
        '.article-date',
        '.post-date',
        '[datetime]',
        '.byline time',
        '.date',
        '.news-date',
        '.article-info time',
        '.article-time'
      ];
    }

    for (const selector of dateSelectors) {
      if ($(selector).length > 0) {
        const dateElement = $(selector).first();
        publishDate = dateElement.attr('datetime') || dateElement.text().trim();
        break;
      }
    }

    if (!content) {
      console.log('No content found on the page');
      return { content: null, publishDate: null, source: null };
    }

    return { content, publishDate, source };
  } catch (error) {
    console.error('Error crawling article content:', error);
    return { content: null, publishDate: null, source: null };
  }
}

// 3. Rewrite article using OpenRouter API with SEO optimization
async function rewriteArticle(article) {
  // Add more debugging for the OpenRouter API key
  console.log('Environment variables:');
  console.log('OPENROUTER_API_KEY exists:', !!process.env.OPENROUTER_API_KEY);
  if (process.env.OPENROUTER_API_KEY) {
    console.log('OPENROUTER_API_KEY length:', process.env.OPENROUTER_API_KEY.length);
    console.log('OPENROUTER_API_KEY first 3 chars:', process.env.OPENROUTER_API_KEY.substring(0, 3));
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API key not configured');
    console.error('Please set OPENROUTER_API_KEY in your .env file');
    console.error('You can get an API key from https://openrouter.ai/keys');
    return null; // Return null to indicate failure
  }

  console.log(`Rewriting article: ${article.title}`);
  try {
    // First, generate SEO-optimized title and meta description
    console.log('Generating SEO metadata...');
    const seoResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://media-ge.vercel.app/',
        'X-Title': 'Georgia News'
      },
      body: JSON.stringify({
        model: 'microsoft/mai-ds-r1:free',
        messages: [
          {
            role: 'system',
            content: 'あなたは「ジョージアニュース」のSEO専門家です。ジョージアのニュース記事に対して、日本語のSEO最適化されたタイトルとメタ説明を作成してください。タイトルは注目を引くもので、関連キーワードを含み、60文字以内にしてください。メタ説明は記事を要約し、キーワードを含み、155文字以内にしてください。\n\n重要：絵文字や特殊文字（#など）は使用しないでください。\n\n応答形式は必ず次のようにしてください：\nTITLE: [あなたのSEOタイトル]\nMETA: [あなたのメタ説明]'
          },
          {
            role: 'user',
            content: `このジョージア語の記事に対して、日本語のSEO最適化されたタイトルとメタ説明を作成してください：\n\n原文タイトル： ${article.title}\n\n内容： ${article.content.substring(0, 1500)}...`
          }
        ]
      })
    });

    if (!seoResponse.ok) {
      const errorText = await seoResponse.text();
      console.error(`OpenRouter API error status: ${seoResponse.status} ${seoResponse.statusText}`);
      console.error(`OpenRouter API error details: ${errorText}`);
      throw new Error(`OpenRouter API error: ${seoResponse.statusText}`);
    }

    const seoData = await seoResponse.json();
    console.log('SEO API response:', JSON.stringify(seoData, null, 2));

    if (!seoData.choices || !seoData.choices[0] || !seoData.choices[0].message || !seoData.choices[0].message.content) {
      throw new Error('Invalid response format from SEO API');
    }

    const seoText = seoData.choices[0].message.content;

    // Extract SEO title and meta description
    let seoTitle = article.title;
    let seoMetaDescription = '';

    const titleMatch = seoText.match(/TITLE:\s*(.+)/);
    if (titleMatch && titleMatch[1]) {
      seoTitle = titleMatch[1].trim();
    }

    const metaMatch = seoText.match(/META:\s*(.+)/);
    if (metaMatch && metaMatch[1]) {
      seoMetaDescription = metaMatch[1].trim();
    }

    console.log(`SEO Title: ${seoTitle}`);
    console.log(`SEO Meta Description: ${seoMetaDescription}`);

    // Now rewrite the article with SEO optimization
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://media-ge.vercel.app/',
        'X-Title': 'Georgia News'
      },
      body: JSON.stringify({
        model: 'microsoft/mai-ds-r1:free',
        messages: [
          {
            role: 'system',
            content: 'あなたは「ジョージア🇬🇪ニュース」のための翻訳者です。ジョージア語の記事を日本語に翻訳し、日本人読者向けに最適化します。以下のガイドラインに従ってください：\n\n1. 提供されたSEOタイトルを使用する\n2. 日本語として自然で読みやすい文章にする\n3. 適切な見出し構造を使用し、H2とH3タグでサブトピックを整理する\n4. 重要な用語には<strong>などのセマンティックHTMLを使用する\n5. エクスクラメーションマーク！が含まれている場合は、！を使わないでください。短い段落で読みやすく魅力的なコンテンツを作成する\n6. 強力な導入部と結論を含める\n7. ジョージアの地名や人名は初出時にカタカナと原語（ラテン文字）の両方を記載する\n8. 日本人読者にとって馴染みのない概念や文化的背景には簡潔な説明を加える\n\n重要な書式ルール：\n\n1. 応答は最初の行にSEOタイトルから始め、空白行を挟んでから本文を続ける\n2. 適切な構造と強調のために<h2>、<h3>、<strong>、<em>などのHTMLタグを使用する\n3. 以下のセクションは出力に含めないでください：\n   - 「トピック」や「人気記事」セクション\n   - 「関連記事」や「もっと読む」セクション\n   - 「著者について」セクション\n   - 著者の経歴やサイン\n   - 「AI編集者」のサイン\n   - コンテンツの冒頭にある「投稿：」マーカー\n   - サブスクリプション情報セクション\n   - 「メールを送信することにより」という免責事項\n   - ニュースレター登録フォーム\n   - プロモーションテキスト\n   - プライバシー通知の言及\n4. 記事の本文の冒頭でタイトルを繰り返さない\n5. 最後に他の記事へのリンクを含めない\n6. 主要な記事内容のみに焦点を当てる\n7. 出力に「投稿：」という単語を含めない\n8. ニュースレターの購読に関するテキストを含めない\n9. 外貨を換算する際は、最新のレート(現在1lari→52円）で行う。現大統領と元大統領の区別をきちんとするように。ジョージアと日本の関係に関連する側面がある場合は強調する'
          },
          {
            role: 'user',
            content: `このジョージア語の記事を日本語に翻訳し、SEOタイトル「${seoTitle}」を使用してください：\n\n${article.content}。もしタイトルにエクスクラメーションマーク！が含まれている場合は、！を使わないでください。`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error status: ${response.status} ${response.statusText}`);
      console.error(`OpenRouter API error details: ${errorText}`);
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Translation API response:', JSON.stringify(data, null, 2));

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response format from translation API');
    }

    const rewrittenText = data.choices[0].message.content;

    // Extract the title and content
    // The title is the first line, and the content is everything after the first blank line
    const lines = rewrittenText.split('\n');
    const title = lines[0];
    const content = lines.slice(2).join('\n'); // Skip the title and the blank line

    // Clean up the content
    const cleanedContent = content
      .replace(/Posted:/g, '')
      .replace(/Topics[\s\S]*$/g, '')
      .replace(/Subscribe for the industry[\s\S]*?Privacy Notice\./g, '')
      .replace(/Every weekday and Sunday[\s\S]*?Privacy Notice\./g, '')
      .replace(/By submitting your email[\s\S]*?Privacy Notice\./g, '')
      .replace(/Privacy Notice\./g, '')
      .replace(/Startups are the core[\s\S]*?Privacy Notice\./g, '')
      // Remove flag emojis
      .replace(/\ud83c\uddec\ud83c\uddea|\ud83c\uddef\ud83c\uddf5|\ud83c\uddfa\ud83c\uddf8|\ud83c\uddea\ud83c\uddfa|\ud83c\uddec\ud83c\udde7|\ud83c\udde9\ud83c\uddea|\ud83c\uddeb\ud83c\uddf7|\ud83c\uddee\ud83c\uddf9|\ud83c\uddea\ud83c\uddf8|\ud83c\uddf7\ud83c\uddfa|\ud83c\udde8\ud83c\uddf3|\ud83c\uddf0\ud83c\uddf7|\ud83c\uddee\ud83c\uddf3|\ud83c\udde7\ud83c\uddf7|\ud83c\uddf2\ud83c\uddfd|\ud83c\udde8\ud83c\udde6|\ud83c\udde6\ud83c\uddfa|\ud83c\uddf3\ud83c\uddff|\ud83c\uddff\ud83c\udde6|\ud83c\uddef\ud83c\uddf5/g, '')
      // Replace markdown headings with HTML headings
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Fix any other special characters
      .replace(/[\u{1F300}-\u{1F5FF}|\u{1F900}-\u{1F9FF}|\u{1F600}-\u{1F64F}|\u{1F680}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{1F1E0}-\u{1F1FF}|\u{1F191}-\u{1F251}|\u{1F004}|\u{1F0CF}|\u{1F170}-\u{1F171}|\u{1F17E}-\u{1F17F}|\u{1F18E}|\u{3030}|\u{2B50}|\u{2B55}|\u{2934}-\u{2935}|\u{2B05}-\u{2B07}|\u{2B1B}-\u{2B1C}|\u{3297}|\u{3299}|\u{303D}|\u{00A9}|\u{00AE}|\u{2122}|\u{23F3}|\u{24C2}|\u{23E9}-\u{23EF}|\u{25AA}-\u{25AB}|\u{25FB}-\u{25FE}|\u{25B6}|\u{25C0}|\u{2604}|\u{2049}|\u{203C}]/gu, '');

    console.log(`Rewritten title: ${title}`);
    console.log(`Rewritten content (first 100 chars): ${cleanedContent.substring(0, 100)}...`);

    return {
      title,
      content: cleanedContent,
      metaTitle: seoTitle,
      metaDescription: seoMetaDescription
    };
  } catch (error) {
    console.error('Error rewriting article:', error);
    // Return null to indicate failure instead of falling back to original content
    return null;
  }
}

// 4. Post to WordPress
async function postToWordPress(article, rewrittenArticle) {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return false;
  }

  // Check if rewrittenArticle is an object with title and content properties
  let title, content, metaTitle, metaDescription, source;
  if (typeof rewrittenArticle === 'object' && rewrittenArticle.title && rewrittenArticle.content) {
    title = rewrittenArticle.title;
    content = rewrittenArticle.content;
    metaTitle = rewrittenArticle.metaTitle;
    metaDescription = rewrittenArticle.metaDescription;
    source = article.source || 'civil.ge'; // Get source from the original article
  } else {
    // For backward compatibility
    title = article.title;
    content = rewrittenArticle; // Assuming rewrittenArticle is the content string
    source = article.source || 'civil.ge'; // Get source from the original article
  }

  console.log(`Posting article to WordPress: ${title}`);
  console.log(`Using WordPress API URL: ${WP_API_URL}`);

  // Process the content to clean up any formatting issues
  console.log('Cleaning up article content...');

  // Since we can't directly import the TypeScript module, we'll implement the cleanup here
  let cleanedContent = content;

  // First, check if the content starts with the title and remove it
  const titleMatch = cleanedContent.match(/^\*\*([^\*]+)\*\*/);
  if (titleMatch) {
    const title = titleMatch[1];
    // Remove the title from the beginning of the content
    cleanedContent = cleanedContent.replace(new RegExp(`^\\*\\*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*\\n\\n`), '');
  }

  // Remove "Posted:" at the beginning of the content or anywhere in the content
  cleanedContent = cleanedContent.replace(/^Posted:\s*\n\n/g, '');
  cleanedContent = cleanedContent.replace(/^Posted:/g, '');
  cleanedContent = cleanedContent.replace(/Posted:\s*\n\n/g, '');
  cleanedContent = cleanedContent.replace(/Posted:/g, '');
  cleanedContent = cleanedContent.replace(/Posted\s+in[^\n]+\n/g, '');
  cleanedContent = cleanedContent.replace(/Posted\s+by[^\n]+\n/g, '');

  // Remove Topics section and everything after it (including subscription info)
  cleanedContent = cleanedContent.replace(/Topics[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/\*\*Topics\*\*[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/\*\*Topics:[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/Topics:[\s\S]*$/g, '');

  // Remove subscription information sections
  cleanedContent = cleanedContent.replace(/Subscribe for the industry[\s\S]*?Privacy Notice\./g, '');
  cleanedContent = cleanedContent.replace(/Every weekday and Sunday[\s\S]*?Privacy Notice\./g, '');
  cleanedContent = cleanedContent.replace(/By submitting your email[\s\S]*?Privacy Notice\./g, '');
  cleanedContent = cleanedContent.replace(/Privacy Notice\./g, '');
  cleanedContent = cleanedContent.replace(/Startups are the core[\s\S]*?Privacy Notice\./g, '');

  // Remove Popular Stories section
  cleanedContent = cleanedContent.replace(/\*\*Popular Stories:\*\*[\s\S]*?(?=\n\n|\*\*|$)/g, '');

  // Remove Related Articles section - multiple patterns to catch different formats
  cleanedContent = cleanedContent.replace(/\*\*Read More\*\*[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/\*\*Related Articles\*\*[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/\*\*Related Articles:\*\*[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/Read More[\s\S]*$/g, '');
  cleanedContent = cleanedContent.replace(/Related Articles:[\s\S]*$/g, '');

  // Remove individual related article links
  cleanedContent = cleanedContent.replace(/– \[(.*?)\]\((.*?)\)/g, '');
  cleanedContent = cleanedContent.replace(/- \[(.*?)\]\((.*?)\)/g, '');

  // Remove About the Author section
  cleanedContent = cleanedContent.replace(/\*\*About the Author\*\*[\s\S]*?(?=\n\n|\*\*|$)/g, '');
  cleanedContent = cleanedContent.replace(/About the Author[\s\S]*?(?=\n\n|\*\*|$)/g, '');

  // Remove any AI Editor or similar markers
  cleanedContent = cleanedContent.replace(/\*AI Editor\*/g, '');
  cleanedContent = cleanedContent.replace(/—\s*\n\n\*AI Editor\*/, '');

  // Remove trailing dash and AI Editor
  cleanedContent = cleanedContent.replace(/\n—\s*\n\n\*AI Editor\*$/g, '');

  // Convert any remaining bold formatting to HTML
  cleanedContent = cleanedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert any remaining italic formatting to HTML
  cleanedContent = cleanedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Remove flag emojis
  cleanedContent = cleanedContent.replace(/\ud83c\uddec\ud83c\uddea|\ud83c\uddef\ud83c\uddf5|\ud83c\uddfa\ud83c\uddf8|\ud83c\uddea\ud83c\uddfa|\ud83c\uddec\ud83c\udde7|\ud83c\udde9\ud83c\uddea|\ud83c\uddeb\ud83c\uddf7|\ud83c\uddee\ud83c\uddf9|\ud83c\uddea\ud83c\uddf8|\ud83c\uddf7\ud83c\uddfa|\ud83c\udde8\ud83c\uddf3|\ud83c\uddf0\ud83c\uddf7|\ud83c\uddee\ud83c\uddf3|\ud83c\udde7\ud83c\uddf7|\ud83c\uddf2\ud83c\uddfd|\ud83c\udde8\ud83c\udde6|\ud83c\udde6\ud83c\uddfa|\ud83c\uddf3\ud83c\uddff|\ud83c\uddff\ud83c\udde6|\ud83c\uddef\ud83c\uddf5/g, '');

  // Replace markdown headings with HTML headings
  cleanedContent = cleanedContent.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  cleanedContent = cleanedContent.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  cleanedContent = cleanedContent.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Fix any other special characters
  cleanedContent = cleanedContent.replace(/[\u{1F300}-\u{1F5FF}|\u{1F900}-\u{1F9FF}|\u{1F600}-\u{1F64F}|\u{1F680}-\u{1F6FF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{1F1E0}-\u{1F1FF}|\u{1F191}-\u{1F251}|\u{1F004}|\u{1F0CF}|\u{1F170}-\u{1F171}|\u{1F17E}-\u{1F17F}|\u{1F18E}|\u{3030}|\u{2B50}|\u{2B55}|\u{2934}-\u{2935}|\u{2B05}-\u{2B07}|\u{2B1B}-\u{2B1C}|\u{3297}|\u{3299}|\u{303D}|\u{00A9}|\u{00AE}|\u{2122}|\u{23F3}|\u{24C2}|\u{23E9}-\u{23EF}|\u{25AA}-\u{25AB}|\u{25FB}-\u{25FE}|\u{25B6}|\u{25C0}|\u{2604}|\u{2049}|\u{203C}]/gu, '');

  // Remove any trailing whitespace
  cleanedContent = cleanedContent.trim();

  // For WordPress.com, we need to use OAuth2 authentication
  try {
    console.log('Using WordPress.com authentication...');

    // First, get an access token using client credentials
    console.log('Getting access token...');
    const tokenResponse = await fetch('https://public-api.wordpress.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'client_id': WP_CLIENT_ID,
        'client_secret': WP_CLIENT_SECRET,
        'grant_type': 'password',
        'username': WP_USERNAME,
        'password': WP_PASSWORD
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`WordPress token error status: ${tokenResponse.status} ${tokenResponse.statusText}`);
      console.error(`WordPress token error details: ${errorText}`);
      throw new Error(`WordPress token error: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Access token obtained successfully!');
    const accessToken = tokenData.access_token;

    // Create a consistent excerpt from the content (exactly 100 characters)
    const stripHtml = (html) => html.replace(/<[^>]*>/g, '');
    const contentText = stripHtml(cleanedContent);

    // Get the first sentence or first 100 characters, whichever is shorter
    let excerpt = '';
    const firstSentence = contentText.split('.')[0];
    if (firstSentence && firstSentence.length <= 100) {
      excerpt = firstSentence + '.';
    } else {
      excerpt = contentText.substring(0, 100) + '...';
    }

    const response = await fetch(`${WP_API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        title: title,
        content: cleanedContent + `\n\n<p><small>メディアソース: ${source}</small></p>`, // Add source to content
        excerpt: excerpt, // Consistent excerpt for all articles
        status: 'publish',
        author: 1, // Use the user ID of the WordPress account (usually 1 for the primary admin)
        // Custom fields need to be in the meta object
        meta: {
          _yoast_wpseo_title: metaTitle || title,
          _yoast_wpseo_metadesc: metaDescription || contentText.substring(0, 155) + '...',
          source: source, // Add source information to meta
          article_source: source // Add source as a custom field that can be displayed
        }
      })
    });

    // Log detailed response information for debugging
    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const postData = await response.json();
      console.log(`Article posted successfully! Post ID: ${postData.id}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error('WordPress API error:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error posting to WordPress:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting full article processing test...');

  // Test WordPress connection first
  const connectionOk = await testWordPressConnection();
  if (!connectionOk) {
    console.error('WordPress connection test failed. Fix connection issues before continuing.');
    // You can choose to exit here or continue with the test
    // return;
  }

  // 1. Crawl all target websites to find articles
  let allArticles = [];

  for (const website of TARGET_WEBSITES) {
    console.log(`\nCrawling website: ${website}`);

    // Try primary crawling method
    let websiteArticles = await crawlWebsite(website);

    // If no articles found, try alternative approach
    if (websiteArticles.length === 0) {
      console.log(`No articles found on ${website} with primary method, trying alternative approach...`);
      websiteArticles = await crawlAlternative(website);
    }

    console.log(`Found ${websiteArticles.length} articles from ${website}`);
    allArticles = [...allArticles, ...websiteArticles];
  }

  // Use the combined articles from all websites
  let articles = allArticles;

  if (articles.length === 0) {
    console.log('No articles found from any website. Exiting.');
    return;
  }

  console.log('\nFound articles:');
  articles.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title}`);
    console.log(`   URL: ${article.url}`);
    console.log('---');
  });

  // Track successful and failed articles
  const results = {
    processed: 0,
    successful: 0,
    failed: 0,
    recentArticles: 0
  };

  // Process all articles
  console.log('\nProcessing all articles...');

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`\nProcessing article ${i + 1}/${articles.length}: ${article.title}`);

    try {
      // 2. Crawl article content
      console.log('Crawling article content...');
      const result = await crawlArticleContent(article.url);

      if (!result || !result.content) {
        console.log('Failed to extract article content. Skipping.');
        results.failed++;
        continue;
      }

      // Check if the article was published within the last 12 hours
      if (result.publishDate) {
        console.log(`Publication date: ${result.publishDate}`);
        const isRecent = isPublishedWithin12Hours(result.publishDate);
        console.log(`Published within last 12 hours: ${isRecent ? 'Yes' : 'No'}`);

        if (!isRecent) {
          console.log('Article not published within last 12 hours. Skipping.');
          continue;
        }

        results.recentArticles++;
      } else {
        console.log('Could not determine publication date. Processing anyway.');
      }

      // Add content and source to the article object
      article.content = result.content;

      // Update the source if it was determined from the article content
      if (result.source) {
        console.log(`Updating source from ${article.source} to ${result.source}`);
        article.source = result.source;
      }

      // 3. Rewrite the article
      console.log('Rewriting article...');
      const rewrittenArticle = await rewriteArticle(article);

      if (!rewrittenArticle || !rewrittenArticle.content) {
        console.log('Failed to rewrite article. Skipping.');
        results.failed++;
        continue;
      }

      console.log('Article rewritten successfully!');
      console.log(`Original title: ${article.title}`);
      console.log(`Rewritten title: ${rewrittenArticle.title}`);

      // 4. Post to WordPress
      console.log('Posting to WordPress...');
      const posted = await postToWordPress(article, rewrittenArticle);

      if (posted) {
        console.log('Article posted to WordPress successfully!');
        results.successful++;
      } else {
        console.log('Failed to post article to WordPress.');
        results.failed++;
      }

      results.processed++;

      // Add a delay between processing articles to avoid rate limiting
      if (i < articles.length - 1) {
        console.log('Waiting 5 seconds before processing next article...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`Error processing article: ${error.message}`);
      results.failed++;
    }
  }

  // Print summary
  console.log('\n=== PROCESSING SUMMARY ===');
  console.log(`Total articles found: ${articles.length}`);
  console.log(`Articles published in last 12 hours: ${results.recentArticles}`);
  console.log(`Articles processed: ${results.processed}`);
  console.log(`Articles successfully posted: ${results.successful}`);
  console.log(`Articles failed: ${results.failed}`);
  console.log('=========================');

  console.log('\nProcess completed.');
}

// Run the main function
main().catch(error => {
  console.error('Error in main process:', error);
});

// Export functions for use in other scripts
module.exports = {
  testWordPressConnection,
  crawlWebsite,
  crawlAlternative,
  crawlArticleContent,
  rewriteArticle,
  postToWordPress,
  isPublishedWithin12Hours
};
