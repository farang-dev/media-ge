// Test script for Hugging Face Inference API
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testHuggingFace() {
  console.log('Testing Hugging Face Inference API...');
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/google/flan-t5-xxl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: 'Rewrite this sentence: The quick brown fox jumps over the lazy dog.'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API error status: ${response.status} ${response.statusText}`);
      console.error(`Hugging Face API error details: ${errorText}`);
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Hugging Face API response:');
    console.log(data);
    console.log('\nAPI test successful!');
  } catch (error) {
    console.error('Error testing Hugging Face API:', error);
  }
}

testHuggingFace();
