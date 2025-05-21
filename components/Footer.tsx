import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white py-6 mt-8 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-georgian-red font-bold hover:underline">
              🇬🇪 ジョージア ニュース
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              ジョージア（旧グルジア）の最新ニュースを日本語でお届け
            </p>
          </div>
          <nav className="flex flex-wrap justify-center">
            <Link href="/post/georgia-history" className="text-gray-600 hover:text-georgian-red mx-2 my-1">
              ジョージアの歴史
            </Link>
            <Link href="/sitemap" className="text-gray-600 hover:text-georgian-red mx-2 my-1">
              サイトマップ
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-georgian-red mx-2 my-1">
              お問い合わせ
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-georgian-red mx-2 my-1">
              プライバシーポリシー
            </Link>
          </nav>
        </div>
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ジョージア🇬🇪ニュース</p>
        </div>
      </div>
    </footer>
  );
}
