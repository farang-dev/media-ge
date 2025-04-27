# Next.js Syntax Guide for ジョージア ニュース

This guide explains how Next.js is used in the ジョージア ニュース (Georgia News) project. It's designed for students who are learning Next.js and want to understand real-world code examples.

## Table of Contents

1. [Project Structure](#project-structure)
2. [App Router](#app-router)
3. [Components](#components)
4. [Data Fetching](#data-fetching)
5. [Routing](#routing)
6. [Metadata](#metadata)
7. [Styling with Tailwind CSS](#styling-with-tailwind-css)
8. [Server and Client Components](#server-and-client-components)

## Project Structure

The project follows the Next.js 13+ App Router structure. In Next.js, the file structure directly determines how your website is organized:

```
/app                  # Main application directory (App Router)
  /page.tsx           # Homepage - this file creates the main page at yourdomain.com
  /layout.tsx         # Root layout - this wraps around all pages
  /globals.css        # Global styles that apply to the whole site
  /post/[slug]/       # Dynamic route for individual posts - the [slug] means it's variable
    /page.tsx         # Post page component - this creates pages like yourdomain.com/post/article-name
/components           # Reusable UI components like buttons, cards, etc.
/lib                  # Utility functions and API clients
/public               # Static assets like images, fonts, etc.
/scripts              # Utility scripts for data processing
```

Each folder in the `/app` directory becomes a route in your website. For example:
- `/app/about/page.tsx` would create a page at `yourdomain.com/about`
- `/app/contact/page.tsx` would create a page at `yourdomain.com/contact`

## App Router

Next.js 13+ uses the App Router pattern, which means the URL structure of your website matches your folder structure. This makes it easy to understand how your website is organized.

### Root Layout (`app/layout.tsx`)

The Root Layout is like the frame around your entire website. It contains elements that appear on every page:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Load the Inter font from Google Fonts
const inter = Inter({ subsets: ['latin'] })

// Define website metadata (for SEO and browser tabs)
export const metadata: Metadata = {
  title: 'ジョージアニュース',
  description: 'ジョージアの最近のニュースを日本人の方向けて日本語でお届け',
  // ... other metadata
}

// The RootLayout function wraps around all pages
export default function RootLayout({
  children,  // This represents the content of each page
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>
        <div className="min-h-screen">
          {children}  {/* This is where each page's content will be inserted */}
        </div>
      </body>
    </html>
  )
}
```

Let's break down what this layout does:

1. **Imports necessary tools**:
   - `Metadata` type from Next.js for defining website information
   - `Inter` font from Google Fonts for consistent typography
   - Global CSS styles from './globals.css'

2. **Sets up the font**:
   - `const inter = Inter({ subsets: ['latin'] })` loads the Inter font

3. **Defines website metadata**:
   - Sets the title that appears in browser tabs
   - Provides a description for search engines

4. **Creates the layout structure**:
   - The `RootLayout` function takes `children` as a parameter
   - Returns an HTML structure with:
     - `<html>` tag with language set to English
     - `<body>` tag with the Inter font applied and a light gray background
     - A div that takes minimum full screen height
     - The `{children}` placeholder where each page's content will appear

### Home Page (`app/page.tsx`)

The Home Page is the main landing page of the website. Let's look at how it's built:

```tsx
import { fetchPosts } from '@/lib/wordpress';  // Function to get posts from WordPress
import ArticleList from '@/components/ArticleList';  // Component to display a list of articles
import { Suspense } from 'react';  // Used for showing loading states
import Link from 'next/link';  // Used for navigation links

// This defines what information the Posts component needs
interface PostsProps {
  page: number;  // Which page of articles to show
}

// This component fetches and displays posts for a specific page
async function Posts({ page }: PostsProps) {
  // Fetch posts from WordPress
  const { posts, totalPages } = await fetchPosts(page);
  // Return the ArticleList component with the fetched data
  return <ArticleList posts={posts} currentPage={page} totalPages={totalPages} />;
}

// The main Home component that gets exported as the page
export default function Home({
  searchParams,  // Next.js automatically provides URL parameters
}: {
  // This defines the type of searchParams
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Get the current page from the URL query parameters (like ?page=2)
  const pageParam = searchParams.page;

  // Convert the page parameter to a number (default to page 1)
  const currentPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;

  // Make sure the page number is valid (not NaN, not less than 1)
  const page = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header section with site title and description */}
      <header className="mb-8 bg-white p-6 rounded-lg shadow-sm border-l-4 border-georgian-red">
        <Link href="/">
          <h1 className="text-3xl font-bold text-georgian-red hover:underline cursor-pointer">
            🇬🇪 ジョージア ニュース
          </h1>
        </Link>
        <p className="text-sm text-gray-600 mt-2">
          ジョージアで起きている最新のニュースや社会の動き、政治・経済に関する話題を、日本語でお届けします。
        </p>
      </header>

      {/* Suspense provides a loading state while Posts is fetching data */}
      <Suspense fallback={<div className="p-8 text-center text-gray-600 bg-white rounded-lg shadow-sm">
        記事を読み込み中...
      </div>}>
        <Posts page={page} />
      </Suspense>
    </main>
  );
}
```

Let's break down this code step by step:

1. **Imports**:
   - `fetchPosts`: A function that gets articles from WordPress
   - `ArticleList`: A component that displays a list of articles
   - `Suspense`: A React feature that shows a loading state while content is loading
   - `Link`: A Next.js component for navigation without full page reloads

2. **Posts Component**:
   - This is an `async` function component that fetches data
   - It takes a `page` number as input
   - It calls `fetchPosts` to get articles for that page
   - It returns an `ArticleList` component with the fetched data

3. **Home Component**:
   - This is the main page component
   - It receives `searchParams` automatically from Next.js
   - It extracts the page number from URL parameters (like `?page=2`)
   - It validates the page number to ensure it's a valid number

4. **Page Structure**:
   - `<main>`: The main container with maximum width and padding
   - `<header>`: Contains the site title and description
   - `<Link>`: Makes the title clickable and navigates to the homepage
   - `<Suspense>`: Shows a loading message while posts are being fetched
   - `<Posts>`: The component that fetches and displays the articles

5. **Styling**:
   - Uses Tailwind CSS classes for styling (like `max-w-4xl`, `mx-auto`, etc.)
   - The Georgian flag red color is used for the title and left border
   - The header has a white background, rounded corners, and a subtle shadow

## Components

Components are reusable pieces of UI that you can combine to build your pages. Think of them like building blocks that you can use over and over again.

### ArticleItem Component (`components/ArticleItem.tsx`)

This component displays a single article in the list. It's used for each news article on the homepage:

```tsx
import { Post } from '@/lib/wordpress';  // Import the Post type definition
import { formatDistanceToNow } from 'date-fns';  // For formatting dates like "2 hours ago"
import Link from 'next/link';  // For creating links to other pages

// Define what information this component needs
interface ArticleItemProps {
  post: Post;  // The article data
  index: number;  // The position number in the list
}

export default function ArticleItem({ post, index }: ArticleItemProps) {
  // Format the date as a relative time (like "2 hours ago")
  const timeAgo = formatDistanceToNow(new Date(post.date), { addSuffix: true });

  // Get the author name, or use "Anonymous" if not available
  const author = post._embedded?.author?.[0]?.name || 'Anonymous';

  // This function cleans up HTML and shortens the text to a reasonable length
  const truncateExcerpt = (html: string, maxLength: number = 180): string => {
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '');

    // Decode HTML entities (like &amp; to &)
    text = text.replace(/&nbsp;/g, ' ')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'")
               .replace(/&#8230;/g, '...')
               // ... more replacements

    // Shorten the text if it's too long
    if (text.length <= maxLength) return text;

    // Try to cut at a sentence end
    const firstSentence = text.split('.')[0];
    if (firstSentence && firstSentence.length <= maxLength) {
      return firstSentence + '.';
    }

    // Otherwise cut at a word boundary
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  };

  // Create a clean, shortened excerpt
  const excerpt = truncateExcerpt(post.excerpt.rendered);

  return (
    <article className="flex gap-2 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Article number */}
      <span className="text-gray-500 w-6 text-right flex-shrink-0">{index}.</span>

      <div className="flex-grow">
        {/* Article title (as a link to the full article) */}
        <Link
          href={`/post/${post.slug}`}
          className="text-gray-900 hover:text-georgian-red hover:underline font-medium block mb-2"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />

        {/* Article excerpt (shortened content) */}
        <div className="text-sm text-gray-600 mb-1 line-clamp-3 h-auto max-h-16 overflow-hidden">
          {excerpt}
        </div>

        {/* Source information (only shown if available) */}
        {post.source && (
          <div className="text-xs text-gray-500 mb-0.5">
            メディアソース: {post.source}
          </div>
        )}

        {/* Publication time and author */}
        <div className="text-xs text-gray-500">
          {timeAgo} by {author}
        </div>
      </div>
    </article>
  );
}
```

This component does several important things:

1. **Processes data**: It takes raw data from WordPress and formats it for display
   - Converts dates to relative time (like "2 hours ago")
   - Cleans HTML from the excerpt and shortens it
   - Handles missing data with fallbacks (like using "Anonymous" if no author)

2. **Creates a link**: The title is a clickable link to the full article
   - Uses Next.js `Link` component for fast navigation
   - The URL is built using the article's slug (like `/post/article-name`)

3. **Conditional rendering**: Only shows the source if it exists
   - Uses the `&&` operator for conditional rendering
   - This is a common pattern in React: `{condition && <Element />}`

4. **Uses dangerouslySetInnerHTML**: This is needed because WordPress titles might contain HTML
   - This is called "dangerous" because it can be a security risk if not used carefully
   - Only use it with trusted content (like from your own WordPress site)

### ArticleList Component (`components/ArticleList.tsx`)

This component displays a list of articles and pagination controls:

```tsx
import { Post } from '@/lib/wordpress';  // Import the Post type
import ArticleItem from './ArticleItem';  // Import the ArticleItem component
import Pagination from './Pagination';  // Import the Pagination component

// Define what information this component needs
interface ArticleListProps {
  posts: Post[];  // Array of articles
  currentPage: number;  // Current page number
  totalPages: number;  // Total number of pages
}

export default function ArticleList({ posts, currentPage, totalPages }: ArticleListProps) {
  return (
    <>
      {/* Container for the list of articles */}
      <div className="space-y-2 bg-white rounded-lg shadow-sm p-4">
        {/* Map through each post and create an ArticleItem */}
        {posts.map((post, index) => (
          <ArticleItem
            key={post.id}  // Unique key for React's list rendering
            post={post}  // Pass the post data
            index={((currentPage - 1) * 20) + index + 1}  // Calculate the overall index
          />
        ))}
      </div>

      {/* Pagination controls */}
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  );
}
```

This component demonstrates important React patterns:

1. **Component composition**: It combines smaller components to build a more complex UI
   - Uses `ArticleItem` for each article
   - Uses `Pagination` for the page navigation

2. **List rendering**: It uses the `map` function to create multiple components from an array
   - Each item needs a unique `key` prop (here we use the post ID)
   - This helps React efficiently update the DOM when data changes

3. **Fragment syntax**: The `<>...</>` is called a Fragment
   - It lets you return multiple elements without adding an extra div
   - Useful when you don't want to add an unnecessary container element

4. **Calculated props**: It calculates the correct index for each article
   - `((currentPage - 1) * 20) + index + 1` gives the overall position
   - For example, on page 2, the first article would be number 21

### FullArticle Component (`components/FullArticle.tsx`)

This component displays a complete article on its own page:

```tsx
import { Post } from '@/lib/wordpress';  // Import the Post type
import { formatDistanceToNow } from 'date-fns';  // For date formatting
import Link from 'next/link';  // For navigation links

// Define what information this component needs
interface FullArticleProps {
  post: Post;  // The complete article data
}

export default function FullArticle({ post }: FullArticleProps) {
  // Format the date as a relative time (like "2 hours ago")
  const timeAgo = formatDistanceToNow(new Date(post.date), { addSuffix: true });

  // Get the author name, or use "Anonymous" if not available
  const author = post._embedded?.author?.[0]?.name || 'Anonymous';

  // Get the content and clean it up if needed
  let processedContent = post.content.rendered;

  // Additional content processing could happen here
  // For example, removing unwanted elements or fixing formatting

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link to homepage */}
      <Link href="/" className="text-georgian-red hover:underline mb-4 inline-block">
        ← Back to all articles
      </Link>

      {/* Article title */}
      <h1
        className="text-3xl font-bold mb-4 text-gray-900"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />

      {/* Publication info */}
      <div className="text-sm text-gray-500 mb-8">
        Posted {timeAgo} by {author}
      </div>

      {/* Article content */}
      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </article>
  );
}
```

This component shows how to:

1. **Create a full-page layout**: It structures a complete article page
   - Has navigation (back link)
   - Has a clear visual hierarchy (title, metadata, content)
   - Uses appropriate spacing and typography

2. **Use Tailwind's typography plugin**: The `prose` class automatically styles article content
   - Makes headings, paragraphs, lists, etc. look good without manual styling
   - Works well with content from a CMS like WordPress

3. **Handle HTML content safely**: Uses `dangerouslySetInnerHTML` for WordPress content
   - The title and content from WordPress contain HTML that needs to be rendered
   - This approach preserves formatting from the original article

## Data Fetching

Next.js 13+ makes it easy to fetch data from external sources like APIs. In this project, we fetch news articles from a WordPress site.

### WordPress API Client (`lib/wordpress.ts`)

This file contains the code that connects to the WordPress API and gets article data:

```tsx
// Define the structure of a Post object
export interface Post {
  id: number;  // Unique identifier for the post
  title: {
    rendered: string;  // The post title (may contain HTML)
  };
  content: {
    rendered: string;  // The full post content (contains HTML)
  };
  excerpt: {
    rendered: string;  // A short summary (may contain HTML)
  };
  link: string;  // URL to the original post
  date: string;  // Publication date
  author: number;  // Author ID
  slug: string;  // URL-friendly version of the title
  source?: string;  // Source website (optional)
  meta?: {  // Additional metadata (optional)
    // SEO metadata from WordPress
    title?: string;
    description?: string;
    // Source information
    source?: string;
    article_source?: string;
  };
  _embedded?: {  // Related data that's included in the response
    author?: Array<{
      name: string;  // Author name
    }>;
  };
}

// Function to fetch a list of posts with pagination
export async function fetchPosts(page: number = 1, perPage: number = 20): Promise<PaginatedPosts> {
  // Check if the WordPress API URL is configured
  if (!WP_API_URL) {
    console.error('WordPress API URL not configured');
    // Return dummy data if the API URL is not available
    return {
      posts: getDummyPosts(),
      totalPages: 1,
      totalPosts: getDummyPosts().length
    };
  }

  try {
    // Make a request to the WordPress API
    const response = await fetch(
      // Build the URL with query parameters
      `${WP_API_URL}/posts?_embed=author&per_page=${perPage}&page=${page}&_fields=id,title,content,excerpt,link,date,author,slug,meta,_embedded`,
      {
        // Cache control: refresh data every 10 seconds
        next: { revalidate: 10 },
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    // Parse the JSON response
    const posts = await response.json();

    // Get pagination information from headers
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);

    // Return the formatted posts and pagination info
    return {
      posts: posts.map(formatPost),  // Process each post
      totalPages,
      totalPosts
    };
  } catch (error) {
    // Handle any errors
    console.error('Error fetching posts:', error);
    return {
      posts: getDummyPosts(),
      totalPages: 1,
      totalPosts: getDummyPosts().length
    };
  }
}

// Function to fetch a single post by its slug
export async function fetchPost(slug: string): Promise<Post | null> {
  // Implementation details...
  // This function works similarly to fetchPosts but gets just one article
  // by its slug (the URL-friendly version of the title)
  return null; // Simplified for this guide
}

// Helper function to process each post from the API
function formatPost(post: any): Post {
  // Extract the source from metadata
  let source = '';

  // Try to get the source from meta fields
  if (post.meta && post.meta.article_source) {
    source = post.meta.article_source;
  } else if (post.meta && post.meta.source) {
    source = post.meta.source;
  } else {
    // If no source in meta, try to extract from the environment variable
    const TARGET_WEBSITE = process.env.TARGET_WEBSITE || 'https://civil.ge/ka/archives/category/news-ka';
    try {
      const url = new URL(TARGET_WEBSITE);
      source = url.hostname.replace('www.', '');
    } catch (error) {
      // Default fallback
      source = 'civil.ge';
    }
  }

  // Return a properly formatted Post object
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    link: post.link,
    date: post.date,
    author: post.author,
    slug: post.slug,
    source: source,
    meta: post.meta,
    _embedded: post._embedded || {
      author: [{
        name: 'Anonymous'
      }]
    }
  };
}
```

This code demonstrates several important concepts:

1. **TypeScript Interfaces**: The `Post` interface defines the structure of article data
   - It specifies what fields to expect (title, content, date, etc.)
   - Optional fields are marked with `?` (like `source?` and `meta?`)
   - Nested structures show the hierarchical nature of the data

2. **Async/Await Pattern**: The `fetchPosts` function uses modern JavaScript for handling asynchronous operations
   - `async function` indicates that the function returns a Promise
   - `await` is used to wait for API responses without blocking the application
   - `try/catch` blocks handle errors that might occur during fetching

3. **Data Transformation**: The `formatPost` function processes raw API data
   - Extracts and normalizes the source information
   - Provides fallbacks for missing data
   - Creates a consistent structure for the rest of the application

4. **Error Handling**: The code gracefully handles various error scenarios
   - Missing API URL
   - Failed API requests
   - Missing data in the response

5. **Caching Strategy**: The `revalidate: 10` option tells Next.js to:
   - Cache the response for 10 seconds
   - Serve cached data for fast responses
   - Refresh the data in the background after the cache expires


## Routing

Next.js makes routing simple by using the file system to create URLs. The structure of your folders and files directly determines the URLs of your website.

### Dynamic Routes (`app/post/[slug]/page.tsx`)

Dynamic routes allow you to create pages that can handle variable parameters. For example, the `[slug]` in the folder name means this page will handle any URL like `/post/any-article-name`.

```tsx
import { fetchPost, fetchRelatedPosts } from '@/lib/wordpress';  // Functions to get article data
import FullArticle from '@/components/FullArticle';  // Component to display a full article
import RelatedArticles from '@/components/RelatedArticles';  // Component to display related articles
import { notFound } from 'next/navigation';  // Function to show a 404 page
import { Metadata } from 'next';  // Type for page metadata
import Link from 'next/link';  // Component for navigation links

// Define what information this page component receives
interface PostPageProps {
  params: {
    slug: string;  // The article slug from the URL
  };
}

// This function generates SEO metadata for the page
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  // Fetch the article data using the slug from the URL
  const post = await fetchPost(params.slug);

  // If the article doesn't exist, return generic metadata
  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    };
  }

  // Get the title and description from the article data
  const metaTitle = post.meta?.title || post.title.rendered;
  const metaDescription = post.meta?.description ||
    post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 155) + '...';

  // Return the metadata for this page
  return {
    title: metaTitle,
    description: metaDescription,
    // OpenGraph metadata for social media sharing
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'article',
      publishedTime: post.date,
      authors: [post._embedded?.author?.[0]?.name || 'Anonymous']
    },
    // Twitter card metadata
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription
    }
  };
}

