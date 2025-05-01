import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GoogleAnalyticsProvider } from './providers'
import Favicon from '@/components/Favicon'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🇬🇪 ジョージア ニュース',
  description: '🇬🇪 ジョージア（旧グルジア）の最新ニュース・政治・経済・社会情報を日本語で毎日お届け。信頼性の高いジョージアメディアから厳選した記事を日本語に翻訳してお届けする唯一の日本語ニュースサイト。',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon/safari-pinned-tab.svg',
        color: '#da291c'
      }
    ]
  },
  openGraph: {
    title: '🇬🇪 ジョージア ニュース',
    description: '🇬🇪 ジョージア（旧グルジア）の最新ニュース・政治・経済・社会情報を日本語で毎日お届け。信頼性の高いジョージアメディアから厳選した記事を日本語に翻訳してお届けする唯一の日本語ニュースサイト。',
    type: 'website',
    images: [
      {
        url: 'https://www.georgia-news-japan.online/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '🇬🇪 ジョージア ニュース',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '🇬🇪 ジョージア ニュース',
    description: '🇬🇪 ジョージア（旧グルジア）の最新ニュース・政治・経済・社会情報を日本語で毎日お届け。信頼性の高いジョージアメディアから厳選した記事を日本語に翻訳してお届けする唯一の日本語ニュースサイト。',
    images: ['https://www.georgia-news-japan.online/og-image.jpg'],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <Favicon />
      <body className={`${inter.className} bg-gray-100`}>
        <GoogleAnalyticsProvider>
          <div className="min-h-screen">
            {children}
          </div>
        </GoogleAnalyticsProvider>
      </body>
    </html>
  )
}
