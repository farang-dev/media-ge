'use client';

import { useEffect } from 'react';

interface JsonLdProps {
  data: Record<string, any>;
}

export default function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    // クライアントサイドでのみ実行
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      // Check if the script is still in the document before removing
      if (script && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [data]);

  // サーバーサイドレンダリング時には何も表示しない
  return null;
}
