'use client';

import { useEffect } from 'react';

export default function DataUriFavicon() {
  useEffect(() => {
    try {
      // Only run this on the client side
      if (typeof document !== 'undefined') {
        // Simple red square favicon as data URI
        const faviconDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABFUlEQVR4nO2XMU7DQBBF3xIJIVGkpKGiQlyAK3AFTsEJOAJH4ApcgSNQUVJSIEQRUvxoVrKQYzxrr+3dBvZLo9HK8r5nPDtjsCxLSQtwCzwBH8A3sAFegUdgWsrADFgDUeN6B+5KGHgBDsDFifsXYJHbwDPw9wfxmPUqp4FrYNdDPGbdDDXQiMcZxGPWbR8DV8BnRvGYdQWM+hh4G0g8Zr3/ZWAErIYUb7Fuu5roLOA9MBnwzidN1l1nE10FvKSAeIv10sVEFwHPKSLe4nmIiTYBTykk3uJpkIlTAh5STLzFw1kTbQIWKSfe4vn0y6hZwH3KiR+57zTRJuAuxcSP3HeaaBNwm1LiMQvgG/gCPoEfYJ5S4hZLFf4BanIqWdU9BcIAAAAASUVORK5CYII=';
        
        // Create icon link with data URI
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = faviconDataUri;
        document.head.appendChild(link);
      }
    } catch (error) {
      console.error('Error adding data URI favicon:', error);
    }
    
    // No cleanup function to avoid errors
    return undefined;
  }, []);
  
  return null;
}
