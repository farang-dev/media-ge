import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🇬🇪 ジョージア ニュース',
  description: 'ジョージアの最近のニュースを日本人の方向けて日本語でお届け',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: '🇬🇪 ジョージア ニュース',
    description: 'ジョージアの最近のニュースを日本人の方向けて日本語でお届け',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '🇬🇪 ジョージア ニュース',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '🇬🇪 ジョージア ニュース',
    description: 'ジョージアの最近のニュースを日本人の方向けて日本語でお届け',
    images: ['/og-image.jpg'],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
