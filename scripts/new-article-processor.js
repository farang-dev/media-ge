// Copy of test-full-process.js with explicit model setting
require('dotenv').config(); // Load environment variables
const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

// Configuration
const WP_API_URL = process.env.WORDPRESS_API_URL;
const WP_CLIENT_ID = process.env.WORDPRESS_CLIENT_ID;
const WP_CLIENT_SECRET = process.env.WORDPRESS_CLIENT_SECRET;
const WP_USERNAME = process.env.WORDPRESS_USERNAME;
const WP_PASSWORD = process.env.WORDPRESS_PASSWORD;
const TARGET_WEBSITE = process.env.TARGET_WEBSITE || 'https://civil.ge/ka/archives/category/news-ka';

// Import the main script functions
const mainScript = require('./test-full-process.js');

// Override the rewriteArticle function to ensure we're using the correct model
async function rewriteArticle(article) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  // Add more debugging for the OpenRouter API key
  console.log('Environment variables:');
  console.log('OPENROUTER_API_KEY exists:', !!process.env.OPENROUTER_API_KEY);
  if (process.env.OPENROUTER_API_KEY) {
    console.log('OPENROUTER_API_KEY length:', process.env.OPENROUTER_API_KEY.length);
    console.log('OPENROUTER_API_KEY first 3 chars:', process.env.OPENROUTER_API_KEY.substring(0, 3));
  }

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
    console.log('Using model: microsoft/mai-ds-r1:free');

    const seoResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://media-ge.vercel.app/',
        'X-Title': 'Georgia News'
      },
      body: JSON.stringify({
        model: 'microsoft/mai-ds-r1:free', // Explicitly set the model
        messages: [
          {
            role: 'system',
            content: 'あなたは「ジョージアニュース」のSEO専門家です。ジョージアのニュース記事に対して、日本語のSEO最適化されたタイトルとメタ説明を作成してください。タイトルは注目を引くもので、関連キーワードを含み、60文字以内にしてください。メタ説明は記事を要約し、キーワードを含み、155文字以内にしてください。\n\n重要：\n1. 絵文字や特殊文字（#など）は使用しないでください\n2. ロシア語の文字は使用せず、日本語で表現してください\n\n応答形式は必ず次のようにしてください：\nTITLE: [あなたのSEOタイトル]\nMETA: [あなたのメタ説明]'
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

    // Check for different possible response formats
    let seoContent = '';

    if (seoData.choices && seoData.choices[0]) {
      if (seoData.choices[0].message && seoData.choices[0].message.content) {
        // Standard format
        seoContent = seoData.choices[0].message.content;
      } else if (seoData.choices[0].message && seoData.choices[0].message.reasoning) {
        // Alternative format where content is in reasoning field
        seoContent = seoData.choices[0].message.reasoning;
      } else if (seoData.choices[0].text) {
        // Legacy format
        seoContent = seoData.choices[0].text;
      }
    }

    if (!seoContent) {
      console.error('Could not extract content from SEO API response. Using original title as fallback.');
      // Instead of throwing an error, we'll use the original title as a fallback
      seoContent = `TITLE: ${article.title}\nMETA: ${article.title}`;
    }

    // Extract SEO title and meta description
    let seoTitle = article.title;
    let seoMetaDescription = '';

    const titleMatch = seoContent.match(/TITLE:\s*(.+)/);
    if (titleMatch && titleMatch[1]) {
      seoTitle = titleMatch[1].trim();
    }

    const metaMatch = seoContent.match(/META:\s*(.+)/);
    if (metaMatch && metaMatch[1]) {
      seoMetaDescription = metaMatch[1].trim();
    }

    console.log(`SEO Title: ${seoTitle}`);
    console.log(`SEO Meta Description: ${seoMetaDescription}`);

    // Now rewrite the article with SEO optimization
    console.log('Using model: microsoft/mai-ds-r1:free for translation');
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://media-ge.vercel.app/',
        'X-Title': 'Georgia News'
      },
      body: JSON.stringify({
        model: 'microsoft/mai-ds-r1:free', // Explicitly set the model
        messages: [
          {
            role: 'system',
            content: 'あなたは「ジョージアニュース」のための翻訳者です。ジョージア語の記事を日本語に翻訳し、日本人読者向けに最適化します。以下のガイドラインに従ってください：\n\n1. 提供されたSEOタイトルを使用する\n2. 日本語として自然で読みやすい文章にする\n3. 適切な見出し構造を使用し、H2とH3タグでサブトピックを整理する\n4. 重要な用語には<strong>などのセマンティックHTMLを使用する\n5. 絵文字や特殊文字（#など）は使用しないでください\n6. ロシア語の文字は使用せず、日本語で表現してください\n7. 「関連記事」や「関連情報」セクションは翻訳しないでください\n8. 短い段落で読みやすく魅力的なコンテンツを作成する\n9. 強力な導入部と結論を含める\n10. ジョージアの地名や人名は初出時にカタカナと原語（ラテン文字）の両方を記載する\n11. 日本人読者にとって馴染みのない概念や文化的背景には簡潔な説明を加える\n\n重要な書式ルール：\n\n1. 応答は最初の行にSEOタイトルから始め、空白行を挟んでから本文を続ける\n2. 適切な構造と強調のために<h2>、<h3>、<strong>、<em>などのHTMLタグを使用する\n3. 以下のセクションは出力に含めないでください：\n   - 「トピック」や「人気記事」セクション\n   - 「関連記事」や「もっと読む」セクション\n   - 「関連情報」セクション\n   - 「著者について」セクション\n   - 著者の経歴やサイン\n   - 「AI編集者」のサイン\n   - コンテンツの冒頭にある「投稿：」マーカー\n   - サブスクリプション情報セクション\n   - 「メールを送信することにより」という免責事項\n   - ニュースレター登録フォーム\n   - プロモーションテキスト\n   - プライバシー通知の言及\n4. 記事の本文の冒頭でタイトルを繰り返さない\n5. 最後に他の記事へのリンクを含めない\n6. 主要な記事内容のみに焦点を当てる\n7. 出力に「投稿：」という単語を含めない\n8. ニュースレターの購読に関するテキストを含めない\n9. ジョージアと日本の関係に関連する側面がある場合は強調する'
          },
          {
            role: 'user',
            content: `このジョージア語の記事を日本語に翻訳し、SEOタイトル「${seoTitle}」を使用してください：\n\n${article.content}`
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

    // Check for different possible response formats
    let translationContent = '';

    if (data.choices && data.choices[0]) {
      if (data.choices[0].message && data.choices[0].message.content) {
        // Standard format
        translationContent = data.choices[0].message.content;
      } else if (data.choices[0].message && data.choices[0].message.reasoning) {
        // Alternative format where content is in reasoning field
        translationContent = data.choices[0].message.reasoning;
      } else if (data.choices[0].text) {
        // Legacy format
        translationContent = data.choices[0].text;
      }
    }

    if (!translationContent) {
      console.error('Could not extract content from translation API response.');
      throw new Error('Invalid response format from translation API');
    }

    // Extract the title and content
    // The title is the first line, and the content is everything after the first blank line
    const lines = translationContent.split('\n');
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
      // Remove Russian text
      .replace(/[\u0430-\u044f\u0410-\u042f]+/g, '')
      // Remove "Related Articles" section and everything after it
      .replace(/Related Articles[\s\S]*$/g, '')
      // Remove "関連情報" section and everything after it
      .replace(/関連情報[\s\S]*$/g, '');

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

// Main function
async function main() {
  console.log('Starting new article processor...');
  console.log('Using model: microsoft/mai-ds-r1:free');

  // Test WordPress connection first
  const connectionOk = await mainScript.testWordPressConnection();
  if (!connectionOk) {
    console.error('WordPress connection test failed. Fix connection issues before continuing.');
    // You can choose to exit here or continue with the test
    // return;
  }

  // 1. Crawl website to find articles
  let articles = await mainScript.crawlWebsite(TARGET_WEBSITE);

  if (articles.length === 0) {
    console.log('No articles found with primary method, trying alternative approach...');
    articles = await mainScript.crawlAlternative(TARGET_WEBSITE);
  }

  if (articles.length === 0) {
    console.log('No articles found. Exiting.');
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

  for (let i = 0; i < Math.min(articles.length, 5); i++) {
    const article = articles[i];
    console.log(`\nProcessing article ${i + 1}/${Math.min(articles.length, 5)}: ${article.title}`);

    try {
      // 2. Crawl article content
      console.log('Crawling article content...');
      const result = await mainScript.crawlArticleContent(article.url);

      if (!result || !result.content) {
        console.log('Failed to extract article content. Skipping.');
        results.failed++;
        continue;
      }

      // Check if the article was published within the last 12 hours
      if (result.publishDate) {
        console.log(`Publication date: ${result.publishDate}`);
        const isRecent = mainScript.isPublishedWithin12Hours(result.publishDate);
        console.log(`Published within last 12 hours: ${isRecent ? 'Yes' : 'No'}`);

        if (!isRecent) {
          console.log('Article not published within last 12 hours. Skipping.');
          continue;
        }

        results.recentArticles++;
      } else {
        console.log('Could not determine publication date. Processing anyway.');
      }

      // Add content to the article object
      article.content = result.content;

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
      const posted = await mainScript.postToWordPress(article, rewrittenArticle);

      if (posted) {
        console.log('Article posted to WordPress successfully!');
        results.successful++;
      } else {
        console.log('Failed to post article to WordPress.');
        results.failed++;
      }

      results.processed++;

      // Add a delay between processing articles to avoid rate limiting
      if (i < Math.min(articles.length, 5) - 1) {
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