// The main page component
export default async function PostPage({ params }: PostPageProps) {
  // Fetch the article data using the slug from the URL
  const post = await fetchPost(params.slug);

  // If the article doesn't exist, show a 404 page
  if (!post) {
    notFound();
  }

  // Fetch related articles
  const relatedPosts = await fetchRelatedPosts(post.id, 3);

  // Return the page content
  return (
    <>
      {/* Display the full article */}
      <FullArticle post={post} />

      {/* Container for related articles and back link */}
      <div className="max-w-3xl mx-auto px-4">
        {/* Display related articles */}
        <RelatedArticles posts={relatedPosts} />

        {/* Back link to homepage */}
        <div className="mt-8 pb-8">
          <Link href="/" className="text-georgian-red hover:underline inline-block">
            ← Back to all articles
          </Link>
        </div>
      </div>
    </>
  );
}
```

This page demonstrates several important Next.js routing concepts:

1. **Dynamic Routes**: The `[slug]` in the folder name creates a dynamic route
   - The folder structure `/app/post/[slug]/` creates URLs like `/post/article-name`
   - The `params` object contains the dynamic parts of the URL
   - In this case, `params.slug` will contain whatever value is in the URL

2. **Metadata Generation**: The `generateMetadata` function creates dynamic SEO data
   - It runs at build time or request time to generate page metadata
   - It can use the same parameters as the page component
   - It can fetch data and use it to create appropriate titles and descriptions

3. **404 Handling**: The `notFound()` function shows a 404 page when content isn't found
   - It's a built-in Next.js function that renders a not-found page
   - You can customize the not-found page by creating a `not-found.tsx` file

4. **Server Components**: This page is a server component (no "use client" directive)
   - It can directly use `async/await` for data fetching
   - The data fetching happens on the server, not in the browser
   - This improves performance and SEO

## Metadata

Next.js 13+ provides a powerful metadata system that helps with SEO (Search Engine Optimization) and social media sharing. This makes your website more discoverable and attractive when shared online.

### Static Metadata (Root Layout)

Static metadata is defined once and applies to all pages. It's typically set in the root layout file:

```tsx
// In app/layout.tsx
import type { Metadata } from 'next'

