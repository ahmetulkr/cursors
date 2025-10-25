'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Flashcard from '@/components/Flashcard';
import ProgressBar from '@/components/ProgressBar';
import PiggyBank from '@/components/PiggyBank';
import { motion, AnimatePresence } from 'framer-motion';

interface Word {
  id: number;
  turkish: string;
  english: string;
  level: string;
}

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const level = params.level as string;

  const [allWords, setAllWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctWords, setCorrectWords] = useState<Word[]>([]);
  const [incorrectWords, setIncorrectWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [retryCorrectWords, setRetryCorrectWords] = useState<Word[]>([]);
  const [initialIncorrectCount, setInitialIncorrectCount] = useState(0);

  // Aktif kartlar: Normal modda tüm kelimeler, tekrar modunda sadece yanlışlar
  const words = isRetryMode ? incorrectWords : allWords;

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await fetch(`/api/words/${level}`);
        if (!response.ok) {
          throw new Error('Kelimeler yüklenemedi');
        }
        const data = await response.json();
        setAllWords(data);
        setLoading(false);
      } catch (error) {
        console.error('Kelimeler yüklenirken hata:', error);
        setLoading(false);
      }
    };

    fetchWords();
  }, [level]);

  const handleSwipe = async (wordId: number, isCorrect: boolean) => {
    const word = words.find(w => w.id === wordId);
    if (!word) return;

    // Kumbaraya ekle
    if (isRetryMode) {
      // Tekrar modunda
      if (isCorrect) {
        setRetryCorrectWords([...retryCorrectWords, word]);
        // Yanlışlar listesinden çıkar
        setIncorrectWords(incorrectWords.filter(w => w.id !== word.id));
      } else {
        // Hala yanlış, listede kalsın
      }
    } else {
      // Normal mod
      if (isCorrect) {
        setCorrectWords([...correctWords, word]);
      } else {
        setIncorrectWords([...incorrectWords, word]);
      }
    }

    // Progress kaydet
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wordId, isCorrect }),
      });
    } catch (error) {
      console.error('Progress kaydedilirken hata:', error);
    }

    // Sonraki karta geç
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCorrectWords([]);
    setIncorrectWords([]);
    setIsComplete(false);
    setIsRetryMode(false);
    setRetryCorrectWords([]);
    setInitialIncorrectCount(0);
  };

  const handleRetryIncorrect = () => {
    // Yanlış kartları tekrar göster
    setInitialIncorrectCount(incorrectWords.length);
    setCurrentIndex(0);
    setIsComplete(false);
    setIsRetryMode(true);
    setRetryCorrectWords([]);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300">Kelimeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (allWords.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">Bu seviye için kelime bulunamadı.</p>
          <button
            onClick={handleBackToHome}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    if (isRetryMode) {
      // Tekrar modu tamamlandı
      const retryCorrectPercentage = Math.round((retryCorrectWords.length / initialIncorrectCount) * 100);
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center"
          >
            <div className="text-6xl mb-6">{incorrectWords.length === 0 ? '🌟' : '💪'}</div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {incorrectWords.length === 0 ? 'Mükemmel!' : 'Tekrar Tamamlandı!'}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {incorrectWords.length === 0 
                ? 'Tüm yanlış kartları doğru yaptınız!' 
                : 'Tekrar turunu tamamladınız!'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {retryCorrectWords.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Öğrenilen</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {incorrectWords.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Kalan</div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                %{retryCorrectPercentage}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">İyileşme Oranı</div>
            </div>

            <div className="flex flex-col gap-3">
              {incorrectWords.length > 0 && (
                <button
                  onClick={handleRetryIncorrect}
                  className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Kalan {incorrectWords.length} Kelimeyi Tekrar Çöz
                </button>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Baştan Başla
                </button>
                <button
                  onClick={handleBackToHome}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
                >
                  Ana Sayfa
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    // Normal mod tamamlandı
    const correctPercentage = Math.round((correctWords.length / allWords.length) * 100);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center"
        >
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tebrikler!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {level.toUpperCase()} seviyesini tamamladınız!
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {correctWords.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Doğru</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {incorrectWords.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Yanlış</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              %{correctPercentage}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Başarı Oranı</div>
          </div>

          <div className="flex flex-col gap-3">
            {incorrectWords.length > 0 && (
              <button
                onClick={handleRetryIncorrect}
                className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                <span>Yanlış {incorrectWords.length} Kelimeyi Tekrar Çöz</span>
              </button>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
              >
                Tekrar Çöz
              </button>
              <button
                onClick={handleBackToHome}
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors"
              >
                Ana Sayfa
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 pb-40">
      {/* Header */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-6">
          <button
            onClick={handleBackToHome}
            className="px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            ← Geri
          </button>
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {level.toUpperCase()} Seviyesi
            </div>
            {isRetryMode && (
              <div className="text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
                🔄 Tekrar Modu
              </div>
            )}
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>

        <ProgressBar
          current={currentIndex + 1}
          total={words.length}
          correct={isRetryMode ? retryCorrectWords.length : correctWords.length}
          incorrect={incorrectWords.length}
        />
      </div>

      {/* Flashcards */}
      <div className="relative h-[600px] flex items-center justify-center">
        <AnimatePresence>
          {words.slice(currentIndex, currentIndex + 3).reverse().map((word, index) => {
            const actualIndex = currentIndex + (2 - index);
            const offset = (2 - index) * 10;
            const scale = 1 - (2 - index) * 0.05;
            
            return (
              <Flashcard
                key={word.id}
                word={word}
                onSwipe={handleSwipe}
                style={{
                  zIndex: words.length - actualIndex,
                  scale,
                  y: offset,
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Kumbara */}
      <PiggyBank 
        correctWords={isRetryMode ? retryCorrectWords : correctWords} 
        incorrectWords={incorrectWords} 
      />
    </div>
  );
}

