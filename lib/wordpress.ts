export interface Post {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  link: string;
  date: string;
  modified: string; // 追加：投稿の更新日時
  author: number;
  slug: string;
  source?: string; // Added source field to store the domain of the original article
  meta?: {
    yoast_title?: string;
    yoast_description?: string;
    _yoast_wpseo_title?: string;
    _yoast_wpseo_metadesc?: string;
    source?: string;
    article_source?: string;
  };
  _embedded?: {
    author?: Array<{
      name: string;
    }>;
  };
}

const WP_API_URL = process.env.WORDPRESS_API_URL;

export interface PaginatedPosts {
  posts: Post[];
  totalPages: number;
  totalPosts: number;
}

export async function fetchPosts(page: number = 1, perPage: number = 20): Promise<PaginatedPosts> {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return {
      posts: getDummyPosts(),
      totalPages: 1,
      totalPosts: getDummyPosts().length
    };
  }

  try {
    const response = await fetch(
      `${WP_API_URL}/posts?_embed=author&per_page=${perPage}&page=${page}&_fields=id,title,content,excerpt,link,date,author,slug,meta,_embedded`,
      {
        next: { revalidate: 10 }, // Revalidate every 10 seconds during development
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const posts = await response.json();
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);

    return {
      posts: posts.map(formatPost),
      totalPages,
      totalPosts
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      posts: getDummyPosts(),
      totalPages: 1,
      totalPosts: getDummyPosts().length
    };
  }
}