// Define metadata for the entire site
export const metadata: Metadata = {
  // Basic metadata
  title: 'ジョージアニュース',  // Title shown in browser tabs
  description: 'ジョージアの最近のニュースを日本人の方向けて日本語でお届け',  // Description for search engines

  // OpenGraph metadata (for Facebook, LinkedIn, etc.)
  openGraph: {
    title: 'ジョージアニュース',
    description: 'ジョージアの最近のニュースを日本人の方向けて日本語でお届け',
    type: 'website'  // Type of content (website, article, etc.)
  },

  // Twitter metadata
  twitter: {
    card: 'summary',  // Type of Twitter card
    title: 'ジョージアニュース',
    description: 'ジョージアの最近のニュースを日本人の方向けて日本語でお届け'
  }
}
```

This metadata:
- Sets the title that appears in browser tabs
- Provides a description for search engine results
- Configures how the site appears when shared on social media
- Applies to all pages unless overridden

### Dynamic Metadata (Post Page)

Dynamic metadata changes based on the content of each page. For article pages, we generate unique metadata for each article:

```tsx
// In app/post/[slug]/page.tsx
import { Metadata } from 'next';

// Generate metadata based on the article content
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  // Fetch the article data
  const post = await fetchPost(params.slug);

  // If article not found, return generic metadata
  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    };
  }

  // Get title and description from the article
  // Use the article title and excerpt if no specific meta fields exist
  const metaTitle = post.meta?.title || post.title.rendered;
  const metaDescription = post.meta?.description ||
    post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 155) + '...';

  // Return complete metadata object
  return {
    // Basic metadata
    title: metaTitle,
    description: metaDescription,

    // OpenGraph metadata for social sharing
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'article',  // This is an article, not a website
      publishedTime: post.date,  // When the article was published
      authors: [post._embedded?.author?.[0]?.name || 'Anonymous']  // Author information
    },

    // Twitter card metadata
    twitter: {
      card: 'summary_large_image',  // Larger image preview
      title: metaTitle,
      description: metaDescription
    }
  };
}
```

This dynamic metadata system:
1. **Improves SEO**: Each page has unique, relevant metadata
2. **Enhances Social Sharing**: When articles are shared on social media, they display with proper titles and descriptions
3. **Provides Fallbacks**: If specific metadata isn't available, it falls back to content from the article
4. **Handles Edge Cases**: Returns appropriate metadata even when articles aren't found

## Styling with Tailwind CSS

This project uses Tailwind CSS, a utility-first CSS framework that lets you style elements directly in your HTML/JSX. Instead of writing separate CSS files, you apply pre-defined classes directly to your elements.

### Tailwind Configuration (`tailwind.config.js`)

The Tailwind configuration file customizes how Tailwind works in your project:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Files to scan for class names
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',  // Scan all files in the app directory
    './pages/**/*.{js,ts,jsx,tsx,mdx}',  // Scan all files in the pages directory
    './components/**/*.{js,ts,jsx,tsx,mdx}',  // Scan all files in the components directory
  ],

  // Theme customization
  theme: {
    extend: {
      colors: {
        // Add a custom color for the Georgian flag
        'georgian-red': '#DA291C',
      },
    },
  },

  // Additional plugins
  plugins: [
    // Add the typography plugin for styling article content
    require('@tailwindcss/typography'),
  ],

  // Future options
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
}
```

