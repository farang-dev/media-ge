import { fetchWithTimeout } from './utils';
import * as cheerio from 'cheerio';

export interface CrawledArticle {
  title: string;
  content: string;
  url: string;
  publishedDate: Date;
}

export async function crawlWebsite(url: string): Promise<CrawledArticle[]> {
  try {
    const response = await fetchWithTimeout(url, { timeout: 10000 });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Adjust these selectors based on the target website structure
    const articles: CrawledArticle[] = [];
    
    $('.article-item').each((_, element) => {
      const articleUrl = $(element).find('a.title').attr('href');
      const title = $(element).find('a.title').text().trim();
      
      if (articleUrl && title) {
        articles.push({
          title,
          content: '', // Will be filled when crawling the full article
          url: new URL(articleUrl, url).toString(),
          publishedDate: new Date()
        });
      }
    });
    
    return articles;
  } catch (error) {
    console.error('Error crawling website:', error);
    return [];
  }
}

export async function crawlArticleContent(url: string): Promise<string> {
  try {
    const response = await fetchWithTimeout(url, { timeout: 10000 });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Adjust this selector based on the target website structure
    const content = $('.article-content').html() || '';
    
    return content;
  } catch (error) {
    console.error('Error crawling article content:', error);
    return '';
  }
}