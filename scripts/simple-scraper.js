// Simple scraper for Georgian news site
require('dotenv').config(); // Load environment variables
const cheerio = require('cheerio');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

// Environment variables
const TARGET_WEBSITE = 'https://civil.ge/ka/archives/category/news-ka';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Main function
async function main() {
  console.log('Starting simple Georgian news scraper...');
  console.log(`Target website: ${TARGET_WEBSITE}`);

  try {
    // 1. Fetch the main page
    console.log('Fetching main page...');
    const response = await fetch(TARGET_WEBSITE, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch main page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    fs.writeFileSync('raw-html.txt', html);
    console.log('Raw HTML saved to raw-html.txt');

    // 2. Parse HTML and extract article URLs
    console.log('Extracting article URLs...');
    const $ = cheerio.load(html);
    const articleUrls = [];

    // Look for article links with the specific pattern for civil.ge
    $('a').each((i, element) => {
      const href = $(element).attr('href');
      if (href && href.includes('civil.ge/ka/archives/') && !href.includes('/category/') && !href.includes('/author/')) {
        articleUrls.push(href);
      }
    });

    // Remove duplicates
    const uniqueUrls = [...new Set(articleUrls)];
    console.log(`Found ${uniqueUrls.length} unique article URLs`);

    if (uniqueUrls.length === 0) {
      console.log('No articles found. Exiting.');
      return;
    }

    // 3. Process the first 5 articles (or fewer if less than 5 are found)
    const articlesToProcess = uniqueUrls.slice(0, 5);
    const articles = [];

    for (const url of articlesToProcess) {
      console.log(`\nFetching article: ${url}`);

      try {
        const articleResponse = await fetch(url, {
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

        // Extract title
        const title = $article('h1').first().text().trim();
        console.log(`Title: ${title}`);

        // Extract content - try different selectors
        let content = '';
        const selectors = [
          '.entry-content',
          '.post-content',
          '.content',
          'article .content',
          '.article-body',
          '.article-text'
        ];

        for (const selector of selectors) {
          if ($article(selector).length > 0) {
            content = $article(selector).html();
            break;
          }
        }

        // If no content found with selectors, try to get all paragraphs
        if (!content) {
          content = $article('article p').map((i, el) => $article(el).html()).get().join('');
        }

        if (!content) {
          console.log('No content found for this article. Skipping.');
          continue;
        }

        // Extract date if available
        let publishDate = null;
        const dateSelectors = [
          'time',
          '.article__date',
          '.article-date',
          '.post-date',
          '[datetime]'
        ];

        for (const selector of dateSelectors) {
          if ($article(selector).length > 0) {
            const dateElement = $article(selector).first();
            publishDate = dateElement.attr('datetime') || dateElement.text().trim();
            break;
          }
        }

        console.log(`Publication date: ${publishDate || 'Unknown'}`);

        // Add article to the list
        articles.push({
          title,
          url,
          content,
          publishDate
        });

        console.log('Article processed successfully.');

      } catch (error) {
        console.error(`Error processing article: ${error.message}`);
      }

      // Add a small delay between requests to avoid overloading the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\nProcessed ${articles.length} articles.`);

    // 4. Translate the first article as a test
    if (articles.length > 0 && OPENROUTER_API_KEY) {
      console.log('\nTranslating the first article as a test...');
      const article = articles[0];

      try {
        // Generate SEO metadata
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
            model: 'mistralai/mistral-small-3.1-24b-instruct:free',
            messages: [
              {
                role: 'system',
                content: 'あなたは「ジョージア🇬🇪ニュース」のSEO専門家です。ジョージアのニュース記事に対して、日本語のSEO最適化されたタイトルとメタ説明を作成してください。タイトルは注目を引くもので、関連キーワードを含み、60文字以内にしてください。メタ説明は記事を要約し、キーワードを含み、155文字以内にしてください。\n\n応答形式は必ず次のようにしてください：\nTITLE: [あなたのSEOタイトル]\nMETA: [あなたのメタ説明]'
              },
              {
                role: 'user',
                content: `このジョージア語の記事に対して、日本語のSEO最適化されたタイトルとメタ説明を作成してください：\n\n原文タイトル： ${article.title}\n\n内容： ${article.content.substring(0, 1500)}...`
              }
            ]
          })
        });

        if (!seoResponse.ok) {
          throw new Error(`OpenRouter API error: ${seoResponse.status} ${seoResponse.statusText}`);
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

        // Translate the article
        console.log('Translating article...');
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://media-ge.vercel.app/',
            'X-Title': 'Georgia News'
          },
          body: JSON.stringify({
            model: 'mistralai/mistral-small-3.1-24b-instruct:free',
            messages: [
              {
                role: 'system',
                content: 'あなたは「ジョージア🇬🇪ニュース」のための翻訳者です。ジョージア語の記事を日本語に翻訳し、日本人読者向けに最適化します。以下のガイドラインに従ってください：\n\n1. 提供されたSEOタイトルを使用する\n2. 日本語として自然で読みやすい文章にする\n3. 適切な見出し構造を使用し、H2とH3タグでサブトピックを整理する\n4. 重要な用語には<strong>などのセマンティックHTMLを使用する\n5. 短い段落で読みやすく魅力的なコンテンツを作成する\n6. 強力な導入部と結論を含める\n7. ジョージアの地名や人名は初出時にカタカナと原語（ラテン文字）の両方を記載する\n8. 日本人読者にとって馴染みのない概念や文化的背景には簡潔な説明を加える\n\n重要な書式ルール：\n\n1. 応答は最初の行にSEOタイトルから始め、空白行を挟んでから本文を続ける\n2. 適切な構造と強調のために<h2>、<h3>、<strong>、<em>などのHTMLタグを使用する\n3. 以下のセクションは出力に含めないでください：\n   - 「トピック」や「人気記事」セクション\n   - 「関連記事」や「もっと読む」セクション\n   - 「著者について」セクション\n   - 著者の経歴やサイン\n   - 「AI編集者」のサイン\n   - コンテンツの冒頭にある「投稿：」マーカー\n   - サブスクリプション情報セクション\n   - 「メールを送信することにより」という免責事項\n   - ニュースレター登録フォーム\n   - プロモーションテキスト\n   - プライバシー通知の言及\n4. 記事の本文の冒頭でタイトルを繰り返さない\n5. 最後に他の記事へのリンクを含めない\n6. 主要な記事内容のみに焦点を当てる\n7. 出力に「投稿：」という単語を含めない\n8. ニュースレターの購読に関するテキストを含めない\n9. ジョージアと日本の関係に関連する側面がある場合は強調する'
              },
              {
                role: 'user',
                content: `このジョージア語の記事を日本語に翻訳し、SEOタイトル「${seoTitle}」を使用してください：\n\n${article.content}`
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Translation API response:', JSON.stringify(data, null, 2));

        if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
          throw new Error('Invalid response format from translation API');
        }

        const translatedText = data.choices[0].message.content;

        // Extract the title and content
        const lines = translatedText.split('\n');
        const translatedTitle = lines[0];
        const translatedContent = lines.slice(2).join('\n'); // Skip the title and the blank line

        console.log(`\nTranslated title: ${translatedTitle}`);
        console.log(`Translated content (first 300 chars):\n${translatedContent.substring(0, 300)}...`);

        // Save the translated article to a file
        const outputFile = 'translated-article.html';
        fs.writeFileSync(outputFile, `<h1>${translatedTitle}</h1>\n\n${translatedContent}`);
        console.log(`\nTranslated article saved to ${outputFile}`);

      } catch (error) {
        console.error(`Error translating article: ${error.message}`);
      }
    } else if (!OPENROUTER_API_KEY) {
      console.log('\nSkipping translation: OPENROUTER_API_KEY not configured.');
    } else {
      console.log('\nNo articles to translate.');
    }

  } catch (error) {
    console.error(`Error in main process: ${error.message}`);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
});