export async function fetchPost(slug: string): Promise<Post | null> {
  console.log(`Attempting to fetch post with slug: "${slug}"`);

  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return null;
  }

  console.log(`Using WordPress API URL: ${WP_API_URL}`);

  try {
    // Construct the API URL
    const apiUrl = `${WP_API_URL}/posts?slug=${encodeURIComponent(slug)}&_embed=author&_fields=id,title,content,excerpt,link,date,author,slug,meta,_embedded`;
    console.log(`Making request to: ${apiUrl}`);

    const response = await fetch(
      apiUrl,
      {
        next: { revalidate: 10 },
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch post: ${response.statusText}`);
    }

    const posts = await response.json();
    console.log(`Received ${posts.length} posts from API`);

    if (posts.length === 0) {
      console.log(`No posts found with slug: "${slug}"`);

      // For debugging: Let's try to fetch all posts to see what's available
      console.log('Attempting to fetch all posts to check available slugs...');
      const allPostsResponse = await fetch(`${WP_API_URL}/posts?per_page=5`, {
        next: { revalidate: 10 },
        headers: { 'Accept': 'application/json' }
      });

      if (allPostsResponse.ok) {
        const allPosts = await allPostsResponse.json();
        console.log('Available posts:');
        allPosts.forEach((post: any) => {
          console.log(`- ID: ${post.id}, Slug: "${post.slug}", Title: "${post.title.rendered}"`);
        });
      } else {
        console.log('Could not fetch all posts for debugging');
      }

      return null;
    }

    console.log(`Found post with title: "${posts[0].title.rendered}"`);
    return formatPost(posts[0]);
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

function formatPost(post: any): Post {
  // Extract source from meta field if available
  let source = '';

  // First, check if the content contains a source indicator
  if (post.content && post.content.rendered) {
    const content = post.content.rendered;

    // Check for specific patterns in the content
    if (content.includes('interpressnews.ge')) {
      source = 'interpressnews.ge';
    } else if (content.includes('メディアソース: interpressnews.ge')) {
      source = 'interpressnews.ge';
    } else if (content.includes('civil.ge')) {
      source = 'civil.ge';
    } else if (content.includes('メディアソース: civil.ge')) {
      source = 'civil.ge';
    }
  }

  // If no source found in content, try meta fields
  if (!source && post.meta) {
    if (post.meta.article_source) {
      source = post.meta.article_source;
    } else if (post.meta.source) {
      source = post.meta.source;
    }
  }

  // If still no source, try to extract from the link
  if (!source && post.link) {
    try {
      const url = new URL(post.link);
      if (url.hostname.includes('interpressnews.ge')) {
        source = 'interpressnews.ge';
      } else if (url.hostname.includes('civil.ge')) {
        source = 'civil.ge';
      } else if (url.hostname.includes('police.ge')) {
        source = 'police.ge';
      } else if (url.hostname.includes('facebook.com')) {
        source = 'facebook.com';
      } else if (url.hostname.includes('wordpress.com')) {
        // Don't use wordpress.com as a source - use the default instead
        source = '';
      } else if (!url.hostname.includes('geinfojp')) {
        // Only use the hostname as source if it's not our own site
        source = url.hostname.replace('www.', '');
      }
    } catch (error) {
      console.error('Error extracting source from link:', error);
    }
  }

  // Last resort fallback
  if (!source) {
    // Fallback to TARGET_WEBSITE environment variable
    const TARGET_WEBSITE = process.env.TARGET_WEBSITE || 'https://civil.ge/ka/archives/category/news-ka';
    try {
      const url = new URL(TARGET_WEBSITE);
      source = url.hostname.replace('www.', '');
    } catch (error) {
      console.error('Error extracting source from TARGET_WEBSITE:', error);
      // Default to civil.ge if we can't extract the domain
      source = 'civil.ge';
    }
  }

  return {
    id: post.id,
    title: {
      rendered: post.title.rendered
    },
    content: {
      rendered: post.content.rendered
    },
    excerpt: {
      rendered: post.excerpt.rendered
    },
    link: post.link,
    date: post.date,
    modified: post.modified || post.date, // 修正日時がない場合は投稿日時を使用
    author: post.author,
    slug: post.slug,
    source: source,
    _embedded: post._embedded || {
      author: [{
        name: 'Anonymous'
      }]
    }
  };
}

// Dummy data for development
function getDummyPosts(): Post[] {
  return [
    {
      id: 1,
      title: {
        rendered: "Local WordPress Not Connected"
      },
      content: {
        rendered: "Please make sure your local WordPress instance is running at the correct URL"
      },
      excerpt: {
        rendered: "Check your WordPress connection"
      },
      link: "#",
      date: new Date().toISOString(),
      modified: new Date().toISOString(),
      author: 1,
      slug: "local-wordpress-not-connected",
      source: "civil.ge",
      _embedded: {
        author: [{
          name: "System"
        }]
      }
    }
  ];
}

export async function fetchRelatedPosts(currentPostId: number, count: number = 3): Promise<Post[]> {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return [];
  }

  try {
    // Fetch recent posts excluding the current one
    const response = await fetch(
      `${WP_API_URL}/posts?_embed=author&per_page=${count + 1}&exclude=${currentPostId}&_fields=id,title,content,excerpt,link,date,author,slug,meta,_embedded`,
      {
        next: { revalidate: 10 },
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch related posts: ${response.statusText}`);
    }

    const posts = await response.json();

    // Return only the requested number of posts
    return posts.slice(0, count).map(formatPost);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

export async function publishPost(title: string, content: string, metaTitle?: string, metaDescription?: string): Promise<boolean> {
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    return false;
  }

  const WP_USERNAME = process.env.WORDPRESS_USERNAME;
  const WP_API_KEY = process.env.WORDPRESS_API_KEY;

  if (!WP_USERNAME || !WP_API_KEY) {
    console.error('WordPress credentials not configured');
    return false;
  }

  try {
    // Process the content to clean up any formatting issues
    const { cleanupArticle } = await import('./article-processor');
    let cleanedContent = cleanupArticle(content);

    // Additional cleanup for any remaining formatting issues
    // Remove any remaining related articles section
    cleanedContent = cleanedContent.replace(/(?:Read More|Related Articles):([\s\S]*?)$/i, '');

    // Remove any remaining about the author section
    cleanedContent = cleanedContent.replace(/(?:About the Author)([\s\S]*?)$/i, '');

    // Create basic auth header
    const basicAuth = Buffer.from(`${WP_USERNAME}:${WP_API_KEY}`).toString('base64');

    const response = await fetch(`${WP_API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      },
      body: JSON.stringify({
        title,
        content: cleanedContent,
        status: 'publish',
        meta: {
          _yoast_wpseo_title: metaTitle || title,
          _yoast_wpseo_metadesc: metaDescription || cleanedContent.substring(0, 155) + '...'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress API error:', errorText);
      return false;
    }

    const postData = await response.json();
    console.log(`Article posted successfully! Post ID: ${postData.id}`);
    return true;
  } catch (error) {
    console.error('Error posting to WordPress:', error);
    return false;
  }
}
