// This script tests the article processing flow without using the API endpoint
const { processArticles } = require('../lib/scheduler');

console.log('Starting manual test of article processing flow...');

// Run the process articles function directly
processArticles()
  .then(() => {
    console.log('Article processing completed successfully');
  })
  .catch((error) => {
    console.error('Error during article processing:', error);
  });