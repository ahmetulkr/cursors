'use client';

import { useState, useEffect } from 'react';
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
  onSkip: (wordId: number) => void;
  style?: React.CSSProperties;
}

export default function Flashcard({ word, onAnswer, onSkip, style }: FlashcardProps) {
  const [showFront, setShowFront] = useState(Math.random() > 0.5); // Rastgele TR veya EN
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
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
    setShowAnswer(true);
    setShowResult(true);
    
    // Puan hesaplama
    if (isAnswerCorrect) {
      setScore(100);
    } else {
      setScore(0);
    }
  };

  const handleSkip = () => {
    setShowAnswer(true);
    setShowResult(true);
    setScore(0);
  };

  const handleNext = () => {
    onAnswer(word.id, isCorrect, userAnswer);
    // Reset for next card
    setUserAnswer('');
    setShowAnswer(false);
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
      <div className="relative w-[340px] h-[480px] md:w-[400px] md:h-[540px]">
        <motion.div
          className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 flex flex-col text-white"
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
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm font-medium uppercase tracking-wide opacity-70">
              {questionLanguage}
            </div>
            {showResult && (
              <div className="flex items-center gap-2">
                <div className={`text-2xl ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                  {isCorrect ? '✓' : '✗'}
                </div>
                <div className="text-lg font-bold">
                  {score} puan
                </div>
              </div>
            )}
          </div>

          {/* Question */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-5xl md:text-6xl font-bold text-center mb-8">
              {questionText}
            </div>
            
            {!showResult ? (
              <div className="w-full max-w-sm">
                <div className="text-sm opacity-70 mb-4 text-center">
                  {answerLanguage} çevirisini yazın:
                </div>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 text-center text-xl focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder={`${answerLanguage} yazın...`}
                  autoFocus
                />
              </div>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="text-2xl font-bold mb-4">
                    {isCorrect ? '🎉 Doğru!' : '❌ Yanlış'}
                  </div>
                  <div className="text-xl mb-4">
                    Doğru cevap: <span className="font-bold">{correctAnswer}</span>
                  </div>
                  {!isCorrect && userAnswer && (
                    <div className="text-lg opacity-80 mb-4">
                      Senin cevabın: <span className="font-bold">{userAnswer}</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-auto">
            {!showResult ? (
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer.trim()}
                  className="flex-1 px-6 py-3 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors"
                >
                  Cevabı Kontrol Et
                </button>
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-colors"
                >
                  Bilmiyorum
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
              >
                Sonraki Kelime
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