This configuration:
1. **Defines which files to scan** for Tailwind classes
2. **Adds custom colors** like the Georgian flag red
3. **Includes the typography plugin** for styling article content
4. **Sets optimization options** for better performance

### Utility Classes

Tailwind uses small, single-purpose utility classes that you combine to create your designs. Here are examples from the project:

#### Layout Classes
```jsx
<main className="max-w-4xl mx-auto px-4 py-8">
  {/* Content here */}
</main>
```
- `max-w-4xl`: Maximum width of 56rem (896px)
- `mx-auto`: Center horizontally with auto margins
- `px-4`: Horizontal padding of 1rem (16px)
- `py-8`: Vertical padding of 2rem (32px)

#### Typography Classes
```jsx
<h1 className="text-3xl font-bold text-gray-900">
  Article Title
</h1>
```
- `text-3xl`: Font size of 1.875rem (30px)
- `font-bold`: Bold font weight
- `text-gray-900`: Very dark gray text color

#### Spacing Classes
```jsx
<div className="mt-2 mb-8 gap-2">
  {/* Content here */}
</div>
```
- `mt-2`: Margin top of 0.5rem (8px)
- `mb-8`: Margin bottom of 2rem (32px)
- `gap-2`: Gap of 0.5rem (8px) between grid/flex items

