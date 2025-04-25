// Use the same approach as in test-full-process.js
const dotenv = require('dotenv');
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

// Load environment variables
dotenv.config();

// WordPress API credentials
const WP_API_URL = process.env.WORDPRESS_API_URL;
const WP_CLIENT_ID = process.env.WORDPRESS_CLIENT_ID;
const WP_CLIENT_SECRET = process.env.WORDPRESS_CLIENT_SECRET;
const WP_USERNAME = process.env.WORDPRESS_USERNAME;
const WP_PASSWORD = process.env.WORDPRESS_PASSWORD;

// Function to get an access token
async function getAccessToken() {
  console.log('Getting access token...');
  try {
    const params = new URLSearchParams();
    params.append('client_id', WP_CLIENT_ID);
    params.append('client_secret', WP_CLIENT_SECRET);
    params.append('grant_type', 'password');
    params.append('username', WP_USERNAME);
    params.append('password', WP_PASSWORD);

    const response = await axios.post('https://public-api.wordpress.com/oauth2/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Access token obtained successfully!');
    return response.data.access_token;
  } catch (error) {
    console.error('WordPress token error:', error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    }
    throw new Error(`WordPress token error: ${error.message}`);
  }
}

// Function to fetch all posts
async function fetchAllPosts(accessToken) {
  console.log('Fetching all posts...');
  try {
    const response = await axios.get(`${WP_API_URL}/posts?per_page=100`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    console.log(`Found ${response.data.length} posts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    }
    throw new Error(`Error fetching posts: ${error.message}`);
  }
}

// Function to extract source from URL
function extractSourceFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    console.error(`Error extracting source from URL ${url}:`, error);
    return 'civil.ge'; // Default fallback
  }
}

// Function to extract source from content
function extractSourceFromContent(content) {
  // Look for patterns like "メディアソース: civil.ge" in the content
  const sourceMatch = content.match(/メディアソース:\s*([a-zA-Z0-9.-]+)/);
  if (sourceMatch && sourceMatch[1]) {
    return sourceMatch[1];
  }

  // Look for URLs in the content
  const urlMatch = content.match(/https?:\/\/([^\/]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].replace('www.', '');
  }

  // Default to civil.ge if no source is found
  return 'civil.ge';
}

// Function to update a post's meta fields
async function updatePostSource(accessToken, postId, post) {
  // Try to extract source from content
  let source = 'civil.ge'; // Default source

  if (post.content && post.content.rendered) {
    // First try to extract from the content
    source = extractSourceFromContent(post.content.rendered);
  } else if (post.link) {
    // Fallback to extracting from the link
    source = extractSourceFromUrl(post.link);
  }

  // Check if the source contains "interpressnews.ge"
  if (post.content && post.content.rendered &&
      post.content.rendered.includes('interpressnews.ge')) {
    source = 'interpressnews.ge';
  }

  console.log(`Updating post ${postId} with source: ${source}`);

  try {
    const response = await axios.post(`${WP_API_URL}/posts/${postId}`, {
      meta: {
        source: source,
        article_source: source
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log(`Post ${postId} updated successfully`);
    return true;
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('Starting update of article sources...');

    // Get access token
    const accessToken = await getAccessToken();

    // Fetch all posts
    const posts = await fetchAllPosts(accessToken);

    // Update each post
    let successCount = 0;
    let failCount = 0;

    for (const post of posts) {
      try {
        // Pass the entire post object to updatePostSource
        const success = await updatePostSource(accessToken, post.id, post);

        if (success) {
          successCount++;
        } else {
          failCount++;
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error);
        failCount++;
      }
    }

    console.log('\n=== UPDATE SUMMARY ===');
    console.log(`Total posts processed: ${posts.length}`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Failed to update: ${failCount}`);
    console.log('======================');

  } catch (error) {
    console.error('Error in main process:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
});
