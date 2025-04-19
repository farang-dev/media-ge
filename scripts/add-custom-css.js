// Script to add custom CSS to WordPress site
require('dotenv').config(); // Load environment variables
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const path = require('path');

// WordPress API credentials
const WP_API_URL = process.env.WP_API_URL;
const WP_CLIENT_ID = process.env.WP_CLIENT_ID;
const WP_CLIENT_SECRET = process.env.WP_CLIENT_SECRET;
const WP_USERNAME = process.env.WP_USERNAME;
const WP_PASSWORD = process.env.WP_PASSWORD;

// Read the custom CSS file
const customCssPath = path.join(__dirname, '..', 'custom-styles.css');
const customCss = fs.readFileSync(customCssPath, 'utf8');

async function addCustomCssToWordPress() {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return false;
  }

  console.log('Adding custom CSS to WordPress site...');
  console.log(`Using WordPress API URL: ${WP_API_URL}`);

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

    // Get the current custom CSS
    console.log('Getting current custom CSS...');
    const cssResponse = await fetch(`${WP_API_URL}/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!cssResponse.ok) {
      const errorText = await cssResponse.text();
      console.error(`Error getting current CSS: ${cssResponse.status} ${cssResponse.statusText}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`Error getting current CSS: ${cssResponse.statusText}`);
    }

    const settings = await cssResponse.json();
    
    // Update the custom CSS
    console.log('Updating custom CSS...');
    const updateResponse = await fetch(`${WP_API_URL}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        custom_css: customCss
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`Error updating CSS: ${updateResponse.status} ${updateResponse.statusText}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`Error updating CSS: ${updateResponse.statusText}`);
    }

    console.log('Custom CSS added successfully!');
    return true;
  } catch (error) {
    console.error('Error adding custom CSS:', error);
    return false;
  }
}

// Run the function
addCustomCssToWordPress().catch(error => {
  console.error('Error in main process:', error);
});
