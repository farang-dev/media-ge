import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { GoogleAnalyticsProvider } from './providers'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ジョージア ニュース - ジョージア（旧グルジア）の専門ニュースサイト',
  description: '🇬🇪 ジョージア（旧グルジア）の最新ニュース・政治・経済・社会情報を日本語で毎日お届け。信頼性の高いジョージアメディアから厳選した記事を日本語に翻訳してお届けする唯一の日本語ニュースサイト。',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: 'ジョージア ニュース - ジョージア（旧グルジア）の専門ニュースサイト',
    description: '🇬🇪 ジョージア（旧グルジア）の最新ニュース・政治・経済・社会情報を日本語で毎日お届け。信頼性の高いジョージアメディアから厳選した記事を日本語に翻訳してお届けする唯一の日本語ニュースサイト。',
    type: 'website',
    images: [
      {
        url: 'https://www.georgia-news-japan.online/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ジョージア ニュース - ジョージア（旧グルジア）の専門ニュースサイト',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ジョージア ニュース - ジョージア（旧グルジア）の専門ニュースサイト',
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
      <body className={`${inter.className} bg-gray-100`}>
        <Suspense fallback={null}>
          <GoogleAnalyticsProvider>
            {children}
          </GoogleAnalyticsProvider>
        </Suspense>
      </body>
    </html>
  )
}
