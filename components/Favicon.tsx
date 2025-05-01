'use client';

import { useEffect } from 'react';

export default function Favicon() {
  useEffect(() => {
    // Generate a cache-busting version parameter
    const version = new Date().getTime();
    
    // Create and append favicon links dynamically
    const createLink = (rel: string, href: string, type?: string, sizes?: string) => {
      // Remove any existing link with the same rel
      const existingLink = document.querySelector(`link[rel="${rel}"]`);
      if (existingLink) {
        existingLink.remove();
      }
      
      // Create new link
      const link = document.createElement('link');
      link.rel = rel;
      link.href = `${href}?v=${version}`;
      if (type) link.setAttribute('type', type);
      if (sizes) link.setAttribute('sizes', sizes);
      document.head.appendChild(link);
    };
    
    // Add favicon links
    createLink('icon', '/favicon.ico');
    createLink('shortcut icon', '/favicon.ico');
    createLink('icon', '/favicon-16x16.png', 'image/png', '16x16');
    createLink('icon', '/favicon-32x32.png', 'image/png', '32x32');
    createLink('apple-touch-icon', '/apple-touch-icon.png', 'image/png', '180x180');
    
    // Add a meta tag to force search engines to update
    const meta = document.createElement('meta');
    meta.name = 'favicon-version';
    meta.content = version.toString();
    document.head.appendChild(meta);
    
    return () => {
      // Cleanup function (optional)
    };
  }, []);
  
  return null;
}
