import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ジョージア🇬🇪ニュース',
  description: 'ジョージアの最近のニュースを日本人の方向けて日本語でお届け',
  openGraph: {
    title: 'ジョージア🇬🇪ニュース',
    description: 'ジョージアの最近のニュースを日本人の方向けて日本語でお届け',
    type: 'website'
  },
  twitter: {
    card: 'summary',
    title: 'ジョージア🇬🇪ニュース',
    description: 'ジョージアの最近のニュースを日本人の方向けて日本語でお届け'
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
