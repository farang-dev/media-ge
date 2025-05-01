'use client';

import { useEffect } from 'react';

export default function DirectFavicon() {
  useEffect(() => {
    try {
      // Only run this on the client side
      if (typeof document !== 'undefined') {
        // Check if favicon links already exist
        if (!document.querySelector('link[rel="icon"]')) {
          // Create icon link
          const iconLink = document.createElement('link');
          iconLink.rel = 'icon';
          iconLink.href = '/favicon.ico';
          iconLink.type = 'image/x-icon';
          document.head.appendChild(iconLink);
          
          // Create shortcut icon link
          const shortcutLink = document.createElement('link');
          shortcutLink.rel = 'shortcut icon';
          shortcutLink.href = '/favicon.ico';
          shortcutLink.type = 'image/x-icon';
          document.head.appendChild(shortcutLink);
        }
      }
    } catch (error) {
      console.error('Error adding favicon:', error);
    }
    
    // No cleanup function to avoid errors
    return undefined;
  }, []);
  
  return null;
}
