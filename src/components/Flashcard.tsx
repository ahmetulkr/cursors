'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface Word {
  id: number;
  turkish: string;
  english: string;
  level: string;
}

interface FlashcardProps {
  word: Word;
  onSwipe: (wordId: number, isCorrect: boolean) => void;
  style?: React.CSSProperties;
}

export default function Flashcard({ word, onSwipe, style }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFront, setShowFront] = useState(Math.random() > 0.5); // Rastgele TR veya EN
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      // Sola kaydırma = Doğru
      // Sağa kaydırma = Yanlış
      const isCorrect = info.offset.x < 0;
      onSwipe(word.id, isCorrect);
    } else {
      // Eşik değerine ulaşılmadı, kartı geri getir
      x.set(0);
    }
  };

  const handleClick = () => {
    if (Math.abs(x.get()) < 10) { // Sadece sürüklemiyorsa
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        ...style,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute cursor-grab active:cursor-grabbing"
      whileTap={{ scale: 1.05 }}
    >
      <motion.div
        className="relative w-[340px] h-[480px] md:w-[400px] md:h-[540px]"
        onClick={handleClick}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Ön Yüz */}
        <div
          className="absolute inset-0 backface-hidden rounded-3xl shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-8 flex flex-col items-center justify-center text-white">
            <div className="text-sm font-medium uppercase tracking-wide opacity-70 mb-4">
              {showFront ? 'Türkçe' : 'English'}
            </div>
            <div className="text-5xl md:text-6xl font-bold text-center mb-8">
              {showFront ? word.turkish : word.english}
            </div>
            <div className="text-sm opacity-70 mt-auto">
              Kartı çevirmek için tıklayın
            </div>
          </div>
        </div>

        {/* Arka Yüz */}
        <div
          className="absolute inset-0 backface-hidden rounded-3xl shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-3xl p-8 flex flex-col items-center justify-center text-white">
            <div className="text-sm font-medium uppercase tracking-wide opacity-70 mb-4">
              {showFront ? 'English' : 'Türkçe'}
            </div>
            <div className="text-5xl md:text-6xl font-bold text-center mb-8">
              {showFront ? word.english : word.turkish}
            </div>
            <div className="text-sm opacity-70 mt-auto">
              Sola kaydır = Doğru, Sağa kaydır = Yanlış
            </div>
          </div>
        </div>
      </motion.div>

      {/* Swipe İpuçları */}
      <motion.div
        className="absolute -left-20 top-1/2 -translate-y-1/2 text-green-500 text-6xl font-bold"
        style={{ opacity: useTransform(x, [-150, 0], [1, 0]) }}
      >
        ✓
      </motion.div>
      <motion.div
        className="absolute -right-20 top-1/2 -translate-y-1/2 text-red-500 text-6xl font-bold"
        style={{ opacity: useTransform(x, [0, 150], [0, 1]) }}
      >
        ✗
      </motion.div>
    </motion.div>
  );
}

