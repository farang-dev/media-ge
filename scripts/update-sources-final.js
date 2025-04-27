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

// Function to fetch all posts
async function fetchAllPosts(accessToken) {
  console.log('Fetching all posts...');
  try {
    const response = await axios.get(`${WP_API_URL}/posts?per_page=100&_fields=id,title,content,excerpt,link,date,meta`, {
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

// Function to determine the correct source from content
function determineCorrectSource(content, link) {
  // First check the content for specific URLs
  if (content.includes('interpressnews.ge')) {
    return 'interpressnews.ge';
  } else if (content.includes('civil.ge')) {
    return 'civil.ge';
  } else if (content.includes('police.ge')) {
    return 'police.ge';
  } else if (content.includes('facebook.com')) {
    return 'facebook.com';
  }
  
  // If no match in content, try the link
  if (link) {
    try {
      const url = new URL(link);
      if (url.hostname.includes('interpressnews.ge')) {
        return 'interpressnews.ge';
      } else if (url.hostname.includes('civil.ge')) {
        return 'civil.ge';
      }
      return url.hostname.replace('www.', '');
    } catch (error) {
      console.error(`Error extracting source from link ${link}:`, error);
    }
  }
  
  // Default to civil.ge if no specific source is found
  return 'civil.ge';
}

// Function to update a post's source
async function updatePostSource(accessToken, postId, content, link, currentSource) {
  // Determine the correct source
  const correctSource = determineCorrectSource(content, link);
  
  // If the source is already correct, skip the update
  if (currentSource === correctSource) {
    console.log(`Post ${postId} already has correct source: ${correctSource}`);
    return true;
  }

  console.log(`Updating post ${postId} from source ${currentSource} to ${correctSource}`);

  try {
    // Check if the content already has a source line
    let updatedContent = content;
    if (content.includes('メディアソース:')) {
      console.log('Content already has a source line, updating it');
      updatedContent = content.replace(/メディアソース:.*?<\/p>/g, `メディアソース: ${correctSource}</p>`);
    } else {
      console.log('Adding source line to content');
      updatedContent = content + `\n\n<p><small>メディアソース: ${correctSource}</small></p>`;
    }

    // Update the post
    const response = await axios.post(`${WP_API_URL}/posts/${postId}`, {
      content: updatedContent,
      meta: {
        source: correctSource,
        article_source: correctSource
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
    console.log('Starting source check and fix...');
    
    // Get access token
    const accessToken = await getAccessToken();
    
    // Fetch all posts
    const posts = await fetchAllPosts(accessToken);
    
    // Check and update each post
    let correctCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    
    for (const post of posts) {
      try {
        // Get the current source from meta
        const currentSource = post.meta?.source || post.meta?.article_source || 'civil.ge';
        
        console.log(`\nPost ${post.id}: ${post.title.rendered}`);
        console.log(`Current source: ${currentSource}`);
        
        // Update the post if needed
        const success = await updatePostSource(
          accessToken, 
          post.id, 
          post.content.rendered,
          post.link,
          currentSource
        );
        
        if (success) {
          if (currentSource === determineCorrectSource(post.content.rendered, post.link)) {
            correctCount++;
          } else {
            updatedCount++;
          }
        } else {
          failedCount++;
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error);
        failedCount++;
      }
    }
    
    console.log('\n=== SOURCE FIX SUMMARY ===');
    console.log(`Total posts processed: ${posts.length}`);
    console.log(`Already correct: ${correctCount}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Failed to update: ${failedCount}`);
    console.log('=========================');
    
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
});
