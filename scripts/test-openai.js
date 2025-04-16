// Test script for OpenAI API
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testOpenAI() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured');
    console.error('Please set OPENAI_API_KEY in your .env file');
    console.error('You can get an API key from https://platform.openai.com/api-keys');
    return;
  }

  console.log('Testing OpenAI API...');
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'Say hello!'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error status: ${response.status} ${response.statusText}`);
      console.error(`OpenAI API error details: ${errorText}`);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI API response:');
    console.log(data.choices[0].message.content);
    console.log('\nAPI test successful!');
  } catch (error) {
    console.error('Error testing OpenAI API:', error);
  }
}

testOpenAI();
