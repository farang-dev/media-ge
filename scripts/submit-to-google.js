// Script to submit URLs to Google for indexing
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// WordPress.com API URL
const WP_API_URL = process.env.WORDPRESS_API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fumixo5.wordpress.com';

// Google Indexing API requires OAuth2 authentication
// This script provides instructions for manual submission since API requires setup
async function submitToGoogle() {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return;
  }

  console.log('Fetching recent posts to submit to Google...');
  try {
    // Get recent posts (last 24 hours)
    const recentPosts = await getRecentPosts();
    
    if (!recentPosts || recentPosts.length === 0) {
      console.log('No recent posts found to submit');
      return;
    }
    
    console.log(`Found ${recentPosts.length} recent posts`);
    
    // Generate list of URLs for manual submission
    console.log('\nTo manually submit these URLs to Google:');
    console.log('1. Go to Google Search Console (https://search.google.com/search-console)');
    console.log('2. Select your property');
    console.log('3. Go to URL Inspection tool');
    console.log('4. Submit each of these URLs:');
    
    recentPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.link}`);
    });
    
    // Generate a Google Search Console batch URL submission file
    generateBatchFile(recentPosts);
  } catch (error) {
    console.error('Error submitting to Google:', error);
  }
}

async function getRecentPosts() {
  try {
    // Get posts from the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const response = await fetch(`${WP_API_URL}/posts?per_page=100&status=publish`);
    
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.statusText}`);
    }
    
    const posts = await response.json();
    
    // Filter posts published in the last 24 hours
    return posts.filter(post => {
      const pubDate = new Date(post.date);
      return pubDate > oneDayAgo;
    });
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }
}

function generateBatchFile(posts) {
  // Create a text file with URLs for batch submission
  const fs = require('fs');
  const urls = posts.map(post => post.link).join('\\n');
  
  fs.writeFileSync('google-submit-urls.txt', urls);
  console.log('\nA file with all URLs has been created: google-submit-urls.txt');
  console.log('You can use this file for batch URL submission in Google Search Console.');
}

// Run the submission script
submitToGoogle();
