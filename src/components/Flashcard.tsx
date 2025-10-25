'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Word {
  id: number;
  turkish: string;
  english: string;
  level: string;
}

interface FlashcardProps {
  word: Word;
  onAnswer: (wordId: number, isCorrect: boolean, userAnswer?: string) => void;
  style?: React.CSSProperties;
}

export default function Flashcard({ word, onAnswer, style }: FlashcardProps) {
  const [showFront, setShowFront] = useState(Math.random() > 0.5); // Rastgele TR veya EN
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const correctAnswer = showFront ? word.english : word.turkish;
  const questionText = showFront ? word.turkish : word.english;
  const questionLanguage = showFront ? 'Türkçe' : 'English';
  const answerLanguage = showFront ? 'English' : 'Türkçe';

  const handleSubmit = () => {
    if (userAnswer.trim() === '') return;
    
    const isAnswerCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    
    // Sadece doğru cevap verildiğinde sonucu göster
    if (isAnswerCorrect) {
      setShowResult(true);
      setScore(100);
    } else {
      // Yanlış cevap verildiğinde sadece puanı sıfırla ve sonraki karta geç
      setScore(0);
      onAnswer(word.id, false, userAnswer);
    }
  };

  const handleSkip = () => {
    setShowResult(true);
    setScore(0);
    setIsCorrect(false); // Bilmiyorum = boş olarak işaretle
    // Boş cevap olarak işaretle (yanlış değil)
    onAnswer(word.id, false, ''); // Boş string = bilmiyorum
  };

  const handleNext = () => {
    onAnswer(word.id, isCorrect, userAnswer);
    // Reset for next card
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setScore(0);
    setShowFront(Math.random() > 0.5);
  };

  return (
    <motion.div
      style={style}
      className="absolute"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative w-[85vw] max-w-[380px] h-[360px] sm:h-[400px] md:h-[440px]">
        <motion.div
          className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col text-white"
          animate={{ 
            background: showResult 
              ? (isCorrect 
                  ? 'linear-gradient(135deg, #10b981, #059669, #047857)' 
                  : 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)')
              : 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)'
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs sm:text-sm font-medium uppercase tracking-wide opacity-70">
              {questionLanguage}
            </div>
            {showResult && (
              <div className="flex items-center gap-2">
                <div className={`text-xl sm:text-2xl ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                  {isCorrect ? '✓' : '✗'}
                </div>
                <div className="text-base sm:text-lg font-bold">
                  {score} puan
                </div>
              </div>
            )}
          </div>

          {/* Question */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-0">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8 break-words">
              {questionText}
            </div>
            
            {!showResult ? (
              <div className="w-full">
                <div className="text-xs sm:text-sm opacity-70 mb-3 text-center">
                  {answerLanguage} çevirisini yazın:
                </div>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 text-center text-lg sm:text-xl focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder={`${answerLanguage} yazın...`}
                  autoFocus
                />
              </div>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center max-w-full px-2"
                >
                  <div className="text-xl sm:text-2xl font-bold mb-3">
                    {isCorrect ? '🎉 Doğru!' : '❌ Yanlış'}
                  </div>
                  <div className="text-lg sm:text-xl mb-3 break-words">
                    Doğru cevap: <span className="font-bold">{correctAnswer}</span>
                  </div>
                  {!isCorrect && userAnswer && (
                    <div className="text-base sm:text-lg opacity-80 mb-3 break-words">
                      Senin cevabın: <span className="font-bold">{userAnswer}</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto pt-4">
            {!showResult ? (
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm sm:text-base font-semibold transition-colors"
                >
                  Kontrol Et
                </button>
                <button
                  onClick={handleSkip}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm sm:text-base font-semibold transition-colors whitespace-nowrap"
                >
                  Bilmiyorum
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm sm:text-base font-semibold transition-colors"
              >
                Sonraki Kelime →
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