#### Color Classes
```jsx
<div className="bg-white">
  <span className="text-georgian-red">Georgian Red Text</span>
  <p className="text-gray-600">Gray Text</p>
</div>
```
- `text-georgian-red`: Text color using our custom Georgian red
- `bg-white`: White background
- `text-gray-600`: Medium gray text color

#### Border Classes
```jsx
<div className="border-l-4 border-georgian-red rounded-lg">
  {/* Content here */}
</div>
```
- `border-l-4`: Left border with width of 4px
- `border-georgian-red`: Border color using our custom Georgian red
- `rounded-lg`: Large border radius (0.5rem/8px)

#### Effect Classes
```jsx
<a className="shadow-sm hover:underline transition-colors">
  Link text
</a>
```
- `shadow-sm`: Small shadow effect
- `hover:underline`: Underline text on hover
- `transition-colors`: Smooth transition for color changes

#### Responsive Design Classes
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
  {/* Grid items */}
</div>
```
- `grid-cols-1`: 1 column by default (mobile)
- `sm:grid-cols-2`: 2 columns on small screens and up
- `md:grid-cols-3`: 3 columns on medium screens and up

The beauty of Tailwind is that you can see all the styling directly in your component code, making it easier to understand and modify without jumping between files.

## Server and Client Components

Next.js 13+ introduces a powerful concept: Server Components and Client Components. Understanding the difference is key to building efficient Next.js applications.

### Server Components

Server Components run only on the server and send HTML to the browser. They are the default in Next.js 13+.

```tsx
// This is a Server Component (no "use client" directive)
export default async function ArticlePage({ params }) {
  // Can directly use async/await for data fetching
  const article = await fetchArticle(params.slug);

  // Return JSX that will be rendered to HTML on the server
  return (
    <article>
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
    </article>
  );
}
```

Server Components have these advantages:
1. **Direct Data Access**: Can connect to databases and APIs directly
2. **Async/Await Support**: Can use `async/await` for data fetching
3. **Smaller Bundle Size**: Their code doesn't get sent to the browser
4. **Initial Load Performance**: Content is pre-rendered on the server
5. **SEO Friendly**: Search engines see fully rendered content

But they have limitations:
1. **No Browser APIs**: Can't use `window`, `document`, etc.
2. **No React Hooks**: Can't use `useState`, `useEffect`, etc.
3. **No Event Handlers**: Can't use `onClick`, `onChange`, etc.

### Client Components

Client Components run in the browser and enable interactivity. You mark them with the `"use client"` directive.

```tsx
"use client"  // This marks it as a Client Component

