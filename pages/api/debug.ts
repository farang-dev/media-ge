import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const WP_API_URL = process.env.WORDPRESS_API_URL;
  
  if (!WP_API_URL) {
    return res.status(500).json({ error: 'WordPress API URL not configured' });
  }
  
  try {
    // Try to fetch posts from WordPress
    const response = await fetch(`${WP_API_URL}/posts?per_page=5`);
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `WordPress API error: ${response.statusText}`,
        status: response.status,
        url: `${WP_API_URL}/posts?per_page=5`
      });
    }
    
    const posts = await response.json();
    
    return res.status(200).json({
      success: true,
      wordpress_url: WP_API_URL,
      posts_count: posts.length,
      posts: posts.map((post: any) => ({
        id: post.id,
        title: post.title.rendered,
        slug: post.slug,
        date: post.date
      }))
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error connecting to WordPress API',
      message: error instanceof Error ? error.message : String(error),
      wordpress_url: WP_API_URL
    });
  }
}
