// Type definitions for Google Analytics gtag.js
interface Window {
  gtag: (
    command: 'config' | 'event' | 'js' | 'set',
    targetId: string,
    config?: {
      page_path?: string;
      page_location?: string;
      page_title?: string;
      [key: string]: any;
    }
  ) => void;
  dataLayer: any[];
}
