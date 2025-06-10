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
            <Link href="/georgia" className="text-gray-600 hover:text-georgian-red mx-2 my-1">
              ジョージア国情報
            </Link>
            <Link href="/georgia#history" className="text-gray-600 hover:text-georgian-red mx-2 my-1">
              ジョージアの歴史
            </Link>
            <Link href="/georgia#politics" className="text-gray-600 hover:text-georgian-red mx-2 my-1">
              ジョージアの政治
            </Link>
            <Link href="/georgia#economy" className="text-gray-600 hover:text-georgian-red mx-2 my-1">
              ジョージアの経済
            </Link>
            <Link href="/georgia#culture" className="text-gray-600 hover:text-georgian-red mx-2 my-1">
              ジョージアの文化
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
