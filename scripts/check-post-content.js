require('dotenv').config();
const axios = require('axios');

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

// Function to fetch a specific post
async function fetchPost(accessToken, postId) {
  console.log(`Fetching post ${postId}...`);
  try {
    const response = await axios.get(`${WP_API_URL}/posts/${postId}?_fields=id,title,content,excerpt,link,date,meta`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Function to check if content contains interpressnews.ge
function checkForInterPressNews(content) {
  if (content.includes('interpressnews.ge')) {
    console.log('Content contains interpressnews.ge');
    return true;
  } else {
    console.log('Content does NOT contain interpressnews.ge');
    return false;
  }
}

// Function to manually update a post's source
async function updatePostSource(accessToken, postId, source) {
  console.log(`Manually updating post ${postId} with source: ${source}`);

  try {
    // First, add the source to the content
    const post = await fetchPost(accessToken, postId);
    if (!post) {
      console.error(`Could not fetch post ${postId}`);
      return false;
    }

    // Check if the content already has a source line
    let content = post.content.rendered;
    if (content.includes('メディアソース:')) {
      console.log('Content already has a source line, updating it');
      content = content.replace(/メディアソース:.*?<\/p>/g, `メディアソース: ${source}</p>`);
    } else {
      console.log('Adding source line to content');
      content = content + `\n\n<p><small>メディアソース: ${source}</small></p>`;
    }

    // Update the post
    const response = await axios.post(`${WP_API_URL}/posts/${postId}`, {
      content: content,
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
    console.log('Starting post content check...');
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // List of post IDs to check
    const postIds = [145]; // Add more IDs as needed
    
    for (const postId of postIds) {
      const post = await fetchPost(accessToken, postId);
      if (post) {
        console.log(`\nPost ${postId}: ${post.title.rendered}`);
        console.log(`Meta:`, post.meta);
        
        // Check content for interpressnews.ge
        const hasInterPressNews = checkForInterPressNews(post.content.rendered);
        
        // If it contains interpressnews.ge, update the source
        if (hasInterPressNews) {
          await updatePostSource(accessToken, postId, 'interpressnews.ge');
        }
      }
    }
    
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
});
