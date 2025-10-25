export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center gap-8 p-8 max-w-4xl">
        <h1 className="text-6xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Next.js Projesine Hoş Geldiniz
        </h1>
        
        <p className="text-xl text-gray-700 dark:text-gray-300 text-center max-w-2xl">
          Modern, hızlı ve güçlü web uygulamaları oluşturmak için hazır!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-3 text-blue-600 dark:text-blue-400">
              ⚡ Hızlı
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Next.js ile optimize edilmiş performans ve hızlı sayfa yüklemeleri
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">
              🎨 Modern
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tailwind CSS ile güzel ve responsive tasarımlar
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <h2 className="text-2xl font-semibold mb-3 text-purple-600 dark:text-purple-400">
              🔧 TypeScript
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tip güvenliği ile daha az hata, daha iyi geliştirme deneyimi
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Dokümantasyon
          </a>
          <a
            href="https://nextjs.org/learn"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Öğren
          </a>
        </div>
      </main>

      <footer className="mt-16 pb-8 text-gray-600 dark:text-gray-400">
        <p>Next.js 15 • React 18 • TypeScript • Tailwind CSS</p>
      </footer>
    </div>
  );
}
