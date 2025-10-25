'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
  const level = params.level as string;

  const [allWords, setAllWords] = useState<Word[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctWords, setCorrectWords] = useState<Word[]>([]);
  const [incorrectWords, setIncorrectWords] = useState<Word[]>([]);
  const [retryWords, setRetryWords] = useState<Word[]>([]);
  const [retryCorrectWords, setRetryCorrectWords] = useState<Word[]>([]);
  const [skipWords, setSkipWords] = useState<Word[]>([]); // Bilmiyorum kelimeleri
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [isRetryMode, setIsRetryMode] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await fetch(`/api/words/${level}`);
        if (!response.ok) {
          throw new Error('Kelimeler yüklenemedi');
        }
        const data = await response.json();
        setAllWords(data);
        setWords(data);
        setLoading(false);
      } catch (error) {
        console.error('Kelimeler yüklenirken hata:', error);
        setLoading(false);
      }
    };

    fetchWords();
  }, [level]);

  const handleAnswer = async (wordId: number, isCorrect: boolean, userAnswer?: string) => {
    const word = words.find(w => w.id === wordId);
    if (!word) return;

    // Puan hesaplama
    const points = isCorrect ? 100 : 0;
    setTotalScore(prev => prev + points);

    // Kelimeleri kategorilere ayır
    if (isCorrect) {
      if (isRetryMode) {
        setRetryCorrectWords([...retryCorrectWords, word]);
      } else {
        setCorrectWords([...correctWords, word]);
      }
      // Doğru cevaplanan kelimeyi diğer listelerden çıkar
      setIncorrectWords(prev => prev.filter(w => w.id !== word.id));
      setSkipWords(prev => prev.filter(w => w.id !== word.id));
    } else {
      // Yanlış cevap veya bilmiyorum
      if (userAnswer === '') {
        // Bilmiyorum butonuna basıldı
        setSkipWords([...skipWords, word]);
      } else {
        // Yanlış cevap verildi
        setIncorrectWords([...incorrectWords, word]);
        if (!isRetryMode) {
          setRetryWords([...retryWords, word]);
        }
      }
    }

    // Progress kaydet
    if (user) {
      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId: user.id,
            wordId, 
            isCorrect, 
            userAnswer 
          }),
        });
      } catch (error) {
        console.error('Progress kaydedilirken hata:', error);
      }
    }

    // Sonraki karta geç
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleRoundComplete();
    }
  };

  const saveLevelProgress = async (completed: boolean) => {
    if (!user) return;

    try {
      const response = await fetch('/api/level-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          level: level.toUpperCase(),
          score: totalScore,
          completed,
        }),
      });

      if (response.ok) {
        console.log('Seviye ilerlemesi başarıyla kaydedildi:', { level: level.toUpperCase(), completed, score: totalScore });
      }

      return response.ok;
    } catch (error) {
      console.error('Seviye ilerlemesi kaydedilirken hata:', error);
      return false;
    }
  };

  const handleRoundComplete = () => {
    const PASSING_SCORE = 700; // Geçme puanı
    const hasPassingScore = totalScore >= PASSING_SCORE;

    // Bilmiyorum kelimeleri ÖNE çıkmalı, sonra yanlış kelimeler
    const skipWordsArray = Array.from(skipWords);
    const incorrectWordsArray = Array.from(incorrectWords);

    // Duplikatları temizle (bir kelime hem skipWords hem incorrectWords'te olabilir)
    const seenIds = new Set<number>();
    const wordsToRetry: Word[] = [];

    // Bilmiyorum kelimeleri önce ekle (ÖNE)
    for (const word of skipWordsArray) {
      if (!seenIds.has(word.id)) {
        wordsToRetry.push(word);
        seenIds.add(word.id);
      }
    }

    // Yanlış kelimeleri sonra ekle
    for (const word of incorrectWordsArray) {
      if (!seenIds.has(word.id)) {
        wordsToRetry.push(word);
        seenIds.add(word.id);
      }
    }

    // 700 puan ve üzeri: Kullanıcı seviyeyi geçebilir
    if (hasPassingScore && wordsToRetry.length === 0) {
      // 700+ puan ve tüm kelimeler doğru - Mükemmel!
      setIsComplete(true);
      saveLevelProgress(true); // Geçti
    } else if (hasPassingScore && wordsToRetry.length > 0) {
      // 700+ puan ama bazı kelimeler yanlış/bilmiyorum - Geçti ama mükemmel değil
      setIsComplete(true);
      saveLevelProgress(true); // Geçti
    } else if (wordsToRetry.length > 0) {
      // 700 puanın altında ve yanlış/bilmiyorum var - Tekrar göster
      setWords([...wordsToRetry]);
      setCurrentIndex(0);
      setIncorrectWords([]);
      setSkipWords([]);
      setRetryWords([]);
      setIsRetryMode(true);
    } else {
      // 700 puanın altında ama tüm kelimeler doğru - Seviye tamamlandı ama geçemedi
      setIsComplete(true);
      saveLevelProgress(false); // Geçemedi
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCorrectWords([]);
    setIncorrectWords([]);
    setRetryWords([]);
    setRetryCorrectWords([]);
    setSkipWords([]);
    setTotalScore(0);
    setIsComplete(false);
    setIsRetryMode(false);
    setWords(allWords);
  };


  const handleBackToHome = () => {
    // Ana sayfaya geri dön ve ilerleme bilgisini yenile
    router.push('/');
    router.refresh(); // Sayfayı yenile
  };

  const getNextLevel = (currentLevel: string) => {
    switch (currentLevel.toUpperCase()) {
      case 'A1': return 'A2';
      case 'A2': return 'B1';
      case 'B1': return null; // Son seviye
      default: return null;
    }
  };

  const handleNextLevel = async () => {
    const nextLevel = getNextLevel(level);
    if (nextLevel) {
      // Seviye ilerlemesinin kaydedildiğinden emin ol
      await saveLevelProgress(true);
      // Kısa bir gecikme ekle ki API isteği tamamlansın
      setTimeout(() => {
        router.push(`/learn/${nextLevel}`);
      }, 100);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">Kelimeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (allWords.length === 0) {
    return (
      <div className="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-4">
        <div className="text-center">
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-4">Bu seviye için kelime bulunamadı.</p>
          <button
            onClick={handleBackToHome}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const totalWords = allWords.length;
    const nextLevel = getNextLevel(level);
    const PASSING_SCORE = 700;
    const hasPassed = totalScore >= PASSING_SCORE;

    return (
      <div className="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-lg w-full text-center max-h-[95vh] overflow-y-auto"
        >
          <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">
            {hasPassed ? '🏆' : '📚'}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {hasPassed ? 'Tebrikler! 🎉' : 'Seviye Tamamlandı'}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
            {level.toUpperCase()} seviyesi {hasPassed ? 'başarıyla' : ''} tamamlandı
          </p>

          {/* Sonraki Seviye Butonu - Sadece 700+ puan varsa */}
          {nextLevel && hasPassed && (
            <div className="mb-6 animate-bounce">
              <button
                onClick={handleNextLevel}
                className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white text-lg sm:text-xl font-bold rounded-2xl transition-all transform hover:scale-105 shadow-2xl border-4 border-green-300 dark:border-green-700"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <span>{nextLevel} Seviyesine Geç</span>
                  <span className="text-2xl">→</span>
                </div>
              </button>
            </div>
          )}

          {/* Puan Durumu */}
          {hasPassed ? (
            <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border-2 border-green-300 dark:border-green-700">
              <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                ✨ Mükemmel! ✨
              </div>
              <div className="text-sm sm:text-base text-green-700 dark:text-green-300 mb-3">
                {totalScore} puan aldınız! (Geçme puanı: {PASSING_SCORE})
              </div>
              {nextLevel && (
                <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-semibold bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 sm:p-3">
                  🚀 {nextLevel} seviyesi şimdi açıldı!
                </div>
              )}
              {!nextLevel && (
                <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-semibold bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 sm:p-3">
                  🌟 Tüm seviyeleri tamamladınız! Harikasınız!
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl border-2 border-orange-300 dark:border-orange-700">
              <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                ⚠️ Seviyeyi Geçemediniz
              </div>
              <div className="text-sm sm:text-base text-orange-700 dark:text-orange-300 mb-3">
                {totalScore} / {PASSING_SCORE} puan aldınız
              </div>
              <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-semibold bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 sm:p-3">
                💪 Tekrar deneyin ve {PASSING_SCORE} puanı geçin!
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 sm:p-4 md:p-5">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
                {totalWords}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Toplam Kelime</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 sm:p-4 md:p-5">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                {totalScore}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Toplam Puan</div>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base font-semibold rounded-lg transition-colors"
            >
              🔄 Tekrar Çöz
            </button>
            <button
              onClick={handleBackToHome}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm sm:text-base font-semibold rounded-lg transition-colors"
            >
              🏠 Ana Sayfa
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <button
            onClick={handleBackToHome}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors text-sm"
          >
            ← Geri
          </button>
          <div className="text-center flex-1">
            <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {level.toUpperCase()} Seviyesi
            </div>
            {isRetryMode && (
              <div className="text-[10px] sm:text-xs text-orange-600 dark:text-orange-400 font-medium mt-0.5">
                🔄 Tekrar Modu
              </div>
            )}
          </div>
          <div className="w-12 sm:w-16" /> {/* Spacer */}
        </div>

        <div className="max-w-2xl mx-auto">
          <ProgressBar
            current={isRetryMode ? retryCorrectWords.length : correctWords.length}
            total={words.length}
            correct={isRetryMode ? retryCorrectWords.length : correctWords.length}
            incorrect={incorrectWords.length + skipWords.length}
            score={totalScore}
          />
        </div>
      </div>

      {/* Flashcards - Flex-1 ile ortalanmış */}
      <div className="flex-1 flex items-center justify-center px-4 min-h-0">
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {words.slice(currentIndex, currentIndex + 3).reverse().map((word, index) => {
              const actualIndex = currentIndex + (2 - index);
              const offset = (2 - index) * 6;
              const scale = 1 - (2 - index) * 0.04;
              
              return (
                <Flashcard
                  key={`${isRetryMode ? 'retry' : 'normal'}-${word.id}-${currentIndex}`}
                  word={word}
                  onAnswer={handleAnswer}
                  style={{
                    zIndex: words.length - actualIndex,
                    transform: `scale(${scale}) translateY(${offset}px)`,
                  }}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Kumbara - Sabit alt kısım */}
      <div className="flex-shrink-0">
        <PiggyBank 
          correctWords={isRetryMode ? retryCorrectWords : correctWords} 
          incorrectWords={incorrectWords} 
        />
      </div>
    </div>
  );
}

