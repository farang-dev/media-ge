// Test script for OpenRouter API
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testOpenRouter() {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API key not configured');
    console.error('Please set OPENROUTER_API_KEY in your .env file');
    return;
  }

  console.log('Testing OpenRouter API...');
  try {
    // First, try a simple models list request which doesn't require much authentication
    const modelsResponse = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      }
    });

    if (!modelsResponse.ok) {
      const errorText = await modelsResponse.text();
      console.error(`OpenRouter API error status: ${modelsResponse.status} ${modelsResponse.statusText}`);
      console.error(`OpenRouter API error details: ${errorText}`);

      if (modelsResponse.status === 403) {
        console.error('Your IP address might be blocked by OpenRouter.');
      }

      throw new Error(`OpenRouter API error: ${modelsResponse.statusText}`);
    }

    const modelsData = await modelsResponse.json();
    console.log('OpenRouter API models response:');
    console.log(`Found ${modelsData.data.length} models available`);

    // Now try a simple completion to test full API access
    const completionResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://lead-media.vercel.app/',
        'X-Title': 'Unmanned Newsroom'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro-exp-03-25:free',
        messages: [
          {
            role: 'user',
            content: 'Say hello!'
          }
        ]
      })
    });

    if (!completionResponse.ok) {
      const errorText = await completionResponse.text();
      console.error(`OpenRouter completion API error status: ${completionResponse.status} ${completionResponse.statusText}`);
      console.error(`OpenRouter completion API error details: ${errorText}`);

      if (completionResponse.status === 403) {
        console.error('Your IP address might be blocked for completions by OpenRouter.');
      }

      throw new Error(`OpenRouter completion API error: ${completionResponse.statusText}`);
    }

    const completionData = await completionResponse.json();
    console.log('OpenRouter API completion response:');
    console.log(completionData.choices[0].message.content);
    console.log('\nAPI test successful!');
  } catch (error) {
    console.error('Error testing OpenRouter API:', error);
  }
}

testOpenRouter();
