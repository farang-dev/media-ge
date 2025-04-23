// Script to verify that all required secrets are set
require('dotenv').config();

// List of required environment variables
const requiredEnvVars = [
  'WORDPRESS_API_URL',
  'WORDPRESS_CLIENT_ID',
  'WORDPRESS_CLIENT_SECRET',
  'WORDPRESS_USERNAME',
  'WORDPRESS_PASSWORD',
  'OPENROUTER_API_KEY',
  'NEXT_PUBLIC_SITE_URL'
];

// Check if all required environment variables are set
let allSet = true;
console.log('Checking required environment variables...');

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  const isSet = !!value;
  const length = value ? value.length : 0;
  
  console.log(`${envVar}: ${isSet ? 'SET' : 'NOT SET'} (length: ${length})`);
  
  if (!isSet) {
    allSet = false;
  }
}

if (allSet) {
  console.log('\nAll required environment variables are set!');
} else {
  console.error('\nSome required environment variables are missing!');
  process.exit(1);
}

// Test OpenRouter API key format
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
if (openRouterApiKey) {
  console.log('\nChecking OpenRouter API key format...');
  
  if (openRouterApiKey.startsWith('sk-')) {
    console.log('OpenRouter API key format looks correct (starts with "sk-")');
  } else {
    console.warn('OpenRouter API key format may be incorrect (does not start with "sk-")');
  }
  
  // Print first and last few characters
  const firstChars = openRouterApiKey.substring(0, 5);
  const lastChars = openRouterApiKey.substring(openRouterApiKey.length - 5);
  console.log(`OpenRouter API key: ${firstChars}...${lastChars}`);
}
