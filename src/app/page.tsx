'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface LevelProgress {
  level: string;
  completed: boolean;
  score: number;
}

export default function Home() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [levelProgress, setLevelProgress] = useState<LevelProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const levels = [
    {
      id: 'A1',
      name: 'Başlangıç',
      description: 'Temel kelimeler ve günlük ifadeler',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      requiredLevel: null, // Her zaman açık
    },
    {
      id: 'A2',
      name: 'Temel',
      description: 'Basit fiiller ve günlük konuşma',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      requiredLevel: 'A1', // A1 tamamlanmalı
    },
    {
      id: 'B1',
      name: 'Orta',
      description: 'İleri kelimeler ve karmaşık cümleler',
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      requiredLevel: 'A2', // A2 tamamlanmalı
    },
  ];

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchLevelProgress();
    }
  }, [user, isLoading, router]);

  // Sayfa görünür olduğunda ilerleme bilgisini yeniden yükle
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchLevelProgress();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Sayfa her odaklandığında da yeniden yükle
    const handleFocus = () => {
      if (user) {
        fetchLevelProgress();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const fetchLevelProgress = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/level-progress?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setLevelProgress(data);
      }
    } catch (error) {
      console.error('İlerleme yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLevelUnlocked = (levelId: string, requiredLevel: string | null): boolean => {
    if (!requiredLevel) return true; // A1 her zaman açık
    
    const requiredProgress = levelProgress.find(p => p.level === requiredLevel);
    return requiredProgress?.completed || false;
  };

  const getLevelStatus = (levelId: string) => {
    const progress = levelProgress.find(p => p.level === levelId);
    return progress;
  };

  if (isLoading || loading) {
    return (
      <div className="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect ediliyor
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
          Merhaba, <span className="font-semibold">{user.username}</span>
        </div>
        <button
          onClick={logout}
          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
        >
          Çıkış
        </button>
      </div>

      <main className="flex flex-col items-center gap-4 sm:gap-6 w-full max-w-5xl">
        <div className="text-center space-y-2 sm:space-y-3">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Dil Öğrenme
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">
            Flashcard ile İngilizce Kelime Öğren
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full mt-4 sm:mt-6">
          {levels.map((level) => {
            const isUnlocked = isLevelUnlocked(level.id, level.requiredLevel);
            const status = getLevelStatus(level.id);

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * levels.findIndex(l => l.id === level.id) }}
              >
                {isUnlocked ? (
                  <Link href={`/learn/${level.id}`} className="group block">
                    <div className={`${level.bgColor} p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 relative`}>
                      {status?.completed && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>
                        {level.id}
                      </div>
                      <h2 className={`text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 ${level.textColor}`}>
                        {level.name}
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        {level.description}
                      </p>
                      {status && (
                        <div className="mt-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Puan: {status.score}
                        </div>
                      )}
                      <div className="mt-3 sm:mt-4 md:mt-6 flex items-center gap-2 text-xs sm:text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                        <span>{status?.completed ? 'Tekrar Çöz' : 'Başla'}</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className={`${level.bgColor} p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 relative opacity-50 cursor-not-allowed`}>
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded-2xl">
                      <div className="text-center text-white">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-semibold">
                          {level.requiredLevel} seviyesini tamamlayın
                        </p>
                      </div>
                    </div>
                    <div className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r ${level.color} bg-clip-text text-transparent`}>
                      {level.id}
                    </div>
                    <h2 className={`text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 ${level.textColor}`}>
                      {level.name}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                      {level.description}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
            Seviyeleri sırasıyla tamamlayarak ilerleyin
          </p>
        </div>
      </main>
    </div>
  );
}
