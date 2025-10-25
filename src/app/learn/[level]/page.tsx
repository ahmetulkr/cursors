'use client';

import { useState, useEffect, useMemo } from 'react';
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
  const [currentScore, setCurrentScore] = useState(0);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [initialIncorrectCount, setInitialIncorrectCount] = useState(0);

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
    setCurrentScore(points);
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
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wordId, isCorrect, userAnswer }),
      });
    } catch (error) {
      console.error('Progress kaydedilirken hata:', error);
    }

    // Sonraki karta geç
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleRoundComplete();
    }
  };

  const handleSkip = (wordId: number) => {
    const word = words.find(w => w.id === wordId);
    if (!word) return;

    // Bilmiyorum kelimelerini ayrı takip et
    setSkipWords([...skipWords, word]);
    
    // Sonraki karta geç
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleRoundComplete();
    }
  };

  const handleRoundComplete = () => {
    if (isRetryMode) {
      // Tekrar turu bitti, hala yanlış veya bilmiyorum kelimeler var mı kontrol et
      const stillIncorrect = incorrectWords.filter(word => 
        !correctWords.some(correct => correct.id === word.id) &&
        !retryCorrectWords.some(correct => correct.id === word.id)
      );
      const stillSkipped = skipWords.filter(word => 
        !correctWords.some(correct => correct.id === word.id) &&
        !retryCorrectWords.some(correct => correct.id === word.id)
      );
      
      if (stillIncorrect.length > 0 || stillSkipped.length > 0) {
        // Hala yanlış veya bilmiyorum kelimeler var, tekrar et
        const wordsToRetry = [...stillIncorrect, ...stillSkipped];
        setWords([...wordsToRetry]);
        setCurrentIndex(0);
        setCorrectWords([]);
        setIncorrectWords([]);
        setRetryWords([]);
        setSkipWords([]);
      } else {
        // Tüm kelimeler doğru cevaplandı
        setIsComplete(true);
      }
    } else {
      // İlk tur bitti, tekrar edilecek kelimeleri belirle
      const wordsToRetry = [...retryWords, ...skipWords];
      if (wordsToRetry.length > 0) {
        setWords([...wordsToRetry]);
        setRetryWords([]);
        setSkipWords([]);
        setCurrentIndex(0);
        setCorrectWords([]);
        setIncorrectWords([]);
        setIsRetryMode(true);
      } else {
        setIsComplete(true);
      }
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
    setCurrentScore(0);
    setIsComplete(false);
    setIsRetryMode(false);
    setInitialIncorrectCount(0);
    setWords(allWords);
  };

  const handleRetryIncorrect = () => {
    // Yanlış kartları tekrar göster
    console.log('Tekrar modu başlatılıyor. Yanlış kartlar:', incorrectWords);
    setInitialIncorrectCount(incorrectWords.length);
    setCurrentIndex(0);
    setIsComplete(false);
    setIsRetryMode(true);
    setRetryCorrectWords([]);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const getNextLevel = (currentLevel: string) => {
    switch (currentLevel.toUpperCase()) {
      case 'A1': return 'A2';
      case 'A2': return 'B1';
      case 'B1': return null; // Son seviye
      default: return null;
    }
  };

  const handleNextLevel = () => {
    const nextLevel = getNextLevel(level);
    if (nextLevel) {
      router.push(`/learn/${nextLevel}`);
    } else {
      router.push('/');
    }
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
    const totalCorrect = isRetryMode ? retryCorrectWords.length : correctWords.length;
    const totalWords = allWords.length;
    const correctPercentage = Math.round((totalCorrect / totalWords) * 100);
    const maxScore = totalWords * 100;
    const scorePercentage = Math.round((totalScore / maxScore) * 100);
    const nextLevel = getNextLevel(level);
    const isPerfectScore = correctPercentage === 100;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center"
        >
          <div className="text-6xl mb-6">{isPerfectScore ? '🏆' : '🎉'}</div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isPerfectScore ? 'Mükemmel!' : 'Tebrikler!'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            {isPerfectScore 
              ? `${level.toUpperCase()} seviyesini başarıyla tamamladınız!`
              : `${level.toUpperCase()} seviyesini tamamladınız!`
            }
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {totalCorrect}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Doğru</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {incorrectWords.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Yanlış</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {totalScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Puan</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              %{correctPercentage}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Başarı Oranı</div>
          </div>

          <div className="mb-8">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {scorePercentage}% Puan
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Puan Oranı</div>
          </div>

          {isPerfectScore && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                🎯 Tüm kelimeleri doğru cevapladınız!
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Bu seviyeyi mükemmel bir şekilde tamamladınız
              </div>
            </div>
          )}

          {!isPerfectScore && (incorrectWords.length > 0 || skipWords.length > 0) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                Tekrar Çalışılması Gereken Kelimeler ({incorrectWords.length + skipWords.length})
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Bu kelimeleri tekrar çalışmanız önerilir
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {nextLevel && (
              <button
                onClick={handleNextLevel}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                {nextLevel} Seviyesine Geç
              </button>
            )}
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
          score={totalScore}
        />
      </div>

      {/* Flashcards */}
      <div className="relative h-[600px] flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {words.slice(currentIndex, currentIndex + 3).reverse().map((word, index) => {
            const actualIndex = currentIndex + (2 - index);
            const offset = (2 - index) * 10;
            const scale = 1 - (2 - index) * 0.05;
            
            return (
              <Flashcard
                key={`${isRetryMode ? 'retry' : 'normal'}-${word.id}-${currentIndex}`}
                word={word}
                onAnswer={handleAnswer}
                onSkip={handleSkip}
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

