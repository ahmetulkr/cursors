import Link from 'next/link';

export default function Home() {
  const levels = [
    {
      id: 'A1',
      name: 'Başlangıç',
      description: 'Temel kelimeler ve günlük ifadeler',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'A2',
      name: 'Temel',
      description: 'Basit fiiller ve günlük konuşma',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'B1',
      name: 'Orta',
      description: 'İleri kelimeler ve karmaşık cümleler',
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-4">
      <main className="flex flex-col items-center gap-8 w-full max-w-5xl">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dil Öğrenme
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
            Flashcard ile İngilizce Kelime Öğren
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          {levels.map((level) => (
            <Link
              key={level.id}
              href={`/learn/${level.id}`}
              className="group"
            >
              <div className={`${level.bgColor} p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700`}>
                <div className={`text-6xl font-bold mb-4 bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>
                  {level.id}
                </div>
                <h2 className={`text-2xl font-semibold mb-3 ${level.textColor}`}>
                  {level.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {level.description}
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                  <span>Başla</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Kartları sola kaydırarak doğru, sağa kaydırarak yanlış olarak işaretleyin
          </p>
        </div>
      </main>

      <footer className="mt-16 pb-8 text-gray-500 dark:text-gray-400 text-sm">
        <p>İngilizce Öğrenme Platformu • Flashcard Sistemi</p>
      </footer>
    </div>
  );
}
