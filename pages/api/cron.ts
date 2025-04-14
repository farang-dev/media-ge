import { NextApiRequest, NextApiResponse } from 'next';
import { processArticles } from '../../lib/scheduler';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify the request is authorized (optional but recommended)
  const apiKey = req.headers['x-api-key'];
  const configuredApiKey = process.env.CRON_API_KEY;
  
  if (configuredApiKey && apiKey !== configuredApiKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Process articles in the background
    processArticles().catch(error => {
      console.error('Background processing error:', error);
    });
    
    // Return success immediately without waiting for processing to complete
    return res.status(200).json({ success: true, message: 'Article processing started' });
  } catch (error) {
    console.error('Error starting article processing:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}