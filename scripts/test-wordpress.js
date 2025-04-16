// Test script for WordPress.com API
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testWordPress() {
  const WP_API_URL = process.env.WORDPRESS_API_URL;
  const WP_CLIENT_ID = process.env.WORDPRESS_CLIENT_ID;
  const WP_CLIENT_SECRET = process.env.WORDPRESS_CLIENT_SECRET;
  const WP_USERNAME = process.env.WORDPRESS_USERNAME;
  const WP_PASSWORD = process.env.WORDPRESS_PASSWORD;

  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return;
  }

  if (!WP_CLIENT_ID || !WP_CLIENT_SECRET) {
    console.error('WordPress client ID or client secret not configured');
    return;
  }

  console.log('Testing WordPress.com API...');
  console.log(`API URL: ${WP_API_URL}`);
  console.log(`Client ID: ${WP_CLIENT_ID}`);

  try {
    // First, try to get posts (should work without authentication)
    console.log('\nTesting GET /posts (no auth required)...');
    const postsResponse = await fetch(`${WP_API_URL}/posts?per_page=1`);

    if (!postsResponse.ok) {
      const errorText = await postsResponse.text();
      console.error(`WordPress API error status: ${postsResponse.status} ${postsResponse.statusText}`);
      console.error(`WordPress API error details: ${errorText}`);
      throw new Error(`WordPress API error: ${postsResponse.statusText}`);
    }

    const postsData = await postsResponse.json();
    console.log(`Successfully retrieved ${postsData.length} posts`);

    // Now try to create a test post with client credentials
    console.log('\nTesting POST /posts with client credentials...');

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

    const createResponse = await fetch(`${WP_API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        title: 'Test Post - Please Delete',
        content: 'This is a test post to verify API authentication. Please delete.',
        status: 'draft' // Use draft to avoid publishing test content
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error(`WordPress API error status: ${createResponse.status} ${createResponse.statusText}`);
      console.error(`WordPress API error details: ${errorText}`);
      throw new Error(`WordPress API error: ${createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    console.log('Successfully created test post!');
    console.log(`Post ID: ${createData.id}`);
    console.log(`Post status: ${createData.status}`);
    console.log(`Post link: ${createData.link}`);

    // Clean up by deleting the test post
    console.log('\nCleaning up - deleting test post...');
    const deleteResponse = await fetch(`${WP_API_URL}/posts/${createData.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error(`WordPress API error status: ${deleteResponse.status} ${deleteResponse.statusText}`);
      console.error(`WordPress API error details: ${errorText}`);
      throw new Error(`WordPress API error: ${deleteResponse.statusText}`);
    }

    console.log('Test post deleted successfully');
    console.log('\nWordPress.com API test completed successfully!');
  } catch (error) {
    console.error('Error testing WordPress.com API:', error);
  }
}

testWordPress();
