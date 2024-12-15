import Link from 'next/link';

export default function Navbar() {
  return (
    <>
      <nav className="bg-gray-800 py-1 text-white">
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-bold mb-1">家計簿アプリ</h1>
        </div>
      </nav>
      <footer className="fixed bottom-0 left-0 w-full bg-gray-800 py-2 text-white">
        <div className="flex justify-between max-w-md mx-auto">
          <Link
            href="/register"
            className="flex-1 mx-1 px-3 py-2 bg-blue-600 rounded text-center text-white hover:bg-blue-700 text-sm"
          >
            登録
          </Link>
          <Link
            href="/analysis"
            className="flex-1 mx-1 px-3 py-2 bg-blue-600 rounded text-center text-white hover:bg-blue-700 text-sm"
          >
            グラフ
          </Link>
        </div>
      </footer>
    </>
  );
}
