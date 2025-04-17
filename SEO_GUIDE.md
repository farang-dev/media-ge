# SEO Guide for Unmanned Newsroom

This guide provides best practices for optimizing your WordPress site for search engines to help your articles rank higher in Google search results.

## Automated SEO Features

Your script now includes the following SEO enhancements:

1. **SEO-Optimized Titles**: Each article now gets an SEO-optimized title that includes relevant keywords and is designed to attract clicks.

2. **Meta Descriptions**: Custom meta descriptions are generated for each article to improve click-through rates from search results.

3. **Structured Content**: Articles are now formatted with proper HTML heading structure (H2, H3) and semantic markup.

4. **Sitemap Generation**: A sitemap.xml file is generated to help search engines discover and index your content.

5. **Google Submission**: A tool to submit new URLs to Google for faster indexing.

## Additional SEO Steps

To further improve your search rankings, follow these steps:

### 1. Set Up Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (https://fumixo5.wordpress.com)
3. Verify ownership (follow Google's instructions)
4. Submit your sitemap.xml file
5. Monitor performance and issues

### 2. Create Internal Links

Internal linking helps Google understand your site structure and distributes page authority:

1. Link from newer articles to older, related articles
2. Create category pages that link to multiple articles on the same topic
3. Consider adding a "Related Articles" section at the end of each post

### 3. Improve Page Speed

Fast-loading pages rank better:

1. Use WordPress.com's built-in caching
2. Optimize images before uploading
3. Minimize plugins and external scripts

### 4. Build Backlinks

Getting links from other websites is crucial for SEO:

1. Share your articles on social media
2. Reach out to other tech blogs for guest posting opportunities
3. Comment on relevant forums and blogs (without spamming)

### 5. Update Content Regularly

Google favors fresh content:

1. Update older articles with new information
2. Add new sections to existing articles
3. Fix any broken links or outdated information

### 6. Monitor Keywords

Track which keywords are bringing traffic:

1. Use Google Search Console to see which queries lead to your site
2. Identify high-performing keywords and create more content around them
3. Look for keywords with high impressions but low clicks - these titles may need improvement

## Running the SEO Tools

```bash
# Generate a sitemap
node scripts/generate-sitemap.js

# Submit recent URLs to Google
node scripts/submit-to-google.js
```

## SEO Checklist for Each Article

- [ ] Title contains primary keyword
- [ ] Meta description includes primary and secondary keywords
- [ ] Content is at least 800 words
- [ ] Content includes proper heading structure (H2, H3)
- [ ] Images have alt text
- [ ] URL is clean and includes keywords
- [ ] Content links to other relevant articles on your site
- [ ] Content is unique and provides value

By following these guidelines, your articles will have a better chance of ranking well in Google search results.