import { useState } from 'react';

export default function LikeButton({ initialLikes }) {
  // Can use React hooks
  const [likes, setLikes] = useState(initialLikes);

  // Can use event handlers
  function handleClick() {
    setLikes(likes + 1);
  }

  // Return interactive JSX
  return (
    <button onClick={handleClick}>
      Like ({likes})
    </button>
  );
}
```

Client Components have these advantages:
1. **Interactivity**: Can respond to user actions
2. **Browser APIs**: Can access `window`, `document`, etc.
3. **React Hooks**: Can use `useState`, `useEffect`, etc.
4. **Event Handlers**: Can use `onClick`, `onChange`, etc.

But they have trade-offs:
1. **Larger Bundle Size**: Their code is sent to the browser
2. **Hydration Cost**: Extra processing to make static HTML interactive
3. **No Direct Data Access**: Need to use API routes or props for data

### Combining Server and Client Components

The real power comes from using both types together:

```tsx
// Server Component (default)
export default async function ArticlePage({ params }) {
  // Fetch data on the server
  const article = await fetchArticle(params.slug);
  const initialLikes = await fetchLikes(params.slug);

  return (
    <article>
      <h1>{article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: article.content }} />

      {/* Use a Client Component for interactive parts */}
      <LikeButton initialLikes={initialLikes} articleId={article.id} />
    </article>
  );
}
```

This pattern gives you the best of both worlds:
1. **Server-side data fetching** for the main content
2. **Client-side interactivity** only where needed
3. **Smaller bundle sizes** by keeping most code on the server
4. **Better performance** by reducing client-side JavaScript

In the ジョージア ニュース project, we use Server Components for pages and data fetching, and Client Components only for interactive elements like the pagination controls.
