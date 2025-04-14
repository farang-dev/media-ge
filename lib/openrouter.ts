import { CrawledArticle } from './crawler';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.com';
const SITE_NAME = 'Unmanned Newsroom';

// Define a type for the rewritten article
export interface RewrittenArticle {
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}

export async function generateMetaData(title: string, content: string): Promise<{ metaTitle: string, metaDescription: string }> {
  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API key not configured');
    return {
      metaTitle: title,
      metaDescription: content.substring(0, 155) + '...'
    };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO expert for "Unmanned Newsroom", a tech and AI news site. Generate a meta title and meta description for the given article. The meta title should be compelling, under 60 characters, and include relevant tech/AI keywords. The meta description should be informative, under 155 characters, and entice users to click.\n\nFormat your response exactly like this:\n\nMETA_TITLE: [Your meta title here]\nMETA_DESCRIPTION: [Your meta description here]'
          },
          {
            role: 'user',
            content: `Generate SEO meta title and description for this article with title "${title}":\n\n${content.substring(0, 1000)}...`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const metaText = data.choices[0].message.content;

    // Extract meta title and description
    const metaTitleMatch = metaText.match(/META_TITLE:\s*(.+)/);
    const metaDescriptionMatch = metaText.match(/META_DESCRIPTION:\s*(.+)/);

    return {
      metaTitle: metaTitleMatch ? metaTitleMatch[1] : title,
      metaDescription: metaDescriptionMatch ? metaDescriptionMatch[1] : content.substring(0, 155) + '...'
    };
  } catch (error) {
    console.error('Error generating meta data:', error);
    return {
      metaTitle: title,
      metaDescription: content.substring(0, 155) + '...'
    };
  }
}

export async function rewriteArticle(article: CrawledArticle): Promise<RewrittenArticle> {
  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API key not configured');
    return { title: article.title, content: article.content };
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are an expert tech and AI content rewriter for "Unmanned Newsroom". Rewrite the article to make it unique while preserving all factual information. Maintain the same structure but use different wording and phrasing. YOU MUST REWRITE THE TITLE AS WELL AS THE CONTENT.\n\nIMPORTANT FORMATTING RULES:\n\n1. Your response MUST start with the rewritten title on the first line, followed by a blank line, then the content\n2. Use HTML tags like <strong> and <em> for emphasis instead of asterisks (*)\n3. DO NOT include any of these sections in your output:\n   - "Topics" or "Popular Stories" sections\n   - "Related Articles" or "Read More" sections\n   - "About the Author" sections\n   - Author bios or signatures\n   - "AI Editor" signatures\n   - "Posted:" markers at the beginning of content\n4. DO NOT repeat the title at the beginning of the article content\n5. DO NOT include any links to other articles at the end\n6. Focus ONLY on the main article content\n7. NEVER include the word "Posted:" in your output\n8. Emphasize tech and AI aspects of the story when relevant'
          },
          {
            role: 'user',
            content: `Please rewrite this article with the title "${article.title}":\n\n${article.content}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rewrittenText = data.choices[0].message.content;

    // Extract the title and content
    // The title is the first line, and the content is everything after the first blank line
    const lines = rewrittenText.split('\n');
    const title = lines[0];
    const content = lines.slice(2).join('\n'); // Skip the title and the blank line

    // Generate meta data
    console.log('Generating meta data for article...');
    const { metaTitle, metaDescription } = await generateMetaData(title, content);

    return { title, content, metaTitle, metaDescription };
  } catch (error) {
    console.error('Error rewriting article:', error);
    return { title: article.title, content: article.content };
  }
}
